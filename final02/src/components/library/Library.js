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
  const [gameList, setGameList] = useState([]); // 게임 목록을 저장하는 상태 추가
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
      
      setLibList(uniqueLibList);
      loadImages(uniqueLibList);
    } catch (error) {
      console.error("Error loading library:", error);
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

  const loadImages = useCallback(async (library) => {
    const imageMap = {};

    for (const game of library) {
      try {
        const response = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if (response.data && response.data.length > 0) {
          const imageUrl = `http://localhost:8080/game/download/${response.data[0].attachmentNo}`;
          imageMap[game.libraryId] = imageUrl;
        } else {
          imageMap[game.libraryId] = '/default-profile.png';
        }
      } catch (error) {
        console.error("Error loading game image:", error);
        imageMap[game.libraryId] = '/default-profile.png';
      }
    }
    setImageUrls(imageMap);
  }, []);

  useEffect(() => {
    if (login && memberId) {
      loadLib();
      loadGameList();
    }
  }, [login, memberId, loadLib]);

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
      {/* 일반 게임 목록 슬라이드 섹션 */}
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
