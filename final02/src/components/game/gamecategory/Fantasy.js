/**
 * FantasyGame.js
 * 액션 게임 카테고리 페이지를 위한 메인 컴포넌트
 * Steam 스타일의 게임 목록 및 필터링 기능을 제공
 */

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Category.module.css';

/**
 * 카테고리별 설정을 관리하는 객체
 * - 각 카테고리 페이지의 고유한 설정을 정의
 * - 다른 카테고리 페이지에서 이 부분만 수정하여 재사용 가능
 */
// Fantasy.js
const CATEGORY_CONFIG = {
  name: 'Fantasy',
  description: '마법과 판타지가 가득한 세계를 경험해보세요',
  tags: ['마법', '판타지', 'RPG', '모험'],
  filterKey: 'fantasy'
};

/**
 * 필터 옵션 설정
 * 카테고리 필터링을 위한 옵션 목록
 */
const FILTER_OPTIONS = [
  { id: 'all', name: '특집' },
  { id: 'Fantasy', name: '판타지' },
  { id: 'rpg', name: 'RPG' },
  { id: 'strategy', name: '전략' },
  { id: 'simulation', name: '시뮬레이션' },
  { id: 'adventure', name: '어드벤처' }
];

/**
 * 피처드 게임 섹션을 표시하는 컴포넌트
 * - 카테고리 페이지 상단의 하이라이트된 게임을 표시
 * - 이미지 슬라이더와 게임 정보를 포함
 * - Steam 스타일의 레이아웃 적용
 * 
 * @param {Object[]} games - 표시할 게임 목록
 */
const FeaturedSection = ({ games }) => {
    // 상태 관리
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageUrl, setImageUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
  
    // 이미지 로딩 효과
    useEffect(() => {
      // 새 게임으로 전환 시 상태 초기화
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
  
    // 네비게이션 핸들러
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
        {/* 배경 이미지 및 블러 효과 */}
        <div className={styles.featuredBackground}>
          {imageUrl && (
            <img
              src={imageUrl}
              alt=""
              className={styles.featuredBackgroundImage}
            />
          )}
        </div>
        {/* 배경 오버레이 (그라데이션) */}
        <div className={styles.featuredOverlay} />
        
        <div className={styles.featuredContent}>
          {/* 이미지 섹션 (왼쪽) */}
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
  
          {/* 게임 정보 섹션 (오른쪽) */}
          <div className={styles.featuredInfo}>
            <h2 className={styles.featuredGameTitle}>
              {currentGame.gameTitle}
            </h2>
            <div className={styles.featuredGameMeta}>
              <span>출시일: {new Date(currentGame.gamePublicationDate).toLocaleDateString()}</span>
              <span>평점: {currentGame.gameUserScore}/10</span>
            </div>
            
            {/* 게임 설명 */}
            {currentGame.gameShortDescription && (
              <div className={styles.featuredShortDescription}>
                {currentGame.gameShortDescription}
              </div>
            )}
  
            {/* 태그 목록 */}
            <div className={styles.featuredTags}>
              {currentGame.gameCategory.split(',').map((tag, index) => (
                <span key={index} className={styles.featuredTag}>
                  {tag.trim()}
                </span>
              ))}
            </div>
  
            {/* 상세 설명 */}
            {currentGame.gameDescription && (
              <div className={styles.featuredDescription}>
                {currentGame.gameDescription}
              </div>
            )}
  
            {/* 가격 정보 */}
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
  
          {/* 슬라이더 네비게이션 버튼 */}
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
  
        {/* 하단 인디케이터 */}
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
 * 리스트에서 각 게임을 표시하는 카드 형태의 컴포넌트
 * 
 * @param {Object} game - 표시할 게임 정보 객체
 */
const GameCard = ({ game }) => {
    const [imageUrl, setImageUrl] = useState(null);
    const navigate = useNavigate();
  
    // 게임 이미지 로딩
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
   * ActionGame 메인 컴포넌트
   * 액션 게임 카테고리 페이지의 전체 구조를 정의
   */
  const Fantasy = () => {
    // 상태 관리
    const [games, setGames] = useState([]); // 전체 게임 목록
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [sorting, setSorting] = useState('recent'); // 정렬 방식
    const [activeFilter, setActiveFilter] = useState('all'); // 현재 활성화된 필터
    const gamesPerPage = 12; // 페이지당 게임 수
  
    const navigate = useNavigate();

    useEffect(() => {
      window.scrollTo(0, 0);
  }, []);
  
    // 게임 데이터 로딩
    useEffect(() => {
      const fetchGames = async () => {
        try {
          setLoading(true);
          const response = await axios.get('/game/');
          // 액션 게임 필터링
          const Fantasy = response.data.filter(game =>
            game.gameCategory.toLowerCase().includes(CATEGORY_CONFIG.filterKey)
          );
  
          // 정렬 적용
          const sortedGames = [...Fantasy].sort((a, b) => {
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
  
    // 필터링된 게임 목록
    const filteredGames = useMemo(() => {
      if (activeFilter === 'all') return games;
      return games.filter(game => 
        game.gameCategory.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }, [games, activeFilter]);
  
    // 페이지네이션 처리
    const indexOfLastGame = currentPage * gamesPerPage;
    const indexOfFirstGame = indexOfLastGame - gamesPerPage;
    const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
    const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  
    // 정렬 변경 핸들러
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
          {/* 카테고리 헤더 */}
          <div className={styles.categoryHeader}>
            <h1 className={styles.categoryTitle}>{CATEGORY_CONFIG.name} 게임</h1>
            <p className={styles.categoryDescription}>{CATEGORY_CONFIG.description}</p>
          </div>
  
          {/* 피처드 게임 섹션 */}
          <FeaturedSection games={games.slice(0, 5)} />
  
          {/* 카테고리 필터 버튼 */}
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
  
          {/* 필터 결과 및 정렬 옵션 */}
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
  
          {/* 게임 리스트 */}
          <div className={styles.gameList}>
            {currentGames.map(game => (
              <GameCard key={game.gameNo} game={game} />
            ))}
          </div>
  
          {/* 페이지네이션 */}
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
  
  export default Fantasy;