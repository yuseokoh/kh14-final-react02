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
  
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);

  const loadLib = useCallback(async () => {
    try {
      const resp = await axios.get("/library/");
      setLibList(resp.data);
      loadImages(resp.data); // 이미지 로딩
    } catch (error) {
      console.error("Error loading library:", error);
    }
  }, []);

  // Load game images
  const loadImages = useCallback(async (library) => {
    const imageMap = {};
    for (const game of library) {
      try {
        const imageResp = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if (imageResp.data && imageResp.data.length > 0) {
          imageMap[game.libraryId] = `http://localhost:8080/game/download/${imageResp.data[0].attachmentNo}`;
        } else {
          imageMap[game.libraryId] = 'placeholder_image_url';
        }
      } catch (err) {
        console.error("Error loading game image", err);
        imageMap[game.libraryId] = 'placeholder_image_url';
      }
    }
    setImageUrls(imageMap);
  }, []);

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
        {libList.map((game) => (
          <div key={game.libraryId} className={styles.library_game_item} onClick={() => navigate('/testgame2')}>
            <img
              src={imageUrls[game.libraryId] || 'placeholder_image_url'}
              alt={game.gameTitle}
              className={styles.gameThumbnail}
            />
            <div className={styles.library_game_details}>
              <h2 className={styles.library_game_title}>{game.gameTitle}</h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;
