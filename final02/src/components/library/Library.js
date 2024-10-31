import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState } from "../../utils/recoil";
import styles from './Library.module.css';

const Library = () => {
  const [libList, setLibList] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);

  // Load library games
  const loadLib = useCallback(async () => {
    try {
      // API 경로를 "/library/"로 통일
      const resp = await axios.get(`/library/`);
      setLibList(resp.data);

      // Library 목록을 불러온 후 이미지 로드
      loadImages(resp.data);
    } catch (error) {
      console.error("Error loading library:", error);
    }
  }, []);

  // 이미지로딩
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

  // Component did mount and memberId changes effect
  useEffect(() => {
    if (login && memberId) {
      loadLib();
    }
  }, [login, memberId, loadLib]);

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
            <div key={game.libraryId} className={styles.library_game_item}>
              {/* Game Image */}
              <img
                src={imageUrls[game.libraryId] || '/default-profile.png'}
                alt={game.gameTitle}
                className={styles.gameThumbnail}
              />
              
              {/* Game Info */}
              <div className={styles.library_game_details}>
                <h2 className={styles.library_game_title}>{game.gameTitle}</h2>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Library;
