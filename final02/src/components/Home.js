// 필요한 React 훅과 외부 라이브러리를 임포트합니다.
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, ChevronDown , Tag, Users, Gamepad } from 'lucide-react'; 
import styles from './Home.module.css';
import bannerImage from '../components/game/gameimg/webm_page_bg_koreana (1).gif';
import { useNavigate } from 'react-router';

/**
 * FeaturedBanner 컴포넌트
 * 
 * 이 컴포넌트는 메인 페이지 상단에 특별 이벤트나 프로모션을 위한 큰 배너를 표시합니다.
 * 
 * @param {string} bannerAlt - 배너 이미지의 대체 텍스트
*/

const FeaturedBanner = ({ bannerAlt }) => {
  return(
    <div className={styles.FeaturedBanner}>
      {/* 배너 이미지 표시 */}
      <img src={bannerImage} alt={bannerAlt} className={styles.bannerImage}/>
    </div>
  );
};
  
// 추천 게임을 큰 카드로 표시하는 컴포넌트
const FeaturedGame = ({ game }) => {

  const [imageUrl, setImageUrl] = useState(null);  
  const navigate = useNavigate();
  

  //이미지 로딩을 위한 useEffect 추가
  useEffect(() => {
    const loadGameImage = async () => {
      try{ 
        //게임 이미지 정보 가져오기
        const response = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if(response.data && response.data.length > 0) {
          //첫번째 이미지의 attacnmtentNo로 다운로드 URL 생성
          const imageUrl = `http://localhost:8080/game/download/${response.data[0].attachmentNo}`;
          setImageUrl(imageUrl);
        }
      }
        catch(error){
          console.error("이미지 로딩 에러:", error.response || error);
        }
      };
      loadGameImage();
  },[game.gameNo]); //게임 번호가 변경될때마다 이미지 다시 로드

  return (
    <div 
    className={styles.featuredGame}
    onClick={() => navigate(`/game/detail/${game.gameNo}`, { replace: true })}
    style={{ cursor: 'pointer' }}
  >
    {/* 조건부 랜더링으로 이미지 표시 */}
    {imageUrl ? (
      <img src={imageUrl} alt={game.gameTitle} className={styles.featuredGameImage} />
    ) : (
      <div className={`${styles.featuredGameImage} ${styles[`gameBackground${game.gameNo}`]}`} />
    )}
    <div className={styles.featuredGameInfo}>
      <h3 className={styles.featuredGameTitle}>{game.gameTitle}</h3>
      <div>
        {/* 게임 카테고리를 쉼표로 구분하여 태그로 표시 */}
        {game.gameCategory.split(',').map((category, index) => (
          <span key={index} className={styles.tag}>{category.trim()}</span>
        ))}
      </div>
      <div>
        {/* 할인 여부에 따른 가격 표시 로직 */}
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

// 개별 게임을 작은 카드로 표시하는 컴포넌트
const GameCard = ({ game }) => {

  // 이미지 URL을 관리하기 위한 상태 추가
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();
 
  // 이미지 로딩을 위한 useEffect 추가
  useEffect(() => {
    const loadGameImage = async () => {
      try {
        // 게임 이미지 정보 가져오기
        const response = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if (response.data && response.data.length > 0) {
          // 첫 번째 이미지의 attachmentNo로 다운로드 URL 생성
          const imageUrl = `http://localhost:8080/game/download/${response.data[0].attachmentNo}`;
          setImageUrl(imageUrl);
        }
      } catch (error) {
        console.error("이미지 로딩 에러:", error.response || error);
      }
    };

    loadGameImage();
  }, [game.gameNo]); // 게임 번호가 변경될 때마다 이미지 다시 로드


  return (
    <div 
      className={styles.gameCard}
      onClick={() => navigate(`/game/detail/${game.gameNo}`)}
      style={{ cursor: 'pointer' }}
    >
      {/* 이미지 표시 부분 수정 */}
      <div className={styles.gameImage}>
        {imageUrl ? (
          // 백엔드에서 가져온 이미지가 있으면 표시
          <img src={imageUrl} alt={game.gameTitle} className={styles.gameImage} />
        ) : (
          // 이미지가 없으면 기존 배경 스타일 사용
          <div className={`${styles.gameImage} ${styles[`gameBackground${game.gameNo}`]}`} />
        )}
      </div>
      
      {/* gameInfo 내부 스타일 클래스명 수정 */}
      <div className={styles.gameInfo}>
        <h3 className={styles.gameTitle}>{game.gameTitle}</h3>
        {/* gameListTags -> 스타일 클래스명 수정 */}
        <div className={styles.gameListTags}>
          {game.gameCategory.split(',').map((category, index) => (
            <span key={index} className={styles.gameListTag}>
              {category.trim()}
            </span>
          ))}
        </div>
        {/* gamePricing -> 스타일 클래스명 수정 */}
        <div className={styles.gamePricing}>
          {game.gameDiscount > 0 ? (
            <>
              <span className={styles.discountBadge}>-{game.gameDiscount}%</span>
              {/* gamePrices -> 스타일 클래스명 수정 */}
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
// 게임 카테고리를 카드 형태로 표시하는 컴포넌트
const CategoryCard = ({ icon, title }) => (
  <div className={styles.categoryCard}>
    <span className={styles.categoryIcon}>{icon}</span>
    <span className={styles.categoryTitle}>{title}</span>
  </div>
);

// 게임을 세로로 긴 카드 형태로 표시하는 컴포넌트
const VerticalGameCard = ({ game }) => {

  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  //이미지 로딩을 위한 useEffect
  useEffect(() => {
    const loadGameImage = async () => {
      try {
        // 게임 이미지 정보 가져오기
        const response = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if (response.data && response.data.length > 0) {
          // 첫 번째 이미지의 attachmentNo로 다운로드 URL 생성
          const imageUrl = `http://localhost:8080/game/download/${response.data[0].attachmentNo}`;
          setImageUrl(imageUrl);
        }
      } catch (error) {
        console.error("이미지 로딩 에러:", error.response || error);
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
      {/* 이미지 표시 부분 수정 */}
      <div className={styles.verticalCardImage}>
        {imageUrl ? (
          <img src={imageUrl} alt={game.gameTitle} className={styles.verticalCardImage} />
        ) : (
          <div className={`${styles.verticalCardImage} ${styles[`gameBackground${game.gameNo}`]}`} />
        )}
      </div>
    <div className={styles.verticalCardInfo}>
      <h3 className={styles.verticalCardTitle}>{game.gameTitle}</h3>
      <div className={styles.verticalCardTags}>{game.gameCategory}</div>
      <div>
        {/* 할인 여부에 따른 가격 표시 로직 */}
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

// 게임 목록을 가로 슬라이더로 표시하는 새로운 컴포넌트
const HorizontalSlider = ({ games, itemsPerPage = 4 }) => {
  // 현재 표시 중인 첫 번째 게임의 인덱스를 관리하는 상태
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const totalPages = Math.ceil(games.length / itemsPerPage);

  // 다음 슬라이드로 이동하는 함수  
  const nextSlide = () => {
    if (isAnimating) return; //애니메이션중이면 실행중단
    setIsAnimating(true); //애니메이션 상태를 true로 설정
    setCurrentIndex((prevIndex) => {//인덱스 업데이트
      // 마지막 게임에 도달하면 처음으로 돌아가고, 그렇지 않으면 다음 페이지로 이동
      const nextIndex = prevIndex + itemsPerPage;
      //마지막게임에도달했으면 처음으로 돌아가고, 그렇지않으면 다음페이지로 이동
      return nextIndex >= games.length ? 0 : nextIndex;
     });
     // 애니메이션이 끝난 후 애니메이션 상태를 false로 설정
    setTimeout(() => setIsAnimating(false), 300);
    };

  // 이전 슬라이드로 이동하는 함수
  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - itemsPerPage;
      // 첫 번째 게임이면 마지막 페이지로 이동하고, 그렇지 않으면 이전 페이지로 이동
      return nextIndex < 0 ? Math.max(games.length - itemsPerPage, 0) : nextIndex;
     });
     setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div>
    <div className={styles.horizontalSlider}>
      <div 
        className={styles.horizontalSliderContainer} 
        style={{ 
          // 현재 인덱스에 따라 슬라이더 컨테이너를 이동시킴
          transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` ,
          // 부드러운 이동을 위한 트랜지션 호과 추가
          transition: 'transform 0.3s ease-in-out'
      }}
      >
        {/* 모든 게임을 매핑하여 GameCard 컴포넌트로 랜더링 */}
        {games.map((game, index) => (
          <div 
            key={game.gameNo}
            className={styles.sliderItem}
            //각 아이템의 너비를 itemsPerPage에 따라 설정
            style={{ flex: `0 0 ${100 / itemsPerPage}%` }}
            >
              <GameCard game={game} />
            </div>
          ))}
      </div>


      {/* 이전 슬라이드로 이동하는 버튼 */}
      <button 
        onClick={prevSlide} 
        className={`${styles.sliderButton} ${styles.sliderButtonLeft}`}
        //첫 슬라이드에서는 이전으 로 돌아가는 버튼 비활성화
        disabled={currentIndex === 0}
        >
          <ChevronLeft color="white" size={24} />
      </button>

      {/* 다음 슬라이드로 이동하는 버튼 */}
      <button 
        onClick={nextSlide} 
        className={`${styles.sliderButton} ${styles.sliderButtonRight}`}
        //첫 슬라이드에서는 이전으 로 돌아가는 버튼 비활성화
        disabled={currentIndex + itemsPerPage >= games.length}
      >
        <ChevronRight color="white" size={24} />
      </button>
    </div>
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

//세로형카드를 가로로 정렬하는 슬라이더 컴포넌ㅁ트
const VerticalCardSlider = ({ games, itemsPerPage = 4 }) => {
  // 현재 표시 중인 첫 번째 게임의 인덱스를 관리하는 상태
  const [currentIndex, setCurrentIndex] = useState(0);
  // 슬라이더 애니메이션여부 관리상태
  const [isAnimating, setIsAnimating] = useState(false);

  // 다음 슬라이드로 이동하는 함수
  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + itemsPerPage;
      // 마지막 게임에 도달하면 처음으로 돌아가고, 그렇지 않으면 다음 페이지로 이동
      return nextIndex >= games.length ? 0 : nextIndex;
    });
    setTimeout(() => setIsAnimating(false), 300)
  };

  // 이전 슬라이드로 이동하는 함수
  const prevSlide = () => {
    if(isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - itemsPerPage;
      // 첫 번째 게임이면 마지막 페이지로 이동하고, 그렇지 않으면 이전 페이지로 이동
      return nextIndex < 0 ? Math.max(games.length - itemsPerPage, 0) : nextIndex;
    });
    setTimeout(() => setIsAnimating(false), 300);
  };
 
  return (
    <div className={styles.verticalCardSlider}>
      <div 
      className={styles.verticalCardSliderContainer}
      style={{
        //현재 인덱스에 따라 슬라이더 컨테인 이동
        transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)`,
          // 부드러운 이동을 위한 트랜지션 효과 추가
        transition: 'transform 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'row'
      }}
      >
        {/* 모든 게임을 매핑하여 VerticalGamecard 컴포넌트로 랜더링 */}
        {games.map((game,index) => (
          <div
            key={game.gameNo}
            className={styles.vertgicalCardSliderItem}
            //각 아이템 높이를 itemsPerPage상태에 따라 설정
            style={{ flex : `0 0 ${100 / itemsPerPage}%` }}
            >
              <VerticalGameCard game={game}/>
              </div>
        ))} 
      </div>

      {/* 이전 슬라이드로 이동하는 버튼 */}
      <button
       onClick={prevSlide} 
       className={`${styles.sliderButton} ${styles.sliderButtonLeft}`}
       //첫페이지에서는 이전버튼 비활성화
       disabled={currentIndex === 0}
       >
          <ChevronLeft color="white" size={24} 
       />
      </button>
      {/* 다음 슬라이드로 이동하는 버튼 */}
      <button 
      onClick={nextSlide} className={`${styles.sliderButton} ${styles.sliderButtonRight}`}
      disabled={currentIndex + itemsPerPage >= games.length}
      >
        <ChevronRight color="white" size={24} />
      </button>
    </div>
  );
};

// 사이드바 컴포넌트
const Sidebar = () => {

    const navigate = useNavigate();
  
    const device = [
      { name : 'PC 게임', path: '/device/pc'},
      { name : '모바일 게임', path: '/device/mobile'},
      { name : '콘솔 게임', path: '/device/console'}
    ]
    const recommendations = [
      {name : '친구 추천', path: '/recommendations/friends'},
      {name : '큐레이터 추천', path: '/recommendations/curators'},
      {name : '태그', path: '/recommendations/tags'}
    ]
    
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
    ]
  
    const ageRatings = [
      {name: '전체이용가', path: '/rating/all'},
      {name: '12세이용가', path: '/rating/12'},
      {name: '15세이용가', path: '/rating/15'},
      {name: '19세이용가', path: '/rating/19'}
    ]
  
  
    return (
  <div className={styles.sidebar}>
    <div className={styles.sidebarSection}>
      <h3 className={styles.sidebarSectionTitle}>최근 본 게임</h3>
      <p className={styles.sidebarSectionContent}>사이버펑크 2077</p>
    </div>
    
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

//게임 리스트 아이템 컴포넌트
const GameListItem = ({game}) => {
  const [imageUrl, setImageUrl] = useState(null);
  const navigate = useNavigate();

  //effect
  useEffect(() => {
    const loadGameImage = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/game/image/${game.gameNo}`);
        if (response.data && response.data.length > 0) {
          const imageUrl = `http://localhost:8080/game/download/${response.data[0].attachmentNo}`;
          setImageUrl(imageUrl);
        }
      }
      catch (error){
        console.error("이미지 로딩 에러:", error.response || error);
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
        {imageUrl ? (
          <img src={imageUrl} alt={game.gameTitle} className={styles.gameListImage} />
        ) : (
          <div className={`${styles.gameListImage} ${styles[`gameBackground${game.gameNo}`]}`} />
        )}
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
}

// 메인 홈 컴포넌트
const Home = () => {
  const [games, setGames] = useState([]);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visiblegames, setVisibleGames] = useState(10);
  const [activeFilter, setActiveFilter] = useState('');

  const navigate = useNavigate();

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
  const filterOptions = [
    { id: 'all', name: '전체' },
    { id: 'action', name: '액션' },
    { id: 'adventure', name: '어드벤처' },
    { id: 'rpg', name: 'RPG' },
    { id: 'simulation', name: '시뮬레이션' },
    { id: 'strategy', name: '전략' },
    { id: 'indie', name: '인디' }
  ];

  const filteredGames = useMemo(() => {
    if (activeFilter === 'all') return games;
    return games.filter(game => 
      game.gameCategory.toLowerCase().includes(activeFilter.toLowerCase())
    );
  }, [games, activeFilter]);

  
  // 더보기 버튼 핸들러
  const handleShowMore = () => {
    setVisibleGames(prev => Math.min(prev + 10, filteredGames.length));
  };
 
  // 컴포넌트 마운트 시 게임 데이터를 가져오기 위한 useEffect 훅
  // 게임 데이터 로딩
  useEffect(() => {
    //비동기로 게임 데이터를 가져오는 함수
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
  }, []);//빈배열로 전달해 컴포넌트 마운트시에만 실행하기

    // 필터 변경 시 visible games 리셋
    useEffect(() => {
      setVisibleGames(10);
    }, [activeFilter]);

  // 로딩 중일 때 표시할 내용
  if (loading) return <div>로딩 중...</div>;
  // 에러 발생 시 표시할 내용
  if (error) return <div>{error}</div>;
  // 게임 데이터가 없을 때 표시할 내용
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
                <button
                  className={styles.addGameButton}
                  onClick={() => navigate('/game/add')}
                >
                  게임 등록
                </button>
              </div>

              <div className={styles.gameList}>
                {games.slice(0, visiblegames).map(game => (
                  <GameListItem key={game.gameNo} game={game} />
                ))}

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
                {/* 카테고리 카드들을 표시 */}
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

export default Home;