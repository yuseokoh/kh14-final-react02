import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import debounce from 'lodash.debounce';
import styles from './WishList.module.css';
import { useNavigate } from "react-router";
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState } from "../../utils/recoil";

const WishList = () => {
  const navigate = useNavigate();
  const dragItem = useRef(); // 드래그할 아이템의 인덱스
  const dragOverItem = useRef(); // 드랍할 위치의 아이템의 인덱스
  const [wishlist, setWishlist] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [cartGames, setCartGames] = useState([]); // 장바구니에 있는 게임 목록
  const [libraryGames, setLibraryGames] = useState([]); // 라이브러리에 있는 게임 목록
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);

  // 라이브러리 목록 불러오기
  const loadLibraryGames = useCallback(async () => {
    try {
      const resp = await axios.get("/library/");
      setLibraryGames(resp.data.map(game => game.gameNo)); // 라이브러리 게임의 gameNo만 저장
    } catch (error) {
      console.error("Error loading library games", error);
    }
  }, []);

  // 장바구니 목록 불러오기
  const loadCartGames = useCallback(async () => {
    try {
      const resp = await axios.get("/cart/");
      setCartGames(resp.data.map(cart => cart.gameNo)); // 장바구니 게임의 gameNo만 저장
    } catch (error) {
      console.error("Error loading cart games", error);
    }
  }, []);

  // 찜 목록 불러오기
  const loadWishlist = useCallback(async () => {
    try {
      const resp = await axios.get("http://localhost:8080/wishlist/");
      setWishlist(resp.data);
      setFilteredWishlist(resp.data);
      loadImages(resp.data);
    } catch (error) {
      console.error("Error loading wishlist", error);
    }
  }, []);

  // 이미지 로드 함수
  const loadImages = useCallback(async (wishlist) => {
    const imageMap = {};
    for (const game of wishlist) {
      try {
        const imageResp = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if (imageResp.data && imageResp.data.length > 0) {
          imageMap[game.wishListId] = `http://localhost:8080/game/download/${imageResp.data[0].attachmentNo}`;
        } else {
          imageMap[game.wishListId] = 'placeholder_image_url';
        }
      } catch (err) {
        console.error("Error loading game image", err);
        imageMap[game.wishListId] = 'placeholder_image_url';
      }
    }
    setImageUrls(imageMap);
  }, []);

  // 장바구니에 게임 추가
  const addCart = useCallback(async (game) => {
    if (cartGames.includes(game.gameNo)) {
      alert("이미 장바구니에 있는 게임입니다.");
      return;
    }
    if (libraryGames.includes(game.gameNo)) {
      alert("이미 라이브러리에 있는 게임입니다.");
      return;
    }

    try {
      await axios.post("/cart/add", game);
      setCartGames((prevCartGames) => [...prevCartGames, game.gameNo]);
      navigate("/cart/");
    } catch (error) {
      console.error("Error adding item to cart", error);
    }
  }, [cartGames, libraryGames, navigate]);

  // 찜 목록에서 게임 삭제
  const delWishList = useCallback(async (wishListId) => {
    try {
      await axios.delete(`http://localhost:8080/wishlist/${wishListId}`);
      setWishlist((prevWishlist) => prevWishlist.filter((item) => item.wishListId !== wishListId));
      setFilteredWishlist((prevFilteredWishlist) => prevFilteredWishlist.filter((item) => item.wishListId !== wishListId));
    } catch (error) {
      console.error("Error removing item from wishlist", error);
    }
  }, []);

  // 찜 목록 검색
  const searchWishlist = useCallback(() => {
    if (searchKeyword.trim() !== '') {
      const filtered = wishlist.filter((game) =>
        game.gameTitle.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      setFilteredWishlist(filtered);
    } else {
      setFilteredWishlist(wishlist);
    }
  }, [searchKeyword, wishlist]);

  const debouncedSearch = useCallback(debounce(searchWishlist, 300), [searchWishlist]);

  useEffect(() => {
    debouncedSearch();
  }, [searchKeyword, debouncedSearch]);

  useEffect(() => {
    if (login && memberId) {
      loadWishlist();
      loadCartGames(); // 장바구니 목록도 불러옴
      loadLibraryGames(); // 라이브러리 목록도 불러옴
    }
  }, [login, memberId, loadWishlist, loadCartGames, loadLibraryGames]);

  // 드래그 관련 기능
  const dragStart = (e, position) => {
    dragItem.current = position;
    e.target.style.opacity = 0.5;
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
    e.preventDefault();
  };

  const drop = (e) => {
    e.preventDefault();
    const newWishList = [...filteredWishlist];
    const dragItemValue = newWishList[dragItem.current];
    newWishList.splice(dragItem.current, 1);
    newWishList.splice(dragOverItem.current, 0, dragItemValue);
    dragItem.current = null;
    dragOverItem.current = null;
    setFilteredWishlist(newWishList);
    setWishlist(newWishList);
    e.target.style.opacity = 1;
  };

  return (
    <div className={styles.wishlist_container} style={{ minHeight: '100vh' }}>
      <h1 className={styles.wishlist_title}>
        {memberId ? `${memberId}님의 찜 목록` : '찜 목록'}
      </h1>
      <div className={styles.wishlist_search_container}>
        <input
          type="text"
          placeholder="이름 또는 태그로 검색"
          className={styles.wishlist_search}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      {filteredWishlist.length === 0 ? (
        <p className={styles.emptyWishlistMessage}>찜 목록이 비어있습니다.</p>
      ) : (
        <TransitionGroup className={styles.wishlist_game_list}>
          {filteredWishlist.map((game, index) => (
            <CSSTransition
              key={game.wishListId}
              timeout={300}
              classNames={{
                enter: styles.itemEnter,
                enterActive: styles.itemEnterActive,
                exit: styles.itemExit,
                exitActive: styles.itemExitActive,
              }}
            >
              <div
                className={styles.wishlist_game_item}
                draggable
                onDragStart={(e) => dragStart(e, index)}
                onDragEnter={(e) => dragEnter(e, index)}
                onDragEnd={drop}
                onDragOver={(e) => e.preventDefault()}
              >
                <img
                  src={imageUrls[game.wishListId] || 'placeholder_image_url'}
                  alt={game.gameTitle}
                  className={styles.gameThumbnail}
                />
                <div className={styles.wishlist_game_details} style={{ maxWidth: '75%' }}>
                <h2 
                  className={styles.wishlist_game_title}
                  onClick={() => navigate(`/game/detail/${game.gameNo}`)}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >{game.gameTitle}</h2>
                  <div className={styles.game_meta_info}>
                    <span className={styles.game_review}>종합 평가: {game.reviewSummary || '정보 없음'}</span>
                    <span className={styles.game_release}>출시일: {game.releaseDate}</span>
                  </div>
                  <div className={styles.tag_container}>
                    <span className={styles.tag}>싱글 플레이어</span>
                    <span className={styles.tag}>멀티 플레이어</span>
                  </div>
                </div>
                <div className={styles.wishlist_action_container}>
                  <div className={styles.game_price}>${game.gamePrice}</div>
                  {libraryGames.includes(game.gameNo) ? (
                    <button className={styles.wishlist_cart_button} onClick={() => navigate(`/play/${game.gameNo}`)}>플레이하기</button>
                  ) : (
                    <button className={styles.wishlist_cart_button} onClick={() => addCart(game)}>장바구니에 추가</button>
                  )}
                  <button className={styles.removeButton} onClick={() => delWishList(game.wishListId)}>제거</button>
                </div>
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      )}
    </div>
  );
};

export default WishList;
