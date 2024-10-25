import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import styles from './ShoppingCart.module.css';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState } from "../../utils/recoil";

const ShoppingCart = () => {
  const [cartList, setCartList] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); 
  const [totalPrice, setTotalPrice] = useState(0);
  
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  
  const navigate = useNavigate();

  const loadCartList = useCallback(async () => {
    try {
      const resp = await axios.get("/cart/");
      const cartData = resp.data;
      
      setCartList(cartData);
      const total = cartData.reduce((sum, cart) => sum + cart.gamePrice, 0);
      setTotalPrice(total);
      
      // 이미지 URL을 미리 설정하는 로직 (이미지 URL이 cartList에 포함되어 있다고 가정)
      const newImageUrls = {};
      cartData.forEach(cart => {
        const imageUrl = `http://localhost:8080/game/download/${cart.attachmentNo}`; // attachmentNo는 이미 cart에 있음
        newImageUrls[cart.cartId] = imageUrl;
      });
      setImageUrls(newImageUrls);
    } catch (error) {
      console.error("Error loading cart list", error);
    }
  }, []);

  const delCart = useCallback(async (cartId) => {
    try {
      await axios.delete(`/cart/${cartId}`);
      setCartList(prevList => prevList.filter(cart => cart.cartId !== cartId)); 
    } catch (error) {
      console.error("Error deleting cart item", error);
    }
  }, []);

  useEffect(() => {
    if (login && memberId) {
      loadCartList();
    }
  }, [login, memberId, loadCartList]);

  useEffect(() => {
    if (cartList.length > 0) {
      const newImageUrls = {};
      cartList.forEach(cart => {
        const imageUrl = `http://localhost:8080/game/download/${cart.attachmentNo}`;
        newImageUrls[cart.cartId] = imageUrl;
      });
      setImageUrls(newImageUrls);
    }
  }, [cartList]); // cartList가 변경될 때마다 실행
  return (
    <div className={styles.cartPageContainer}>
      <h1 className={styles.cart_title}>
        {memberId ? `${memberId}님의 장바구니` : '장바구니'}
      </h1>
      <div className={styles.cartItemsContainer}>
        {cartList.map(cart => (
          <div key={cart.cartId} className={styles.cartItem}>
            <img
              src={imageUrls[cart.cartId]} 
              alt={cart.gameTitle}
              className={styles.gameThumbnail}
            />

            <div className={styles.gameInfo}>
              <h4 className={styles.gameTitle}>{cart.gameTitle}</h4>
              <p className={styles.gamePrice}>{cart.gamePrice.toLocaleString()}₩</p>
            </div>

            <div className={styles.actionButtons}>
              <button className={styles.giftButton}>선물용</button>
              <button className={styles.removeButton} onClick={() => delCart(cart.cartId)}>제거</button>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.cartSummaryContainer}>
        <div className={styles.cartFooter}>
          <button 
            className={styles.continueShoppingButton} 
            onClick={() => navigate("/")}
          >
            쇼핑 계속하기
          </button>
          <div className={styles.totalPriceSection}>
            <div className={styles.totalPriceLabel}>예상 합계:</div>
            <div className={styles.totalPriceValue}>{totalPrice.toLocaleString()}₩</div>
            <p className={styles.taxNotice}>해당되는 지역의 경우 계산 시 판매세가 부과됩니다.</p>
          </div>
          <button className={styles.checkoutButton}>결제 계속하기</button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
