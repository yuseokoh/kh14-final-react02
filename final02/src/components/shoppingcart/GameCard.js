// src/components/GameCard/GameCard.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './GameCard.module.css';
import { useNavigate } from 'react-router';

const GameCard = ({ game }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGameImage = async () => {
      try {
        const response = await axios.get(`/game/image/${game.gameNo}`);
        if (response.data && response.data.length > 0) {
          setImageUrl(`${process.env.REACT_APP_BASE_URL}/game/download/${response.data[0].attachmentNo}`);
        }
      } catch (error) {
        console.error("이미지 로딩 에러:", error);
      }
    };
    loadGameImage();
  }, [game.gameNo]);

  return (
    <div 
      className={styles.gameCard}
      onClick={() => navigate(`/game/detail/${game.gameNo}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.gameImage}>
        <img src={imageUrl} alt={game.gameTitle} className={styles.gameImage} />
      </div>
      
      <div className={styles.gameInfo}>
        <h3 className={styles.gameTitle}>{game.gameTitle}</h3>
        <div className={styles.gameListTags}>
          {game.gameCategory.split(',').map((category, index) => (
            <span key={index} className={styles.gameListTag}>
              {category.trim()}
            </span>
          ))}
        </div>
        <div className={styles.gamePricing}>
          {game.gameDiscount > 0 ? (
            <>
              <span className={styles.discountBadge}>-{game.gameDiscount}%</span>
              <div className={styles.gamePrices}>
                <span className={styles.originalPrice}>${game.gamePrice.toFixed(2)}</span>
                <span className={styles.discountedPrice}>
                  ${(game.gamePrice * (1 - game.gameDiscount / 100)).toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <span className={styles.discountedPrice}>${game.gamePrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
