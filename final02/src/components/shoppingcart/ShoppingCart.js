import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import styles from './ShoppingCart.module.css';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState } from "../../utils/recoil";
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

const ShoppingCart = () => {
  const [cartList, setCartList] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [gameList, setGameList] = useState([]); // 추천 게임 목록 상태
  const [libList, setLibList] = useState([]); // 구매한 게임 리스트 상태
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  const navigate = useNavigate();

  // 공통 이미지 로딩 함수
  const loadGameImage = async (gameNo) => {
    try {
      const response = await axios.get(`http://localhost:8080/game/image/${gameNo}`);
      if (response.data && response.data.length > 0) {
        return `http://localhost:8080/game/download/${response.data[0].attachmentNo}`;
      }
    } catch (error) {
      console.error(`Error loading image for game ${gameNo}:`, error);
    }
    return 'https://via.placeholder.com/150';
  };

  // 구매한 게임 목록 로드
  const loadLibraryList = useCallback(async () => {
    try {
      const resp = await axios.get("/library/");
      setLibList(resp.data.map((item) => item.gameNo));
    } catch (error) {
      console.error("Error loading library list:", error);
    }
  }, []);

  // 카트 리스트 로드
  const loadCartList = useCallback(async () => {
    try {
      const resp = await axios.get("/cart/");
      const cartWithImages = await Promise.all(
        resp.data.map(async (cart) => {
          const imageUrl = await loadGameImage(cart.gameNo);
          return { ...cart, imageUrl };
        })
      );
      setCartList(cartWithImages);
      const total = cartWithImages.reduce((sum, cart) => sum + (cart.gamePrice || 0), 0);
      setTotalPrice(total);
    } catch (error) {
      console.error("Error loading cart list", error);
    }
  }, []);

  // 추천 게임 목록 로드
  const loadGameList = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/game/");
      const shuffledGames = response.data.sort(() => Math.random() - 0.5).slice(0, 6);

      const gameListWithImages = await Promise.all(
        shuffledGames.map(async (game) => {
          const imageUrl = await loadGameImage(game.gameNo);
          return { ...game, imageUrl };
        })
      );

      setGameList(gameListWithImages);
    } catch (error) {
      console.error("게임 목록을 불러오는 데 실패했습니다:", error);
    }
  }, []);

  const delCart = useCallback(async (gameNo) => {
    try {
      await axios.delete(`/cart/${gameNo}`);
      setCartList(prevList => prevList.filter(cart => cart.gameNo !== gameNo));
      setSelectedItems(prevItems => prevItems.filter(id => id !== gameNo));
    } catch (error) {
      console.error("Error deleting cart item", error);
    }
  }, []);

  useEffect(() => {
    if (login && memberId) {
      loadCartList();
      loadLibraryList();
      loadGameList();
    }
  }, [login, memberId, loadCartList, loadLibraryList, loadGameList]);

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

      const response = await axios.post(
        "http://localhost:8080/game/purchase",
        {
          gameList: selectedGames.map(game => ({
            gameNo: game.gameNo,
            qty: 1,
          })),
          approvalUrl: `${window.location.origin}/success`,
          cancelUrl: `${window.location.origin}/cancel`,
          failUrl: `${window.location.origin}/fail`,
        }
      );

      window.sessionStorage.setItem("tid", response.data.tid);
      window.sessionStorage.setItem("checkedGameList", JSON.stringify(selectedGames));
      window.location.href = response.data.next_redirect_pc_url;
    } catch (error) {
      console.error(t('payment.errorDuringPurchase'), error);
      alert(t('payment.errorPurchaseFailed'));
    }
  }, [cartList, selectedItems, t]);

  // 슬라이더를 위한 함수
  const nextSlide = () => {
    if (currentIndex < gameList.length - 3) {
      setCurrentIndex(currentIndex + 3);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 3);
    }
  };

  const keepshop = useCallback(() => {
    navigate("/");
  }, [navigate]);
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
              <label className={styles.checkboxWrapper}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(cart.cartId)}
                  onChange={() => handleItemSelection(cart.cartId)}
                />
                <span className={styles.checkmark}></span>
              </label>
              <img
                src={cart.imageUrl || 'https://via.placeholder.com/200'}
                alt={cart.gameTitle}
                className={styles.gameThumbnail}
              />
              <div className={styles.gameInfo}>
                <h4
                  className={styles.gameTitle}
                  onClick={() => navigate(`/game/detail/${cart.gameNo}`)}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >{cart.gameTitle}</h4>
                <p className={styles.gamePrice}>{(cart.gamePrice || 0).toLocaleString()}₩</p>
              </div>
              <div className={styles.actionButtons}>
                {libList.includes(cart.gameNo) ? (
                  <>
                    <button
                      className={styles.wishlist_cart_button}
                      onClick={() => navigate(`/play/${cart.gameNo}`)}
                    >
                      플레이하기
                    </button>
                    <button className={styles.removeButton} onClick={() => delCart(cart.gameNo)}>제거</button>
                  </>
                ) : (
                  <>
                    <button className={styles.removeButton} onClick={() => delCart(cart.gameNo)}>제거</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <div className={styles.cartSummaryContainer}>
        <div className={styles.cartFooter}>
          <button className={styles.continueShoppingButton} onClick={keepshop}>  {t("shoppingCart.continueShopping")}</button>
          <div className={styles.totalPriceSection}>
            <div className={styles.totalPriceLabel}>{t("shoppingCart.totalSelectedItems")}</div>
            <div className={styles.totalPriceValue}>
              {cartList
                .filter(cart => selectedItems.includes(cart.cartId))
                .reduce((sum, cart) => sum + (cart.gamePrice || 0), 0)
                .toLocaleString()}₩
            </div>
            <p className={styles.taxNotice}>{t("shoppingCart.taxNotice")}</p>
          </div>
          <button type='button' onClick={sendPurchaseRequest} className={styles.checkoutButton}>
          {t("shoppingCart.checkoutButton")}
          </button>
        </div>
      </div>
      {/* 추천 게임 목록 슬라이드 */}
      <section className={styles.recommendedSection}>
        <h2 className={styles.recommendedTitle}>회원님에게 추천하는 게임</h2>
        <div className={styles.sliderContainer}>
          <button onClick={prevSlide} className={styles.sliderButton}>&lt;</button>
          <div className={styles.topRatedGamesWrapper}>
            <div
              className={styles.topRatedGamesContainer}
              style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
            >
              {gameList.map((game) => (
                <div key={game.gameNo} className={styles.topRatedGameItem}>
                  <img
                    src={game.imageUrl || 'https://via.placeholder.com/150'}
                    alt={game.gameTitle}
                    className={styles.topRatedGameThumbnail}
                  />
                  <div className={styles.topRatedGameInfo}>
                    <h4
                      className={styles.topRatedGameTitle}
                      onClick={() => navigate(`/game/detail/${game.gameNo}`)}
                      style={{ cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {game.gameTitle}
                    </h4>
                    <p className={styles.topRatedGamePrice}>{(game.gamePrice || 0).toLocaleString()}₩</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={nextSlide} className={styles.sliderButton}>&gt;</button>
        </div>
      </section>
    </div>
  );
};

export default ShoppingCart;
