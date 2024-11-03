import React, { useState } from 'react';
import styles from './VerticalCardSlider.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import GameCard from './GameCard';

const VerticalCardSlider = ({ games, itemsPerPage = 4 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + itemsPerPage;
      return nextIndex >= games.length ? 0 : nextIndex;
    });
    setTimeout(() => setIsAnimating(false), 300);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - itemsPerPage;
      return nextIndex < 0 ? Math.max(games.length - itemsPerPage, 0) : nextIndex;
    });
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className={styles.verticalCardSlider}>
      <div 
        className={styles.verticalCardSliderContainer}
        style={{
          transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
          transition: 'transform 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        {games.map((game, index) => (
          <div
            key={game.gameNo}
            className={styles.vertgicalCardSliderItem}
            style={{ flex: `0 0 ${100 / itemsPerPage}%` }}
          >
            <GameCard game={game} />
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide} 
        className={`${styles.sliderButton} ${styles.sliderButtonLeft}`}
        disabled={currentIndex === 0}
      >
        <ChevronLeft color="white" size={24} />
      </button>
      <button 
        onClick={nextSlide} 
        className={`${styles.sliderButton} ${styles.sliderButtonRight}`}
        disabled={currentIndex + itemsPerPage >= games.length}
      >
        <ChevronRight color="white" size={24} />
      </button>
    </div>
  );
};

export default VerticalCardSlider;
