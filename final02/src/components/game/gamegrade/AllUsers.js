/**
 * AllUsers.js
 * 전체이용가 게임 카테고리 페이지를 위한 메인 컴포넌트
 * Steam 스타일의 게임 목록 및 필터링 기능을 제공
 */

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './GameGrade.module.css';

/**
 * 카테고리별 설정을 관리하는 객체
 * - 각 카테고리 페이지의 고유한 설정을 정의
 */
const CATEGORY_CONFIG = {
  name: '전체이용가',
  description: '온 가족이 함께 즐길 수 있는 전체이용가 게임을 만나보세요',
  tags: ['캐주얼', '어드벤처', '퍼즐', '시뮬레이션', '스포츠', '교육'],
  filterKey: 'all' 
};

/**
 * 필터 옵션 설정
 * 카테고리 필터링을 위한 옵션 목록
 */
const FILTER_OPTIONS = [
  { id: 'all', name: '특집' },
  { id: 'casual', name: '캐주얼' },
  { id: 'adventure', name: '어드벤처' },
  { id: 'puzzle', name: '퍼즐' },
  { id: 'simulation', name: '시뮬레이션' },
  { id: 'sports', name: '스포츠' }
];

/**
 * 피처드 게임 섹션을 표시하는 컴포넌트
 */
const FeaturedSection = ({ games }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
  
    useEffect(() => {
      setImageUrl(null);
      setIsLoading(true);
      
      const loadGameImage = async () => {
        if (!games[currentIndex]) return;
        
        try {
          const response = await axios.get(`/game/image/${games[currentIndex].gameNo}`);
          if (response.data && response.data.length > 0) {
            const url = `${process.env.REACT_APP_BASE_URL}/game/download/${response.data[0].attachmentNo}`;
            setImageUrl(url);
          }
        } catch (error) {
          console.error('이미지 로딩 실패:', error);
        } finally {
          setIsLoading(false);
        }
      };
  
      loadGameImage();
    }, [currentIndex, games]);
  
    const handlePrevious = () => {
      setCurrentIndex(prev => (prev === 0 ? games.length - 1 : prev - 1));
    };
  
    const handleNext = () => {
      setCurrentIndex(prev => (prev === games.length - 1 ? 0 : prev + 1));
    };
  
    if (!games.length || !games[currentIndex]) return null;
  
    const currentGame = games[currentIndex];
  
    return (
      <div className={styles.featuredBanner}>
        <div className={styles.featuredBackground}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              className={styles.featuredBackgroundImage}
            />
          )}
        </div>
        <div className={styles.featuredOverlay} />
        
        <div className={styles.featuredContent}>
          <div className={styles.featuredImageContainer}>
            {isLoading ? (
              <div className={styles.imagePlaceholder}>로딩 중...</div>
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt={currentGame.gameTitle}
                className={styles.featuredImage}
              />
            ) : (
              <div className={styles.noImage}>이미지가 없습니다</div>
            )}
          </div>
  
          <div className={styles.featuredInfo}>
            <h2 className={styles.featuredGameTitle}>
              {currentGame.gameTitle}
            </h2>
            <div className={styles.featuredGameMeta}>
              <span>출시일: {new Date(currentGame.gamePublicationDate).toLocaleDateString()}</span>
              <span>평점: {currentGame.gameUserScore}/10</span>
            </div>
            
            {currentGame.gameShortDescription && (
              <div className={styles.featuredShortDescription}>
                {currentGame.gameShortDescription}
              </div>
            )}
  
            <div className={styles.featuredTags}>
              {currentGame.gameCategory.split(',').map((tag, index) => (
                <span key={index} className={styles.featuredTag}>
                  {tag.trim()}
                </span>
              ))}
            </div>
  
            {currentGame.gameDescription && (
              <div className={styles.featuredDescription}>
                {currentGame.gameDescription}
              </div>
            )}
  
            <div className={styles.featuredPricing}>
              {currentGame.gameDiscount > 0 ? (
                <>
                  <span className={styles.featuredDiscount}>
                    -{currentGame.gameDiscount}%
                  </span>
                  <div className={styles.featuredPrices}>
                    <span className={styles.featuredOriginalPrice}>
                      ${currentGame.gamePrice.toFixed(2)}
                    </span>
                    <span className={styles.featuredFinalPrice}>
                      ${(currentGame.gamePrice * (1 - currentGame.gameDiscount / 100)).toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <span className={styles.featuredFinalPrice}>
                  ${currentGame.gamePrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
  
          <button
            onClick={handlePrevious}
            className={`${styles.featuredNavButton} ${styles.featuredNavButtonLeft}`}
            aria-label="이전 게임"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={handleNext}
            className={`${styles.featuredNavButton} ${styles.featuredNavButtonRight}`}
            aria-label="다음 게임"
          >
            <ChevronRight />
          </button>
        </div>
  
        <div className={styles.featuredControls}>
          {Array.from({ length: games.length }, (_, i) => (
            <div
              key={i}
              className={`${styles.featuredDot} ${i === currentIndex ? styles.active : ''}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      </div>
    );
};

/**
 * 개별 게임 카드 컴포넌트
 */
const GameCard = ({ game }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      const loadGameImage = async () => {
        try {
          const response = await axios.get(`/game/image/${game.gameNo}`);
          if (response.data && response.data.length > 0) {
            const imageUrl = `${process.env.REACT_APP_BASE_URL}/game/download/${response.data[0].attachmentNo}`;
            setImageUrl(imageUrl);
          }
        } catch (error) {
          console.error('이미지 로딩 실패:', error);
        }
      };
  
      loadGameImage();
    }, [game.gameNo]);
  
    return (
      <div 
        className={styles.gameCard}
        onClick={() => navigate(`/game/detail/${game.gameNo}`)}
      >
        <div className={styles.gameImageContainer}>
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={game.gameTitle} 
              className={styles.gameImage} 
            />
          )}
        </div>
        
        <div className={styles.gameInfo}>
          <h3 className={styles.gameTitle}>{game.gameTitle}</h3>
          <div className={styles.tags}>
            {game.gameCategory.split(',').map((tag, index) => (
              <span key={index} className={styles.tag}>{tag.trim()}</span>
            ))}
          </div>
          <div className={styles.pricing}>
            {game.gameDiscount > 0 ? (
              <>
                <span className={styles.discount}>-{game.gameDiscount}%</span>
                <div className={styles.prices}>
                  <span className={styles.originalPrice}>
                    ${game.gamePrice.toFixed(2)}
                  </span>
                  <span className={styles.finalPrice}>
                    ${(game.gamePrice * (1 - game.gameDiscount / 100)).toFixed(2)}
                  </span>
                </div>
              </>
            ) : (
              <span className={styles.finalPrice}>
                ${game.gamePrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    );
};

/**
 * AllUsers 메인 컴포넌트
 * 전체이용가 게임 카테고리 페이지의 전체 구조를 정의
 */
const AllUsers = () => {
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sorting, setSorting] = useState('recent');
    const [activeFilter, setActiveFilter] = useState('all');
    const gamesPerPage = 12;
  
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
  
    useEffect(() => {
      const fetchGames = async () => {
        try {
          setLoading(true);
          const response = await axios.get('/game/');
          // 전체이용가 게임만 필터링
          const allUsersGames = response.data.filter(game =>
            game.gameGrade === "전체이용가"
          );
  
          // 정렬 적용
          const sortedGames = [...allUsersGames].sort((a, b) => {
            switch(sorting) {
              case 'popular':
                return b.gameUserScore - a.gameUserScore;
              case 'price':
                return a.gamePrice - b.gamePrice;
              case 'recent':
              default:
                return new Date(b.gamePublicationDate) - new Date(a.gamePublicationDate);
            }
          });
  
          setGames(sortedGames);
          setLoading(false);
        } catch (error) {
          console.error('게임 데이터 로딩 실패:', error);
          setError('게임 데이터를 불러오는데 실패했습니다.');
          setLoading(false);
        }
      };
  
      fetchGames();
    }, [sorting]);
  
    const filteredGames = useMemo(() => {
      if (activeFilter === 'all') return games;
      return games.filter(game => 
        game.gameCategory.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }, [games, activeFilter]);
  
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  
    const handleSortChange = (event) => {
      setSorting(event.target.value);
      setCurrentPage(1);
    };
  
    if (loading) return <div className={styles.loading}>로딩 중...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (games.length === 0) return <div className={styles.noGames}>게임을 찾을 수 없습니다</div>;
  
    return (
      <div className={styles.categoryContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.categoryHeader}>
            <h1 className={styles.categoryTitle}>{CATEGORY_CONFIG.name} 게임</h1>
            <p className={styles.categoryDescription}>{CATEGORY_CONFIG.description}</p>
          </div>
  
          <FeaturedSection games={games.slice(0, 5)} />
  
          <div className={styles.categoryFilters}>
            {FILTER_OPTIONS.map(filter => (
              <button
                key={filter.id}
                className={`${styles.filterButton} ${
                  activeFilter === filter.id ? styles.active : ''
                }`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.name}
              </button>
            ))}
          </div>
  
          <div className={styles.controls}>
            <div className={styles.resultCount}>
              {filteredGames.length}개의 게임
            </div>
            <select 
              className={styles.sortSelect}
              value={sorting}
              onChange={handleSortChange}
            >
              <option value="recent">최신순</option>
              <option value="popular">인기순</option>
              <option value="price">가격순</option>
            </select>
          </div>
  
          <div className={styles.gameList}>
            {currentGames.map(game => (
              <GameCard key={game.gameNo} game={game} />
            ))}
          </div>
  
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <span className={styles.pageInfo}>{currentPage} / {totalPages}</span>
              <button
                className={styles.pageButton}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={20} />
              </button>
            </div>

)}
</div>
</div>
);
};

export default AllUsers;