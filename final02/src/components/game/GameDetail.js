import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from './GameDetail.module.css';
import { Tag, ThumbsUp, ThumbsDown, Share2, Flag } from 'lucide-react';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";

/**
 * 게임 상세 정보를 표시하는 컴포넌트
 * 게임 정보, 이미지, 리뷰 등을 포함
 */
const GameDetail = () => {
    // 라우터 관련 훅
    const navigate = useNavigate();
    const { gameNo } = useParams();

    // Recoil 상태
    const login = useRecoilValue(loginState);         // 로그인 상태
    const memberId = useRecoilValue(memberIdState);   // 로그인한 회원 ID
    const memberLoading = useRecoilValue(memberLoadingState);  // 회원 정보 로딩 상태

    // 게임 관련 상태
    const [game, setGame] = useState(null);           // 게임 정보
    const [loading, setLoading] = useState(true);     // 로딩 상태
    const [activeTab, setActiveTab] = useState('overview');  // 활성 탭
    
    // 이미지 관련 상태
    const [imageUrl, setImageUrl] = useState(null);   // 현재 선택된 이미지 URL
    const [images, setImages] = useState([]);         // 모든 이미지 URL 목록
    const [selectedImage, setSelectedImage] = useState(0);  // 선택된 이미지 인덱스

    // 리뷰 관련 상태
    const [reviews, setReviews] = useState([]);       // 리뷰 목록
    const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
    const [totalPages, setTotalPages] = useState(1);   // 총 페이지 수
    const [popularReviews, setPopularReviews] = useState([]); // 인기 리뷰 목록
    const [isWritingReview, setIsWritingReview] = useState(false); // 리뷰 작성 모드
    const [newReview, setNewReview] = useState({      // 새 리뷰 데이터
        reviewContent: "",
        reviewScore: 5
    });

    /**
     * 게임 데이터와 이미지를 로드하는 함수
     * 게임 정보와 이미지를 병렬로 요청
     */
    const loadGameData = useCallback(async () => {
        try {
            const [gameResponse, imageResponse] = await Promise.all([
                axios.get(`http://localhost:8080/game/${gameNo}`),
                axios.get(`http://localhost:8080/game/image/${gameNo}`)
            ]);

            setGame(gameResponse.data);

            if (imageResponse.data && imageResponse.data.length > 0) {
                const imageUrls = imageResponse.data.map(img => 
                    `http://localhost:8080/game/download/${img.attachmentNo}`
                );
                setImages(imageUrls);
                setImageUrl(imageUrls[0]);
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    }, [gameNo]);

    /**
     * 리뷰 목록을 페이지별로 로드하는 함수
     * @param {number} page - 페이지 번호
     */
    const loadReviews = useCallback(async (page) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/game/${gameNo}/reviews?page=${page}&size=10`
            );
            setReviews(response.data.reviews);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("리뷰 조회 실패:", error);
        }
    }, [gameNo]);

    /**
     * 인기 리뷰 목록을 로드하는 함수
     * 좋아요가 많은 순으로 최근 30일 이내의 리뷰를 조회
     */
    const loadPopularReviews = useCallback(async () => {
        try {
            const response = await axios.get(
                `http://localhost:8080/game/${gameNo}/reviews/popular`
            );
            setPopularReviews(response.data);
        } catch (error) {
            console.error("인기 리뷰 조회 실패:", error);
        }
    }, [gameNo]);

    /**
     * 장바구니에 게임을 추가하는 함수
     * @param {Object} game - 추가할 게임 정보
     */
    const addCart = useCallback(async (game) => {
        try {
            const resp = await axios.post("/cart/add", game, {
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            navigate("/cart/");
        } catch (error) {
            console.error("Error adding item to cart", error);
            window.alert("이미 장바구니에 있는 게임입니다");
        }
    }, [navigate]);

    /**
     * 위시리스트에 게임을 추가하는 함수
     * @param {Object} game - 추가할 게임 정보
     */
    const addWishList = useCallback(async (game) => {
        try {
            const token = sessionStorage.getItem('refreshToken');
            const resp = await axios.post("/wishlist/add", game, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            navigate("/wishlist/");
        } catch (error) {
            console.error("Error adding item to wishlist", error);
            window.alert("이미 찜에 있는 게임입니다");
        }
    }, [navigate]);

    // 초기 데이터 로드
    useEffect(() => {
        loadGameData();
        loadReviews(1);
        loadPopularReviews();
    }, [loadGameData, loadReviews, loadPopularReviews]);

    // 로딩 상태 처리
    if (loading) return <div className={styles.loading}>로딩 중...</div>;
    if (!game) return <div className={styles.error}>게임을 찾을 수 없습니다</div>;

    /**
     * 썸네일 이미지 클릭 처리 함수
     * @param {number} index - 선택된 이미지 인덱스
     */
    const handleThumbnailClick = (index) => {
        setSelectedImage(index);
        setImageUrl(images[index]);
    };
/**
    * 리뷰 좋아요 처리 함수
    * @param {number} reviewNo - 리뷰 번호
    */
const handleLikeReview = async (reviewNo) => {
    if (!login) {
        alert("로그인이 필요합니다.");
        return;
    }

    try {
        const token = sessionStorage.getItem('refreshToken');
        await axios.post(`http://localhost:8080/game/${gameNo}/review/${reviewNo}/like`, null, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        loadReviews(currentPage);
    } catch (error) {
        console.error("좋아요 실패:", error);
    }
};

/**
 * 리뷰 작성 제출 처리 함수
 */
const submitReview = async () => {
    if (!login) {
        alert("로그인이 필요합니다.");
        return;
    }

    try {
        const token = sessionStorage.getItem('refreshToken');
        await axios.post(`http://localhost:8080/game/${gameNo}/review`, newReview, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        setIsWritingReview(false);
        setNewReview({ reviewContent: "", reviewScore: 5 });
        loadReviews(1);
        loadGameData(); // 게임 평점 업데이트를 위한 새로고침
    } catch (error) {
        if (error.response?.data.includes("이미 리뷰를 작성했습니다")) {
            alert("이미 리뷰를 작성했습니다.");
        } else {
            console.error("리뷰 작성 실패:", error);
        }
    }
};

return (
    <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
            {/* 게임 제목 영역 */}
            <div className={styles.titleArea}>
                <h1>{game.gameTitle}</h1>
                <div className={styles.developerInfo}>
                    <span>개발: {game.gameDeveloper}</span>
                    <span>배급: {game.gameDeveloper}</span>
                </div>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className={styles.mainContent}>
                {/* 좌측: 미디어 섹션 */}
                <div className={styles.mediaSection}>
                    <div className={styles.mainImageContainer}>
                        {imageUrl && (
                            <img 
                                src={imageUrl} 
                                alt={game.gameTitle} 
                                className={styles.mainImage}
                            />
                        )}
                    </div>
                    <div className={styles.thumbnailStrip}>
                        {images.map((img, index) => (
                            <img 
                                key={index}
                                src={img}
                                alt={`${game.gameTitle} 스크린샷 ${index + 1}`}
                                className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
                                onClick={() => handleThumbnailClick(index)}
                            />
                        ))}
                    </div>
                    <div className={styles.description}>
                        <div dangerouslySetInnerHTML={{ __html: game.gameDescription }} />
                    </div>
                </div>

                {/* 우측: 게임 정보 섹션 */}
                <div className={styles.infoSection}>
                    {imageUrl && (
                        <img 
                            src={imageUrl} 
                            alt={game.gameTitle} 
                            className={styles.infoImage}
                        />
                    )}
                    <div className={styles.gameInfo}>
                        <div className={styles.shortDescription}>
                            {game.gameShortDescription}
                        </div>
                        
                        <div className={styles.metaInfo}>
                            <div>출시일: {new Date(game.gamePublicationDate).toLocaleDateString()}</div>
                            <div>개발사: {game.gameDeveloper}</div>
                            <div>이용등급: {game.gameGrade}</div>
                        </div>

                        <div className={styles.tagSection}>
                            <h3>인기 태그:</h3>
                            <div className={styles.tags}>
                                {game.gameCategory.split(',').map((category, index) => (
                                    <span key={index} className={styles.tag}>
                                        {category.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* 가격 정보 섹션 */}
                        <div className={styles.priceSection}>
                            {game.gameDiscount > 0 ? (
                                <>
                                    <div className={styles.discount}>-{game.gameDiscount}%</div>
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
                                <div className={styles.finalPrice}>
                                    ${game.gamePrice.toFixed(2)}
                                </div>
                            )}
                        </div>

                        {/* 구매 버튼 영역 */}
                        <div className={styles.purchaseButtons}>
                            <button className={styles.addToCartButton} onClick={() => addCart(game)}>
                                장바구니에 추가
                            </button>
                            <button className={styles.wishlistButton} onClick={() => addWishList(game)}>
                                위시리스트에 추가
                            </button>
                        </div>
                    </div>

                    {/* 시스템 요구사항 */}
                    <div className={styles.systemRequirements}>
                        <h3>시스템 요구사항</h3>
                        <div className={styles.requirements}>
                            {game.gameSystemRequirement}
                        </div>
                    </div>
                </div>
            </div>

            {/* 리뷰 섹션 */}
            <div className={styles.reviewSection}>
                <h2>고객 리뷰</h2>
                <div className={styles.reviewSummary}>
                    <div className={styles.score}>
                        <span className={styles.scoreNumber}>{game.gameUserScore}</span>/10
                    </div>
                    <div className={styles.reviewCount}>
                        {game.gameReviewCount.toLocaleString()}개의 리뷰
                    </div>
                    {login && (
                        <button 
                            className={styles.writeReviewButton}
                            onClick={() => setIsWritingReview(true)}
                        >
                            리뷰 작성
                        </button>
                    )}
                </div>

                {/* 리뷰 작성 폼 */}
                {isWritingReview && (
                    <div className={styles.reviewForm}>
                        <div className={styles.reviewFormHeader}>
                            <h3>리뷰 작성</h3>
                            <select 
                                value={newReview.reviewScore}
                                onChange={(e) => setNewReview({
                                    ...newReview,
                                    reviewScore: parseInt(e.target.value)
                                })}
                                className={styles.scoreSelect}
                            >
                                {[1,2,3,4,5,6,7,8,9,10].map(score => (
                                    <option key={score} value={score}>{score}/10</option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            value={newReview.reviewContent}
                            onChange={(e) => setNewReview({
                                ...newReview,
                                reviewContent: e.target.value
                            })}
                            className={styles.reviewTextarea}
                            placeholder="이 게임에 대한 평가를 작성해주세요..."
                        />
                        <div className={styles.reviewFormButtons}>
                            <button 
                                className={styles.submitReviewButton}
                                onClick={submitReview}
                            >
                                리뷰 등록
                            </button>
                            <button 
                                className={styles.cancelButton}
                                onClick={() => setIsWritingReview(false)}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}

                {/* 인기 리뷰 목록 */}
                {popularReviews.length > 0 && (
                    <div className={styles.popularReviews}>
                        <h3>가장 도움이 된 리뷰</h3>
                        {popularReviews.map(review => (
                            <div key={review.reviewNo} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <span className={styles.reviewerName}>{review.memberNickname}</span>
                                    <span className={styles.reviewScore}>{review.reviewScore}/10</span>
                                </div>
                                <div className={styles.reviewContent}>{review.reviewContent}</div>
                                <div className={styles.reviewFooter}>
                                    <button 
                                        className={styles.likeButton}
                                        onClick={() => handleLikeReview(review.reviewNo)}
                                    >
                                        <ThumbsUp size={16} /> {review.likes}
                                    </button>
                                    <span className={styles.reviewDate}>
                                        {new Date(review.reviewDate).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 전체 리뷰 목록 */}
                <div className={styles.allReviews}>
                    <h3>모든 리뷰</h3>
                    {reviews.map(review => (
                        <div key={review.reviewNo} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <span className={styles.reviewerName}>{review.memberNickname}</span>
                                <span className={styles.reviewScore}>{review.reviewScore}/10</span>
                            </div>
                            <div className={styles.reviewContent}>{review.reviewContent}</div>
                            <div className={styles.reviewFooter}>
                                <button 
                                    className={styles.likeButton}
                                    onClick={() => handleLikeReview(review.reviewNo)}
                                >
                                    <ThumbsUp size={16} /> {review.likes}
                                </button>
                                <span className={styles.reviewDate}>
                                    {new Date(review.reviewDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* 페이지네이션 */}
                    <div className={styles.pagination}>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i + 1}
                                className={`${styles.pageButton} ${currentPage === i + 1 ? styles.activePage : ''}`}
                                onClick={() => {
                                    setCurrentPage(i + 1);
                                    loadReviews(i + 1);
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 관리자 액션 버튼 */}
            <div className={styles.adminActions}>
                <button 
                    className={styles.editButton}
                    onClick={() => navigate(`/game/edit/${gameNo}`)}
                >
                    게임 정보 수정
                </button>
            </div>
        </div>
    </div>
);
};

export default GameDetail;