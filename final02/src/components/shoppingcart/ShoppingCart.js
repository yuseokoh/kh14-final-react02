import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './ShoppingCart.module.css';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState } from "../../utils/recoil";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import VerticalCardSlider from './VerticalCardSlider';

const ShoppingCart = () => {
  const [cartList, setCartList] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [topRatedGames, setTopRatedGames] = useState([]);
  const [libList, setLibList] = useState([]); // 구매한 게임 리스트 상태 추가
  const { t } = useTranslation();

  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  const navigate = useNavigate();

  // 구매한 게임 목록 로드
  const loadLibraryList = useCallback(async () => {
    try {
      const resp = await axios.get("/library/");
      setLibList(resp.data.map((item) => item.gameNo)); // 구매한 게임 ID 리스트로 저장
    } catch (error) {
      console.error("Error loading library list:", error);
    }
  }, []);

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

  const loadTopRatedGames = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/game/top-rated", {
        params: { minReviews: 5, limit: 10 }
      });
      console.log("API 응답 데이터:", response.data);
      setTopRatedGames(response.data);
    } catch (error) {
      console.error("최고 평점 게임 데이터를 불러오는 데 실패했습니다:", error);
    }
  }, []);

  const delCart = useCallback(async (gameNo) => {
    try {
      console.log("Deleting cart item with gameNo:", gameNo); // 전달되는 gameNo 값을 콘솔에 출력
      const resp = await axios.delete(`/cart/${gameNo}`);
      setCartList(prevList => prevList.filter(cart => cart.gameNo !== gameNo)); // gameNo를 사용하여 목록 필터링
      setSelectedItems(prevItems => prevItems.filter(id => id !== gameNo)); // gameNo를 사용하여 선택 항목 필터링
    } catch (error) {
      console.error("Error deleting cart item", error);
    }
  }, []);


  // const loadGameImages = useCallback(async (cartListData) => {
  //   const imageMap = {};
  //   try {
  //     for (const cart of cartListData) {
  //       const response = await axios.get(`http://localhost:8080/game/image/${cart.gameNo}`);
  //       if (response.data && response.data.length > 0) {
  //         const imageUrl = `http://localhost:8080/game/download/${response.data[0].attachmentNo}`;
  //         imageMap[cart.cartId] = imageUrl;
  //       } else {
  //         imageMap[cart.cartId] = 'https://via.placeholder.com/200';
  //       }
  //     }
  //   } catch (error) {
  //     console.error("이미지 로딩 에러:", error);
  //   }
  //   setImageUrls(imageMap);
  // }, []);

  const loadAllGameImages = useCallback(async () => {
    const imageMap = {};

    try {
        for (const cart of cartList) {
            const response = await axios.get(`http://localhost:8080/game/image/${cart.gameNo}`);
            
            // 게임에 이미지가 있을 경우 해당 URL을, 없으면 기본 이미지를 사용
            if (response.data && response.data.length > 0) {
                const imageUrl = `http://localhost:8080/game/download/${response.data[0].attachmentNo}`;
                imageMap[cart.gameNo] = imageUrl;
            } else {
                imageMap[cart.gameNo] = 'https://via.placeholder.com/200';
            }
        }

        setImageUrls(imageMap);
    } catch (error) {
        console.error("이미지 로딩 에러:", error);
    }
}, [cartList]);

  useEffect(() => {
    if (login && memberId) {
      loadCartList();
      loadLibraryList(); // 구매 내역 불러오기
      loadTopRatedGames();
    }
  }, [login, memberId, loadCartList, loadLibraryList, loadTopRatedGames]);

  // useEffect(() => {
  //   if (cartList.length > 0) {
  //     loadGameImages(cartList);
  //   }
  // }, [cartList, loadGameImages]);
  useEffect(() => {
    if (cartList.length > 0) {
        loadAllGameImages(); // 단순화된 이미지 로딩 함수 호출
    }
}, [cartList, loadAllGameImages]);

  const getCurrentUrl = useCallback(() => {
    return window.location.origin + window.location.pathname + (window.location.hash || '');
  }, []);

  const handleItemSelection = (cartId) => {
    setSelectedItems(prevItems => {
      if (prevItems.includes(cartId)) {
        return prevItems.filter(id => id !== cartId);
      } else {
        return [...prevItems, cartId];
      }
    });
  };

  const sendPurchaseRequest = useCallback(async () => {
    if (selectedItems.length === 0) {
      alert(t('payment.noItemsSelected'));
      return;
    }

    try {
      const token = sessionStorage.getItem('refreshToken');
      if (!token) {
        throw new Error(t('payment.errorNoToken'));
      }

      const selectedGames = cartList.filter(cart => selectedItems.includes(cart.cartId));
      const totalSelectedPrice = selectedGames.reduce((sum, game) => sum + game.gamePrice, 0);

      const response = await axios.post(
        "http://localhost:8080/game/purchase",
        {
          gameList: selectedGames.map(game => ({
            gameNo: game.gameNo,
            qty: 1,
          })),
          approvalUrl: getCurrentUrl() + "/success",
          cancelUrl: getCurrentUrl() + "/cancel",
          failUrl: getCurrentUrl() + "/fail",
        }
      );

      window.sessionStorage.setItem("tid", response.data.tid);
      window.sessionStorage.setItem("checkedGameList", JSON.stringify(selectedGames));

      window.location.href = response.data.next_redirect_pc_url;
    } catch (error) {
      console.error(t('payment.errorDuringPurchase'), error);
      alert(t('payment.errorPurchaseFailed'));
    }
  }, [cartList, selectedItems, getCurrentUrl, t]);

  const keepshop = useCallback(() => {
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    console.log("Top Rated Games:", topRatedGames); // topRatedGames 데이터 확인
  }, [topRatedGames]);

  return (
    <div className={styles.cartPageContainer}>
      <h1 className={styles.cart_title}>
        {memberId ? `${memberId}님의 장바구니` : '장바구니'}
      </h1>

      <div className={styles.cartItemsContainer}>
        {cartList.length === 0 ? (
          <p className={styles.emptyCartMessage}>장바구니가 비어있습니다.</p>
        ) : (
          cartList.map(cart => (
            <div key={cart.cartId} className={styles.cartItem}>
              <input
                type="checkbox"
                checked={selectedItems.includes(cart.cartId)}
                onChange={() => handleItemSelection(cart.cartId)}
              />
              <img
                src={imageUrls[cart.gameNo] || 'https://via.placeholder.com/200'}
                alt={cart.gameTitle}
                className={styles.gameThumbnail}
              />
              <div className={styles.gameInfo}>
                <h4 
                  className={styles.gameTitle} 
                  onClick={() => navigate(`/game/detail/${cart.gameNo}`)} // 게임 제목 클릭 시 상세 페이지로 이동
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >{cart.gameTitle}</h4>
                <p className={styles.gamePrice}>{cart.gamePrice.toLocaleString()}₩</p>
              </div>
              <div className={styles.actionButtons}>
                {libList.includes(cart.gameNo) ? (
                  <button
                    className={styles.wishlist_cart_button}
                    onClick={() => navigate(`/play/${cart.gameNo}`)}
                  >
                    플레이하기
                  </button>
                ) : (
                  <>
                    <button className={styles.giftButton}>선물용</button>
                    <button className={styles.removeButton} onClick={() => delCart(cart.gameNo)}>제거</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 최고 평점 게임 섹션 */}
      <section className={styles.recommendedSection}>
        <h2 className={styles.recommendedTitle}>회원님에게 추천하는 게임</h2>
        <VerticalCardSlider games={topRatedGames} itemsPerPage={4} />
      </section>

      <div className={styles.cartSummaryContainer}>
        <div className={styles.cartFooter}>
          <button className={styles.continueShoppingButton} onClick={keepshop}>쇼핑 계속하기</button>
          <div className={styles.totalPriceSection}>
            <div className={styles.totalPriceLabel}>선택된 항목 합계:</div>
            <div className={styles.totalPriceValue}>
              {cartList
                .filter(cart => selectedItems.includes(cart.cartId))
                .reduce((sum, cart) => sum + cart.gamePrice, 0)
                .toLocaleString()}₩
            </div>
            <p className={styles.taxNotice}>해당되는 지역의 경우 계산 시 판매세가 부과됩니다.</p>
          </div>
          <button type='button' onClick={sendPurchaseRequest} className={styles.checkoutButton}>
            선택 항목 결제하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
