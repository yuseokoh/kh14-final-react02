import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import debounce from 'lodash.debounce';
import styles from './WishList.module.css';
import { useNavigate, useParams } from "react-router";
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";

const WishList = () => {
  const navigate = useNavigate();
  const dragItem = useRef(); // 드래그할 아이템의 인덱스
  const dragOverItem = useRef(); // 드랍할 위치의 아이템의 인덱스
  const [wishlist, setWishlist] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // 여러 이미지 URL을 관리하기 위한 상태
  const { wishlistId } = useParams();
  // Recoil 상태 사용
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  const memberLoading = useRecoilValue(memberLoadingState);

  // 찜 목록 불러오기
  const loadWishlist = useCallback(async () => {
    const resp = await axios.get("http://localhost:8080/wishlist/");
    setWishlist(resp.data);
    setFilteredWishlist(resp.data); // 초기 필터된 리스트 설정
  }, []);

  // 장바구니에 게임 추가
  const addCart = useCallback(async (game) => {
    try {
      const resp = await axios.post("/cart/add", game);
      navigate("/cart/");
    } catch (error) {
      console.error("Error adding item to cart", error);
    }
  }, [navigate]);

  // 찜 목록에서 게임 삭제
  const delWishList = useCallback(async (wishListId) => {
    try {
      await axios.delete(`http://localhost:8080/wishlist/${wishListId}`);
      // 찜 목록에서 삭제한 아이템을 필터링하여 새로운 리스트로 상태 업데이트
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
      setFilteredWishlist(wishlist); // 검색어가 없을 경우 전체 리스트 표시
    }
  }, [searchKeyword, wishlist]);

  const debouncedSearch = useCallback(debounce(searchWishlist, 300), [searchWishlist]);

  useEffect(() => {
    debouncedSearch();
  }, [searchKeyword, debouncedSearch]);

  useEffect(() => {
    if (login && memberId) {
      loadWishlist();
    }
  }, [login, memberId, loadWishlist]);

  // 드래그 관련 기능
  const dragStart = (e, position) => {
    dragItem.current = position;
    e.target.style.opacity = 0.5; // 드래그 시작 시 불투명하게 만들기
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
    e.preventDefault(); // 드래그 오버 시 기본 동작 방지
  };

  const drop = (e) => {
    e.preventDefault(); // 드랍 시 기본 동작 방지
    const newWishList = [...filteredWishlist];
    const dragItemValue = newWishList[dragItem.current];
    newWishList.splice(dragItem.current, 1);
    newWishList.splice(dragOverItem.current, 0, dragItemValue);
    dragItem.current = null;
    dragOverItem.current = null;
    setFilteredWishlist(newWishList);
    setWishlist(newWishList); // 전체 리스트도 업데이트
    e.target.style.opacity = 1; // 드래그 종료 시 불투명도 원래대로
  };

  useEffect(() => {
    if (login && memberId) {
      loadWishlist();
    }
  }, [login, memberId, loadWishlist]);

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
              {/* 게임 이미지 */}
              <img
                src={imageUrls[game.wishListId] || 'placeholder_image_url'} // 이미지가 없으면 placeholder 사용
                alt={game.gameTitle}
                className={styles.gameThumbnail}
              />

              {/* 게임 정보 */}
              <div className={styles.wishlist_game_details} style={{ maxWidth: '75%' }}>
                <h2 className={styles.wishlist_game_title}>{game.gameTitle}</h2>
                <div className={styles.game_meta_info}>
                  <span className={styles.game_review}>종합 평가: {game.reviewSummary || '정보 없음'}</span>
                  <span className={styles.game_release}>출시일: {game.releaseDate}</span>
                </div>
                <div className={styles.tag_container}>
                  <span className={styles.tag}>싱글 플레이어</span>
                  <span className={styles.tag}>멀티 플레이어</span>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className={styles.wishlist_action_container}>
                <div className={styles.game_price}>${game.gamePrice}</div>
                <button className={styles.wishlist_cart_button} onClick={() => addCart(game)}>장바구니에 추가</button>
                <button className={styles.removeButton} onClick={() => delWishList(game.wishListId)}>제거</button>
              </div>
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  );
};

export default WishList;
