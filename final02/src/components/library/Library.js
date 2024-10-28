import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState } from "../../utils/recoil";
import styles from './Library.module.css'; // Add your CSS styling here

const Library = () => {
  // State for library list and image URLs
  const [libList, setLibList] = useState([]);
  const [imageUrls, setImageUrls] = useState({}); // Manage multiple image URLs
  
  // Recoil values for login state and member ID
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);

  // Load library games
  const loadLib = useCallback(async () => {
    try{  
    const resp = await axios.get("/library/");
      setLibList(resp.data);
    }catch(error){
      console.error(error);
    }
  },[]);
        

  // Load game images
  const loadImages = useCallback(async (library) => {
    const imageMap = {};
    for (const game of library) {
      try {
        const imageResp = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if (imageResp.data && imageResp.data.length > 0) {
          imageMap[game.libraryId] = `http://localhost:8080/game/download/${imageResp.data[0].attachmentNo}`;
        } else {
          imageMap[game.libraryId] = 'placeholder_image_url'; // Placeholder for missing images
        }
      } catch (err) {
        console.error("Error loading game image", err);
        imageMap[game.libraryId] = 'placeholder_image_url';
      }
    }
    setImageUrls(imageMap); // Set image URLs in state
  }, []);

  // Load library on component mount or when login/memberId changes
  useEffect(() => {
    if (login && memberId) {
      loadLib();
    }
  }, [login, memberId, loadLib]);

  // View rendering
  return (
    <div className={styles.library_container}>
      <h1 className={styles.library_title}>
        {memberId ? `${memberId}님의 라이브러리` : '라이브러리'}
      </h1>
      
      <div className={styles.library_game_list}>
        {libList.map((game) => (
          <div key={game.libraryId} className={styles.library_game_item}>
            {/* Game Image */}
            <img
              src={imageUrls[game.libraryId] || 'placeholder_image_url'}
              alt={game.gameTitle}
              className={styles.gameThumbnail}
            />
            
            {/* Game Info */}
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
