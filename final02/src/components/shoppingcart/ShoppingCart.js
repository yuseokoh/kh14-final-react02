import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './ShoppingCart.module.css';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState } from "../../utils/recoil";
import { useTranslation } from 'react-i18next';

const ShoppingCart = () => {
  const [cartList, setCartList] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // 여러 이미지 URL을 관리하기 위한 상태
  const [totalPrice, setTotalPrice] = useState(0);
  const { t } = useTranslation();
  
  // Recoil 상태 사용
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  
  // 장바구니 리스트 불러오는 함수
  const loadCartList = useCallback(async () => {
    try {
      const resp = await axios.get("/cart/");
      setCartList(resp.data);
      const total = resp.data.reduce((sum, cart) => sum + cart.gamePrice, 0);
      setTotalPrice(total);
    } catch (error) {
      console.error("Error loading cart list", error);
    }
  }, []);

  // 장바구니에서 게임 삭제
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
    const imageMap = {};
    try {
      // 각 cart 항목에 대해 이미지 정보를 불러옴
      for (const cart of cartListData) {
        const response = await axios.get(`http://localhost:8080/game/image/${cart.gameNo}`);
        if (response.data && response.data.length > 0) {
          // 첫번째 이미지의 attachmentNo로 이미지 URL 생성
          const imageUrl = `http://localhost:8080/game/image/${response.data[0].attachmentNo}`;
          imageMap[cart.cartId] = imageUrl; // 이미지 URL을 cartId로 구분하여 저장
        } else {
          imageMap[cart.cartId] = 'https://via.placeholder.com/200'; // 이미지가 없을 경우 placeholder 사용
        }
      }
    } catch (error) {
      console.error("이미지 로딩 에러:", error);
    }
    setImageUrls(imageMap); // 모든 이미지 URL을 상태에 저장
  }, []);

 
  // 장바구니 및 이미지 로딩을 위한 useEffect 추가
  useEffect(() => {
    if (login && memberId) {
      loadCartList();
    }
  }, [login, memberId, loadCartList]);

  // 장바구니가 로드된 후 이미지 로드
  useEffect(() => {
    if (cartList.length > 0) {
      // loadGameImages(cartList);
    }
  }, [cartList]);

  const getCurrentUrl = useCallback(() => {
    return window.location.origin + window.location.pathname + (window.location.hash || '');
  }, []);

  // 결제 요청 함수
  const sendPurchaseRequest = useCallback(async () => {
    if (cartList.length === 0) {
      alert(t('payment.noItemsInCart'));
      return;
    }

    try {
      const token = sessionStorage.getItem('refreshToken');
      if (!token) {
        throw new Error(t('payment.errorNoToken'));
      }

      const response = await axios.post(
        "http://localhost:8080/game/purchase",
        {
          gameList: cartList.map(game => ({
            gameNo: game.gameNo,
            qty: 1, // 장바구니에서 각 게임의 수량을 1로 고정
          })),
          approvalUrl: getCurrentUrl() + "/success",
          cancelUrl: getCurrentUrl() + "/cancel",
          failUrl: getCurrentUrl() + "/fail",
        }
      );

      window.sessionStorage.setItem("tid", response.data.tid);
      window.sessionStorage.setItem("checkedGameList", JSON.stringify(cartList));

      const savedTid = sessionStorage.getItem("tid");
      if (!savedTid) {
        throw new Error("tid 저장에 실패했습니다.");
      }

      // 카카오페이 결제 페이지로 리다이렉트
      window.location.href = response.data.next_redirect_pc_url;
    } catch (error) {
      console.error(t('payment.errorDuringPurchase'), error);
      alert(t('payment.errorPurchaseFailed'));
    }
  }, [cartList, getCurrentUrl, t]);

 

  return (
    <div className={styles.cartPageContainer}>
      <div className={styles.cartItemsContainer}>
        {cartList.map(cart => (
          <div key={cart.cartId} className={styles.cartItem}>
            {/* 게임 썸네일 */}
            <img
              src={imageUrls[cartList.cartId]} // 이미지가 없으면 placeholder 사용
              alt={cart.gameTitle}
              className={styles.gameThumbnail}
            />

            {/* 게임 정보 및 가격 */}
            <div className={styles.gameInfo}>
              <h4 className={styles.gameTitle}>{cart.gameTitle}</h4>
              <p className={styles.gamePrice}>{cart.gamePrice.toLocaleString()}₩</p>
            </div>

            {/* 추가 기능 (선물용 버튼 등) */}
            <div className={styles.actionButtons}>
              <button className={styles.giftButton}>선물용</button>
              <button className={styles.removeButton} onClick={() => delCart(cart.cartId)}>제거</button>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.cartSummaryContainer}>
        <div className={styles.cartFooter}>
          <button className={styles.continueShoppingButton}>쇼핑 계속하기</button>
          <div className={styles.totalPriceSection}>
            <div className={styles.totalPriceLabel}>예상 합계:</div>
            <div className={styles.totalPriceValue}>{totalPrice.toLocaleString()}₩</div>
            <p className={styles.taxNotice}>해당되는 지역의 경우 계산 시 판매세가 부과됩니다.</p>
          </div>
          <button type='button' onClick={sendPurchaseRequest} className={styles.checkoutButton}>
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
