import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './ShoppingCart.module.css';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";

const ShoppingCart = () => {
  const [cartList, setCartList] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // 여러 이미지 URL을 관리하기 위한 상태

  // Recoil 상태 사용
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  const memberLoading = useRecoilValue(memberLoadingState);
  const placeholderImage = 'https://picsum.photos/200'; // 200x200 사이즈의 임의의 이미지
  
  // 장바구니 리스트 불러오는 함수
  const loadCartList = useCallback(async () => {
    try {
      const resp = await axios.get("/cart/");
      console.log(resp.data);
      setCartList(resp.data);
    } catch (error) {
      console.error("Error loading cart list", error);
    }
  }, []);

  const delCart = useCallback(async (cartId) => {
    try {
      await axios.delete(`/cart/${cartId}`);
      setCartList(prevList => prevList.filter(cart => cart.cartId !== cartId)); // 삭제된 아이템 필터링
    } catch (error) {
      console.error("Error deleting cart item", error);
    }
  }, []);

  // 이미지 로딩 함수
  const loadGameImages = useCallback(async (cartListData) => {
    const newImageUrls = {};
    try {
      // 각 cart 항목에 대해 이미지 정보를 불러옴
      for (const cart of cartListData) {
        const response = await axios.get(`http://localhost:8080/game/image/${cart.gameNo}`);
        console.log("이미지 정보 응답:", response.data);
        if (response.data && response.data.length > 0) {
          // 첫번째 이미지의 attachmentNo로 다운로드 URL 생성
          const imageUrl = `http://localhost:8080/game/download/${response.data[0].attachmentNo}`;
          console.log("이미지 URL:", imageUrl);
          newImageUrls[cart.cartId] = imageUrl; // 이미지 URL을 cartId로 구분하여 저장
        }
      }
      setImageUrls(newImageUrls); // 모든 이미지 URL을 상태에 저장
    } catch (error) {
      console.error("이미지 로딩 에러:", error.response || error);
    }
  }, []);

  // 이미지 로딩을 위한 useEffect 추가
  useEffect(() => {
    if (cartList.length > 0) {
      loadGameImages(cartList); // cartList가 로드된 후에 이미지 로딩을 시도
    }
  }, [cartList, loadGameImages]); // cartList가 변경될 때마다 실행

  // 장바구니 목록을 불러옴
  useEffect(() => {
    if (login && memberId) {
      loadCartList();
    }
  }, [login, memberId, loadCartList]);

  return (
    <div className={styles.cartContainer}>
      {cartList.map(cart => (
        <div key={cart.cartId} className={styles.cartItem}>
          {/* 게임 썸네일 */}
          <img
            src={cart.attachmentNo || placeholderImage} // 이미지가 없으면 placeholder 사용
            alt={cart.gameTitle}
            className={styles.gameThumbnail}
          />

          {/* 게임 정보 및 가격 */}
          <div className={styles.gameInfo}>
            <h4 className={styles.gameTitle}>{cart.gameTitle}</h4>
            <p className={styles.gamePrice}>{cart.gamePrice.toLocaleString()}$</p>
          </div>

          {/* 추가 기능 (선물용 버튼 등) */}
          <div className={styles.actionButtons}>
            <button className={styles.giftButton}>선물용</button>
            <button className={styles.removeButton} onClick={() => delCart(cart.cartId)}>제거</button>
          </div>
        </div>
      ))}

      <button type='button'>결제하기</button>
    </div>
  );
};

export default ShoppingCart;
