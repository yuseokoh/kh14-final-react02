// 필요한 React 훅과 외부 라이브러리를 임포트합니다.
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, ChevronDown, Tag, Users, Gamepad } from 'lucide-react'; 
import styles from './Home.module.css';
import bannerImage from '../components/game/gameimg/webm_page_bg_koreana (1).gif';
import { useNavigate } from 'react-router';
import { useRecoilValue } from 'recoil';
import { loginState, memberLevelState } from '../utils/recoil';

/**
 * FeaturedBanner 컴포넌트
 * 메인 페이지 상단에 특별 이벤트나 프로모션을 위한 큰 배너를 표시합니다.
 * @param {string} bannerAlt - 배너 이미지의 대체 텍스트
*/
const FeaturedBanner = ({ bannerAlt }) => {
  return(
    <div className={styles.FeaturedBanner}>
      <img src={bannerImage} alt={bannerAlt} className={styles.bannerImage}/>
    </div>
  );
};

/**
 * FeaturedGame 컴포넌트
 * 추천 게임을 큰 카드 형태로 표시하는 컴포넌트입니다.
 * @param {Object} game - 게임 정보 객체
 */
const FeaturedGame = ({ game }) => {
  // 이미지 URL 상태 관리
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  // 게임 이미지 로드 효과
  useEffect(() => {
    const loadGameImage = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if (response.data && response.data.length > 0) {
          setImageUrl(`http://localhost:8080/game/download/${response.data[0].attachmentNo}`);
        }
      } catch (error) {
        console.error("이미지 로딩 에러:", error);
      }
    };
    loadGameImage();
  }, [game.gameNo]);

  return (
    <div 
      className={styles.featuredGame}
      onClick={() => navigate(`/game/detail/${game.gameNo}`, { replace: true })}
      style={{ cursor: 'pointer' }}
    >
      <img 
        src={imageUrl} 
        alt={game.gameTitle} 
        className={styles.featuredGameImage}
      />
      <div className={styles.featuredGameInfo}>
        <h3 className={styles.featuredGameTitle}>{game.gameTitle}</h3>
        <div>
          {/* 게임 카테고리 태그 표시 */}
          {game.gameCategory.split(',').map((category, index) => (
            <span key={index} className={styles.tag}>{category.trim()}</span>
          ))}
        </div>
        <div>
          {/* 할인 정보 및 가격 표시 */}
          {game.gameDiscount > 0 ? (
            <>
              <span className={styles.discountBadge}>-{game.gameDiscount}%</span>
              <span className={styles.originalPrice}>${game.gamePrice.toFixed(2)}</span>
              <span className={styles.discountedPrice}>
                ${(game.gamePrice * (1 - game.gameDiscount / 100)).toFixed(2)}
              </span>
            </>
          ) : game.gamePrice === 0 ? (
            <span className={styles.discountedPrice}>무료 플레이</span>
          ) : (
            <span className={styles.discountedPrice}>${game.gamePrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * GameCard 컴포넌트
 * 개별 게임을 작은 카드 형태로 표시하는 컴포넌트입니다.
 * @param {Object} game - 게임 정보 객체
 */
const GameCard = ({ game }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGameImage = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if (response.data && response.data.length > 0) {
          setImageUrl(`http://localhost:8080/game/download/${response.data[0].attachmentNo}`);
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
        <img 
          src={imageUrl} 
          alt={game.gameTitle} 
          className={styles.gameImage}
        />
      </div>
      
      <div className={styles.gameInfo}>
        <h3 className={styles.gameTitle}>{game.gameTitle}</h3>
        {/* 게임 카테고리 태그 표시 */}
        <div className={styles.gameListTags}>
          {game.gameCategory.split(',').map((category, index) => (
            <span key={index} className={styles.gameListTag}>
              {category.trim()}
            </span>
          ))}
        </div>
        {/* 가격 정보 표시 */}
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

/**
 * CategoryCard 컴포넌트
 * 게임 카테고리를 카드 형태로 표시하는 컴포넌트입니다.
 * @param {ReactNode} icon - 카테고리 아이콘
 * @param {string} title - 카테고리 제목
 */
const CategoryCard = ({ icon, title }) => (
  <div className={styles.categoryCard}>
    <span className={styles.categoryIcon}>{icon}</span>
    <span className={styles.categoryTitle}>{title}</span>
  </div>
);

/**
 * VerticalGameCard 컴포넌트
 * 게임을 세로로 긴 카드 형태로 표시하는 컴포넌트입니다.
 * @param {Object} game - 게임 정보 객체
 */
const VerticalGameCard = ({ game }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGameImage = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if (response.data && response.data.length > 0) {
          setImageUrl(`http://localhost:8080/game/download/${response.data[0].attachmentNo}`);
        }
      } catch (error) {
        console.error("이미지 로딩 에러:", error);
      }
    };
    loadGameImage();
  }, [game.gameNo]);

  return (
    <div 
      className={styles.verticalCard}
      onClick={() => navigate(`/game/detail/${game.gameNo}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.verticalCardImage}>
        <img 
          src={imageUrl} 
          alt={game.gameTitle} 
          className={styles.verticalCardImage}
        />
      </div>
      <div className={styles.verticalCardInfo}>
        <h3 className={styles.verticalCardTitle}>{game.gameTitle}</h3>
        <div className={styles.verticalCardTags}>{game.gameCategory}</div>
        <div>
          {/* 할인 정보 및 가격 표시 */}
          {game.gameDiscount > 0 ? (
            <>
              <span className={styles.discountBadge}>-{game.gameDiscount}%</span>
              <span className={styles.originalPrice}>${game.gamePrice.toFixed(2)}</span>
              <span className={styles.discountedPrice}>
                ${(game.gamePrice * (1 - game.gameDiscount / 100)).toFixed(2)}
              </span>
            </>
          ) : game.gamePrice === 0 ? (
            <span className={styles.discountedPrice}>무료 플레이</span>
          ) : (
            <span className={styles.discountedPrice}>${game.gamePrice.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * HorizontalSlider 컴포넌트
 * 게임 목록을 가로로 슬라이드하며 표시하는 컴포넌트입니다.
 * @param {Array} games - 게임 목록
 * @param {number} itemsPerPage - 페이지당 표시할 아이템 수
 */
const HorizontalSlider = ({ games, itemsPerPage = 4 }) => {
  // 현재 슬라이드 인덱스와 애니메이션 상태 관리
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const totalPages = Math.ceil(games.length / itemsPerPage);

  // 다음 슬라이드로 이동
  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + itemsPerPage;
      return nextIndex >= games.length ? 0 : nextIndex;
     });
     setTimeout(() => setIsAnimating(false), 300);
  };

  // 이전 슬라이드로 이동
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
    <div>
      <div className={styles.horizontalSlider}>
        {/* 슬라이더 컨테이너 */}
        <div 
          className={styles.horizontalSliderContainer} 
          style={{ 
            transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
            transition: 'transform 0.3s ease-in-out'
          }}
        >
          {games.map((game, index) => (
            <div 
              key={game.gameNo}
              className={styles.sliderItem}
              style={{ flex: `0 0 ${100 / itemsPerPage}%` }}
            >
              <GameCard game={game} />
            </div>
          ))}
        </div>

        {/* 슬라이더 네비게이션 버튼 */}
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
      {/* 페이지 인디케이터 닷 */}
      <div className={styles.dotsContainer}>
        {Array.from({ length: totalPages }, (_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${Math.floor(currentIndex / itemsPerPage) === i ? styles.active : ''}`}
          />
        ))}
      </div>
    </div>
  );
};
/**
 * VerticalCardSlider 컴포넌트
 * 세로형 카드를 가로로 정렬하여 슬라이더로 표시하는 컴포넌트입니다.
 * @param {Array} games - 게임 목록
 * @param {number} itemsPerPage - 페이지당 표시할 아이템 수
 */
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
    if(isAnimating) return;
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
        {games.map((game,index) => (
          <div
            key={game.gameNo}
            className={styles.vertgicalCardSliderItem}
            style={{ flex : `0 0 ${100 / itemsPerPage}%` }}
          >
            <VerticalGameCard game={game}/>
          </div>
        ))} 
      </div>

      {/* 슬라이더 네비게이션 버튼 */}
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

/**
 * Sidebar 컴포넌트
 * 웹사이트의 사이드바를 표시하는 컴포넌트입니다.
 * 카테고리, 필터, 추천 등의 네비게이션 옵션을 포함합니다.
 */
const Sidebar = () => {
  const navigate = useNavigate();
  
  // 네비게이션 옵션 정의
  const device = [
    { name : 'PC 게임', path: '/device/pc'},
    { name : '모바일 게임', path: '/device/mobile'},
    { name : '콘솔 게임', path: '/device/console'}
  ];
  
  const recommendations = [
    {name : '친구 추천', path: '/recommendations/friends'},
    {name : '큐레이터 추천', path: '/recommendations/curators'},
    {name : '태그', path: '/recommendations/tags'}
  ];
  
  const categories = [
    { name: 'Action', path: '/game/category/action' },
    { name: 'Adventure', path: '/game/category/adventure' },
    { name: 'Indie', path: '/game/category/indie' },
    { name: 'RPG', path: '/game/category/rpg' },
    { name: 'Simulation', path: '/game/category/simulation' },
    { name: 'Strategy', path: '/game/category/strategy' },
    { name: 'Open World', path: '/game/category/openworld' },
    { name: 'Multiplayer', path: '/game/category/multiplayer' },
    { name: 'BaseBuilding', path: '/game/category/basebuilding' },
    { name: 'Fantasy', path: '/game/category/fantasy' },
    { name: 'PixelGraphics', path: '/game/category/pixelgraphics' },
    { name: 'Roguelike', path: '/game/category/roguelike' },
    { name: 'Sandbox', path: '/game/category/sandbox' },
    { name: 'Survival', path: '/game/category/survival' }
  ];
  
  const others = [
    {name: 'Free to Play', path: '/other/freetoplay'},
    {name: 'Early Access', path: '/other/earlyaccess'},
    {name: 'Co-op', path: '/other/coop'},
    {name: 'VR 지원', path: '/other/vr'},
    {name: '컨트롤러 지원', path: '/other/contoller'}
  ];
  
  const ageRatings = [
    {name: '전체이용가', path: '/rating/all'},
    {name: '12세이용가', path: '/rating/12'},
    {name: '15세이용가', path: '/rating/15'},
    {name: '19세이용가', path: '/rating/19'}
  ];

  return (
    <div className={styles.sidebar}>
      {/* 최근 본 게임 섹션 */}
      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarSectionTitle}>최근 본 게임</h3>
        <p className={styles.sidebarSectionContent}>사이버펑크 2077</p>
      </div>
      
      {/* 추천 섹션 */}
      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarSectionTitle}>추천</h3>
        <ul className={styles.sidebarSectionList}>
          {recommendations.map((rec, index) => (
            <li
              key={index}
              className={styles.categoryLink}
              onClick={() => navigate(rec.path)}
            >
              {rec.name}
            </li>
          ))}
        </ul>
      </div>
      
      {/* 카테고리 섹션 */}
      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarSectionTitle}>카테고리</h3>
        <ul className={styles.sidebarSectionList}>
          {categories.map((category, index) =>(
            <li
              key={index}
              className={styles.categoryLink}
              onClick={() => navigate(category.path)}
            >
              {category.name}
            </li>
          ))}
        </ul>
      </div>
      
      {/* 기타 섹션 */}
      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarSectionTitle}>기타</h3>
        <ul className={styles.sidebarSectionList}>
          {others.map((other, index) => (
            <li
              key={index}
              className={styles.categoryLink}
              onClick={() => navigate(other.path)}
            >
              {other.name}
            </li>
          ))}
        </ul>
      </div>

      {/* 연령 등급 섹션 */}
      <div className={styles.sidebarSection}>
        <h3 className={styles.sidebarSectionTitle}>연령 등급</h3>
        <ul className={styles.sidebarSectionList}>
          {ageRatings.map((rating, index) => (
            <li
              key={index}
              className={styles.categoryLink}
              onClick={() => navigate(rating.path)}
            >
              {rating.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

/**
 * GameListItem 컴포넌트
 * 게임 목록에서 개별 게임 항목을 표시하는 컴포넌트입니다.
 * @param {Object} game - 게임 정보 객체
 */
const GameListItem = ({ game }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadGameImage = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if (response.data && response.data.length > 0) {
          setImageUrl(`http://localhost:8080/game/download/${response.data[0].attachmentNo}`);
        }
      } catch (error) {
        console.error("이미지 로딩 에러:", error);
      }
    };
    loadGameImage();
  }, [game.gameNo]);

  return (
    <div 
      className={styles.gameListItem}
      onClick={() => navigate(`/game/detail/${game.gameNo}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.gameListImage}>
        <img 
          src={imageUrl} 
          alt={game.gameTitle} 
          className={styles.gameListImage}
        />
      </div>
      <div className={styles.gameListInfo}>
        <h3 className={styles.gameListTitle}>{game.gameTitle}</h3>
        <div className={styles.gameListTags}>
          {game.gameCategory.split(',').map((category, index) => (
            <span key={index} className={styles.gameListTag}>
              {category.trim()}
            </span>
          ))}
        </div>
        <div className={styles.gameListPricing}>
          {game.gameDiscount > 0 ? (
            <>
              <span className={styles.gameListDiscount}>-{game.gameDiscount}%</span>
              <div className={styles.gameListPrices}>
                <span className={styles.gameListOriginalPrice}>
                  ${game.gamePrice.toFixed(2)}
                </span>
                <span className={styles.gameListFinalPrice}>
                  ${(game.gamePrice * (1 - game.gameDiscount / 100)).toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <span className={styles.gameListFinalPrice}>
              ${game.gamePrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className={styles.gameListMeta}>
          <span>{game.gameGrade}</span>
          <span>평점: {game.gameUserScore}/10</span>
          <span>리뷰: {game.gameReviewCount.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Home 컴포넌트
 * 웹사이트의 메인 페이지를 구성하는 최상위 컴포넌트입니다.
 */
const Home = () => {
  // 상태 관리
  const [games, setGames] = useState([]); // 전체 게임 목록
  const [featuredIndex, setFeaturedIndex] = useState(0); // 추천 게임 인덱스
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태
  const [visiblegames, setVisibleGames] = useState(10); // 표시할 게임 수
  const [activeFilter, setActiveFilter] = useState(''); // 활성화된 필터

  const memberLevel = useRecoilValue(memberLevelState);
  const isLoggedIn = useRecoilValue(loginState);

  const navigate = useNavigate();

  // 필터 옵션 정의
  const filterOptions = [
    { id: 'all', name: '전체' },
    { id: 'action', name: '액션' },
    { id: 'adventure', name: '어드벤처' },
    { id: 'rpg', name: 'RPG' },
    { id: 'simulation', name: '시뮬레이션' },
    { id: 'strategy', name: '전략' },
    { id: 'indie', name: '인디' }
  ];

  // 할인 게임 필터링 (20% 이상)
  const discountedGames = useMemo(() => {
    return games.filter(game => game.gameDiscount >= 20);
  }, [games]);

  // 신작 게임 필터링 (2021년 이후)
  const newGames = useMemo(() => {
    const cutoffDate = new Date('2021-01-01');
    return games.filter(game => {
      const releaseDate = new Date(game.gamePublicationDate);
      return releaseDate >= cutoffDate;
    });
  }, [games]);

  // 인기 게임 필터링 (평점 9점 이상)
  const topGames = useMemo(() => {
    return games.filter(game => game.gameUserScore >= 9);
  }, [games]);

  // 선택된 필터에 따라 게임 목록 필터링
  const filteredGames = useMemo(() => {
    if (activeFilter === 'all') return games;
    return games.filter(game => 
      game.gameCategory.toLowerCase().includes(activeFilter.toLowerCase())
    );
  }, [games, activeFilter]);

  // 게임 데이터 로딩
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/game/');
        setGames(response.data);
        setLoading(false);
      } catch (err) {
        setError('게임 데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  // 필터 변경 시 visible games 리셋
  useEffect(() => {
    setVisibleGames(10);
  }, [activeFilter]);

  // 더 보기 버튼 핸들러
  const handleShowMore = () => {
    setVisibleGames(prev => Math.min(prev + 10, filteredGames.length));
  };

  // 로딩, 에러, 빈 데이터 처리
  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (games.length === 0) return <div>게임이 없습니다.</div>;

  return (
    <div className={styles.homeContainer}>
      <FeaturedBanner bannerAlt="Steam Next Fest Banner" />
      <div className={styles.contentWrapper}>
      <Sidebar />
        <div className={styles.contentContainer}>
          <div className={styles.mainContent}>
            {/* 추천 게임 섹션 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>추천 게임</h2>
              <div style={{ position: 'relative' }}>
                <FeaturedGame game={games[featuredIndex]} />
                <button
                  className={`${styles.sliderButton} ${styles.sliderButtonLeft}`}
                  onClick={() => setFeaturedIndex(prev => prev === 0 ? games.length - 1 : prev - 1)}
                >
                  <ChevronLeft color="white" size={24} />
                </button>
                <button
                  className={`${styles.sliderButton} ${styles.sliderButtonRight}`}
                  onClick={() => setFeaturedIndex(prev => prev === games.length - 1 ? 0 : prev + 1)}
                >
                  <ChevronRight color="white" size={24} />
                </button>
              </div>
            </section>

            {/* 특별 할인 섹션 - 20% 이상 할인 게임 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>특별 할인</h2>
              <HorizontalSlider games={discountedGames} itemsPerPage={4} />
            </section>

            {/* 신작 게임 섹션 - 2021년 이후 출시 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>신작 게임</h2>
              <HorizontalSlider games={newGames} itemsPerPage={6} />
            </section>

            {/* 최고 인기 게임 섹션 - 평점 9점 이상 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>최고 평점</h2>
              <VerticalCardSlider games={topGames} itemsPerPage={8} />
            </section>

            {/* 전체 게임 목록 섹션 */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>전체 게임 목록</h2>
                {/* 개발자 회원만 게임 등록 버튼 표시 */}
                {memberLevel === '개발자' && (
                  <button
                    className={styles.addGameButton}
                    onClick={() => navigate('/game/add')}
                  >
                    게임 등록
                  </button>
                )}
              </div>

              {/* 게임 목록 표시 */}
              <div className={styles.gameList}>
                {games.slice(0, visiblegames).map(game => (
                  <GameListItem key={game.gameNo} game={game} />
                ))}

                {/* 더보기 버튼 */}
                {visiblegames < games.length && (
                  <div className={styles.showMoreContainer}>
                    <button
                      onClick={handleShowMore}
                      className={styles.showMoreTrigger}
                    >
                      <div className={styles.showMoreContent}>
                        <ChevronDown size={20} />
                        <span>더 보기</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* 카테고리 섹션 */}
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>카테고리</h2>
              <div className={styles.grid}>
                <CategoryCard icon={<Tag color="white" size={24} />} title="무료 게임" />
                <CategoryCard icon={<Users color="white" size={24} />} title="멀티플레이어" />
                <CategoryCard icon={<Gamepad color="white" size={24} />} title="컨트롤러 지원" />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

// Home 컴포넌트 내보내기
export default Home;