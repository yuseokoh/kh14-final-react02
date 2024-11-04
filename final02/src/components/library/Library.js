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

  // 라이브러리 목록 로드
  const loadLib = useCallback(async () => {
    try {
      const resp = await axios.get("/library/");
      const uniqueLibList = resp.data.reduce((acc, current) => {
        if (!acc.some(item => item.gameNo === current.gameNo)) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      setLibList(uniqueLibList);
      await loadImages(uniqueLibList);  // 이미지 로드 호출
    } catch (error) {
      console.error("Error loading library:", error);
    }
  }, []);

  // 이미지 로딩 병렬화 (Promise.all 사용)
  const loadImages = useCallback(async (library) => {
    const imageRequests = library.map(async (game) => {
      try {
        const response = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        const imageUrl = response.data?.length > 0 
            ? `http://localhost:8080/game/download/${response.data[0].attachmentNo}`
            : '/default-profile.png';
        return { [game.libraryId]: imageUrl };
      } catch (error) {
        console.error("Error loading game image:", error);
        return { [game.libraryId]: '/default-profile.png' };
      }
    });

    // 모든 이미지 요청 완료 후 업데이트
    const results = await Promise.all(imageRequests);
    const newImageUrls = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    setImageUrls(newImageUrls);
  }, []);

  // 추천 게임 목록 로드
  const loadGameList = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:8080/game/");
      const shuffledGames = response.data.sort(() => Math.random() - 0.5); // 데이터 섞기
      setGameList(shuffledGames.slice(0, 6)); // 랜덤으로 6개만 표시
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
                src={imageUrls[game.libraryId] || '/default-profile.png'}
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
                  <img src={game.imageUrl || 'https://via.placeholder.com/200'} alt={game.gameTitle} className={styles.gameThumbnail} />
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
