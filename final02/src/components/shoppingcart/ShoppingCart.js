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
  const [gameList, setGameList] = useState([]); // 게임 목록을 저장하는 상태 추가
  const [libList, setLibList] = useState([]); // 구매한 게임 리스트 상태 추가
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  const navigate = useNavigate();

  // 구매한 게임 목록 로드
  const loadLibraryList = useCallback(async () => {
    try {
      const resp = await axios.get("/library/");
      // gameNo 기준 중복 제거
      const uniqueLibList = resp.data.map((item) => item.gameNo)
        .filter((gameNo, index, self) => self.indexOf(gameNo) === index);
      setLibList(uniqueLibList);
    } catch (error) {
      console.error("Error loading library list:", error);
    }
  }, []);
  

  const loadCartList = useCallback(async () => {
    try {
      const resp = await axios.get("/cart/");
      // gameNo를 기준으로 중복 제거
      const uniqueCartList = resp.data.filter((cart, index, self) =>
        index === self.findIndex((c) => c.gameNo === cart.gameNo)
      );
      setCartList(uniqueCartList);
  
      const total = uniqueCartList.reduce((sum, cart) => sum + (cart.gamePrice || 0), 0);
      setTotalPrice(total);
    } catch (error) {
      console.error("Error loading cart list", error);
    }
  }, []);
  

  //게임 리스트 로드
  const loadGameList = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/game/");
      console.log("게임 목록 데이터:", response.data);
  
      // 배열을 섞는 함수
      const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
      };
  
      const shuffledGames = shuffleArray(response.data); // 데이터를 섞음
      setGameList(shuffledGames.slice(0, 6)); // 무작위로 섞인 목록 중 6개의 게임만 선택
    } catch (error) {
      console.error("게임 목록을 불러오는 데 실패했습니다:", error);
    }
  }, []);

  const delCart = useCallback(async (gameNo) => {
    try {
      console.log("Deleting cart item with gameNo:", gameNo);
      const resp = await axios.delete(`/cart/${gameNo}`);
      setCartList(prevList => prevList.filter(cart => cart.gameNo !== gameNo));
      setSelectedItems(prevItems => prevItems.filter(id => id !== gameNo));
    } catch (error) {
      console.error("Error deleting cart item", error);
    }
  }, []);

  const loadAllGameImages = useCallback(async () => {
    const imageMap = {};

    try {
      for (const cart of cartList) {
        const response = await axios.get(`http://localhost:8080/game/image/${cart.gameNo}`);
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
      loadLibraryList();
      loadGameList();
    }
    // 특정 조건이나 디버깅 로그 추가로 확인할 수 있음
    console.log('useEffect 호출됨: Cart, Library, Game 목록 로드');
  }, [login, memberId]); 
  

  useEffect(() => {
    if (cartList.length > 0) {
      loadAllGameImages();
    }
  }, [cartList, loadAllGameImages]);

  const getCurrentUrl = useCallback(() => {
    const basePath = window.location.pathname.endsWith('/') ? window.location.pathname.slice(0, -1) : window.location.pathname;
    return `${window.location.origin}${basePath}`;
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
      alert(t("shoppingCart.noItemsSelected"));

      return;
    }

    try {
      const token = sessionStorage.getItem('refreshToken');
      if (!token) {
        throw new Error(t('payment.errorNoToken'));
      }

      const selectedGames = cartList.filter(cart => selectedItems.includes(cart.cartId));
      const totalSelectedPrice = selectedGames.reduce((sum, game) => sum + (game.gamePrice || 0), 0);

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

  return (
    <div className={styles.cartPageContainer}>
      <h1 className={styles.cart_title}>
      {memberId ? t("shoppingCart.titleWithMember", { memberId }) : t("shoppingCart.title")}
      </h1>

      <div className={styles.cartItemsContainer}>
        {cartList.length === 0 ? (
        <p className={styles.emptyCartMessage}>{t("shoppingCart.emptyCartMessage")}</p>

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
                  onClick={() => navigate(`/game/detail/${cart.gameNo}`)}
                  style={{ cursor: 'pointer', textDecoration: 'underline' }}
                >{cart.gameTitle}</h4>
                <p className={styles.gamePrice}>{(cart.gamePrice || 0).toLocaleString()}₩</p>
              </div>
              <div className={styles.actionButtons}>
                {libList.includes(cart.gameNo) ? (
                  <button
                    className={styles.wishlist_cart_button}
                    onClick={() => navigate(`/play/${cart.gameNo}`)}
                  >
                   {t("shoppingCart.play")}
                  </button>
                ) : (
                  <>
                    <button className={styles.giftButton}>{t("shoppingCart.giftOption")}</button>
                    <button className={styles.removeButton} onClick={() => delCart(cart.gameNo)}>  {t("shoppingCart.remove")}</button>
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

      {/* 일반 게임 목록 슬라이드 섹션 */}
      <section className={styles.recommendedSection}>
        <h2 className={styles.recommendedTitle}>{t("shoppingCart.recommendedGames")}</h2>
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