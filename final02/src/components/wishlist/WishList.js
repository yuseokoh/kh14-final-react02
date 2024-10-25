import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import debounce from 'lodash.debounce';
import styles from './WishList.module.css';
import { useNavigate } from "react-router";
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";

const WishList = () => {
  const navigate = useNavigate();
  const dragItem = useRef(); // 드래그할 아이템의 인덱스
  const dragOverItem = useRef(); // 드랍할 위치의 아이템의 인덱스
  const [wishlist, setWishlist] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [cart,setCart]  = useState([]);

  // Recoil 상태 사용
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  const memberLoading = useRecoilValue(memberLoadingState);

  const loadWishlist = useCallback(async () => {
    const resp = await axios.get("http://localhost:8080/wishlist/");
    setWishlist(resp.data);
    setFilteredWishlist(resp.data); // 초기 필터된 리스트 설정
  }, []);
 
  const addCart = useCallback(async (game) => {
        const resp = await axios.post("/cart/add", game);
        setCart(resp.data); 
        navigate("/cart/");
}, [navigate, setCart]);
//   const addCart = useCallback(async (game) => {
//     const token = localStorage.getItem('token');
//     console.log("Token:", token);
//     try {
//         const resp = await axios.post("http://localhost:8080/cart/add", game, {
//             headers: {
//                 Authorization: `Bearer ${token}` 
//             }
//         });
//         setCart(resp.data);
//         navigate("/wishlist/");
//     } catch (error) {
//         console.error("Error adding item to cart", error);
//     }
// }, [navigate, setCart]);

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

  const delWishList = useCallback(async (wishListId) => {
    try {
      await axios.delete(`/wishlist/${wishListId}`);
      setWishlist(prevList => prevList.filter(game => game.wishListId !== wishListId)); // 삭제된 아이템 필터링
    } catch (error) {
      console.error("Error deleting wishlist item", error);
    }
    loadWishlist();
  }, []);
  
  const debouncedSearch = useCallback(debounce(searchWishlist, 300), [searchWishlist]);

  useEffect(() => {
    debouncedSearch();
  }, [searchKeyword, debouncedSearch]);

  useEffect(() => {
    if (login && memberId) {
      loadWishlist();
    }
  }, [login, memberId, loadWishlist]);

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

  return (
    <div className={styles.wishlist_container} style={{ minHeight: '100vh' }}>
      <h1 className={styles.wishlist_title}>찜 목록</h1>
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
              <img src={game.gameImage} alt={game.gameTitle} className={styles.wishlist_game_image} />
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