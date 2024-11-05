import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import debounce from 'lodash.debounce';
import styles from './WishList.module.css';
import { useNavigate } from "react-router";
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState } from "../../utils/recoil";
import { useTranslation } from "react-i18next";

const WishList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dragItem = useRef();
  const dragOverItem = useRef();
  const [wishlist, setWishlist] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filteredWishlist, setFilteredWishlist] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [cartGames, setCartGames] = useState([]);
  const [libraryGames, setLibraryGames] = useState([]);
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  const [gameList, setGameList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const loadLibraryGames = useCallback(async () => {
    try {
      const resp = await axios.get("/library/");
      setLibraryGames(resp.data.map(game => game.gameNo));
    } catch (error) {
      console.error("Error loading library games", error);
    }
  }, []);

  const loadCartGames = useCallback(async () => {
    try {
      const resp = await axios.get("/cart/");
      setCartGames(resp.data.map(cart => cart.gameNo));
    } catch (error) {
      console.error("Error loading cart games", error);
    }
  }, []);

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

  const addCart = useCallback(async (game) => {
    if (cartGames.includes(game.gameNo)) {
      alert(t("wishlist.alreadyInCart"));
      return;
    }
    if (libraryGames.includes(game.gameNo)) {
      alert(t("wishlist.alreadyInLibrary"));
      return;
    }
  
    try {
      await axios.post("/cart/add", game);
      setCartGames((prevCartGames) => [...prevCartGames, game.gameNo]);
      delWishList(game.wishListId);
      navigate("/cart/");
    } catch (error) {
      console.error("Error adding item to cart", error);
    }
  }, [cartGames, libraryGames, navigate]);

  const delWishList = useCallback(async (wishListId) => {
    try {
      await axios.delete(`http://localhost:8080/wishlist/${wishListId}`);
      setWishlist((prevWishlist) => prevWishlist.filter((item) => item.wishListId !== wishListId));
      setFilteredWishlist((prevFilteredWishlist) => prevFilteredWishlist.filter((item) => item.wishListId !== wishListId));
    } catch (error) {
      console.error("Error removing item from wishlist", error);
    }
  }, []);

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
      loadCartGames();
      loadLibraryGames();
      loadGameList();
    }
  }, [login, memberId, loadWishlist, loadCartGames, loadLibraryGames]);

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
    <div className={styles.wishlist_container} style={{ minHeight: '100vh' }}>
      <h1 className={styles.wishlist_title}>
         {memberId ? t("wishlist.titleWithMember", { memberId }) : t("wishlist.title")}
      </h1>
      <div className={styles.wishlist_search_container}>
        <input
          type="text"
          placeholder={t("wishlist.searchPlaceholder")}
          className={styles.wishlist_search}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
      </div>

      {filteredWishlist.length === 0 ? (
        <p className={styles.emptyWishlistMessage}>{t("wishlist.emptyMessage")}</p>
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
                    <span className={styles.game_review}>{t("wishlist.reviewSummary")}: {game.reviewSummary || t("wishlist.noInfo")}</span>
                    <span className={styles.game_release}>{t("wishlist.releaseDate")}: {game.releaseDate}</span>
                  </div>
                  <div className={styles.tag_container}>
                    <span className={styles.tag}>{t("wishlist.singlePlayer")}</span>
                    <span className={styles.tag}>{t("wishlist.multiplayer")}</span>
                  </div>
                </div>
                <div className={styles.wishlist_action_container}>
                  <div className={styles.game_price}>${game.gamePrice}</div>
                  {libraryGames.includes(game.gameNo) ? (
                    <button className={styles.wishlist_cart_button} onClick={() => navigate(`/play/${game.gameNo}`)}>{t("wishlist.play")}</button>
                  ) : (
                    <button className={styles.wishlist_cart_button} onClick={() => addCart(game)}>{t("wishlist.addToCart")}</button>
                  )}
                  <button className={styles.removeButton} onClick={() => delWishList(game.wishListId)}>{t("wishlist.remove")}</button>
                </div>
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      )}
        {/* 추천 게임 목록 슬라이더 */}
      <section className={styles.recommendedSection}>
        <h2 className={styles.recommendedTitle}>{t("wishlist.recommendedGames")}</h2>
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

export default WishList;