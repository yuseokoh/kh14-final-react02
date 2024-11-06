import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState } from "../../utils/recoil";
import styles from './Library.module.css';
import { useNavigate } from 'react-router';

const Library = () => {
  const navigate = useNavigate();
  const [libList, setLibList] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  const [gameList, setGameList] = useState([]);

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

  // 라이브러리 리스트 로드
  const loadLib = useCallback(async () => {
    try {
      const resp = await axios.get("/library/");
      const uniqueLibList = resp.data.reduce((acc, current) => {
        const isDuplicate = acc.some(item => item.gameNo === current.gameNo);
        if (!isDuplicate) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      const libListWithImages = await Promise.all(
        uniqueLibList.map(async (game) => {
          const imageUrl = await loadGameImage(game.gameNo);
          return { ...game, imageUrl };
        })
      );

      setLibList(libListWithImages);
    } catch (error) {
      console.error("Error loading library:", error);
    }
  }, []);

  // 추천 게임 리스트 로드
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

  useEffect(() => {
    if (login && memberId) {
      loadLib();
      loadGameList();
    }
  }, [login, memberId, loadLib, loadGameList]);

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
    <div className={styles.library_container}>
      <h1 className={styles.library_title}>
        {memberId ? `${memberId}님의 라이브러리` : '라이브러리'}
      </h1>

      <div className={styles.library_game_list}>
        {libList.length === 0 ? (
          <p>라이브러리가 비어 있습니다.</p>
        ) : (
          libList.map((game) => (
            <div
              key={game.libraryId}
              className={styles.library_game_item}
              onClick={() => navigate('/testgame2')}
            >
              <img
                src={game.imageUrl || '/default-profile.png'}
                alt={game.gameTitle}
                className={styles.gameThumbnail}
              />
              <div className={styles.library_game_details}>
                <h2 className={styles.library_game_title}>{game.gameTitle}</h2>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* 추천 게임 목록 슬라이드 섹션 */}
      <section className={styles.sliderSection}>
        <h2 className={styles.sectionTitle}>추천 게임 목록</h2>
        <div className={styles.sliderContainer}>
          <button onClick={prevSlide} className={styles.sliderButton}>&lt;</button>
          <div className={styles.library_game_wrapper}>
            <div
              className={styles.library_game_list}
              style={{ transform: `translateX(-${currentIndex * (100 / 4)}%)` }}
            >
              {gameList.map((game) => (
                <div key={game.gameNo} className={styles.library_game_item}>
                  <img src={game.imageUrl || 'https://via.placeholder.com/150'} alt={game.gameTitle} className={styles.gameThumbnail} />
                  <div className={styles.library_game_details}>
                    <h3 className={styles.library_game_title}>{game.gameTitle}</h3>
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

export default Library;
