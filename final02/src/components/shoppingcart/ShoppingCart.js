import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './ShoppingCart.module.css';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";
import { useTranslation } from 'react-i18next';

const ShoppingCart = () => {
  const [cartList, setCartList] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // 여러 이미지 URL을 관리하기 위한 상태
  const { t } = useTranslation();

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
  const getCurrentUrl = useCallback(() => {
    return window.location.origin + window.location.pathname + (window.location.hash || '');
  }, []);

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
        },
       
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

<button type='button' onClick={sendPurchaseRequest} className={styles.checkoutButton}>
        결제하기
      </button>
    </div>
  );
};

export default ShoppingCart;
