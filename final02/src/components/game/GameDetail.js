import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from './GameDetail.module.css';
import { Tag, ThumbsUp, ThumbsDown, Share2, Flag, Star } from 'lucide-react';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState, memberLevelState, memberLoadingState } from "../../utils/recoil";
import { useTranslation } from "react-i18next"; // i18next 추가

/**
 * 게임 상세 정보를 표시하는 컴포넌트
 * 게임 정보, 이미지, 리뷰 등을 포함
 */
const StarRating = ({ score }) => {
    const maxStars = 5;
    // 10점 만점을 5점 만점으로 변환
    const normalizedScore = score * (maxStars / 10);
    const starPercentage = normalizedScore ? (normalizedScore / maxStars) * 100 : 0;

    return (
        <div className={styles.starRating}>
            <div className={styles.starRatingOuter}>
                <div 
                    className={styles.starRatingInner} 
                    style={{ width: `${starPercentage}%` }}
                />
            </div>
        </div>
    );
};


const GameDetail = () => {

    const { t } = useTranslation(); // t 함수 추가

    // 라우터 관련 훅
    const navigate = useNavigate();
    const { gameNo } = useParams();

    // Recoil 상태
    const login = useRecoilValue(loginState);         // 로그인 상태
    const memberId = useRecoilValue(memberIdState);   // 로그인한 회원 ID
    const memberLoading = useRecoilValue(memberLoadingState);  // 회원 정보 로딩 상태
    const memberLevel = useRecoilValue(memberLevelState);  //회원 등급 상태 추가

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
    const [ canWriteReview, setCanWriteReview] = useState(true);
    //리뷰 작성 버튼을 표시하기전에 리뷰 작성 가능 여부 확인

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
    
            // 이미지가 있을 경우에만 URL 설정
            if (imageResponse.data && imageResponse.data.length > 0) {
                const imageUrls = imageResponse.data
                    .filter(img => img.attachmentNo) // attachmentNo가 있는 이미지만 필터링
                    .map(img => `http://localhost:8080/game/download/${img.attachmentNo}`);
                
                if (imageUrls.length > 0) {
                    setImages(imageUrls);
                    setImageUrl(imageUrls[0]);
                }
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
    const loadReviews = useCallback(async (page)  => {
        try {     
            const response = await axios.get(
                `http://localhost:8080/game/${gameNo}/reviews?page=${page}&size=10`
            );
            setReviews(response.data.reviews);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
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
            window.alert(t("gameDetail.alreadyInCart")); // alert 번역 추가
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
            window.alert(t("gameDetail.alreadyInWishlist")); // alert 번역 추가
        }
    }, [navigate]);

    // 초기 데이터 로드
    useEffect(() => {
        loadGameData();
        loadReviews(1);
        loadPopularReviews();
    }, [loadGameData, loadReviews, loadPopularReviews]);

    //컴포넌트 마운트식 리뷰 작성 가능 여부 확인
    useEffect(() => {
        const checkReviewStatus = async () => {
            if (login && memberId) {
                try {
                    const token = sessionStorage.getItem('refreshToken');
                    const response = await axios.get(
                        `http://localhost:8080/game/${gameNo}/review/check`, 
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        }
                    );
                    setCanWriteReview(!response.data.hasReview);
                } catch (error) {
                    console.error("리뷰 상태 확인 실패:", error);
                }
            }
        };

        checkReviewStatus();
    }, [login, memberId, gameNo]);

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
        alert(t("gameDetail.loginRequired"));
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

const handleDeleteReview = async (reviewNo) => {
    if(!login) {
        alert(t("gameDetail.loginRequired"));
        return;
    }

    if (window.confirm(t("gameDetail.confirmDeleteReview"))) {
        try {
            const token = sessionStorage.getItem('refreshToken');
            await axios.delete(
                `http://localhost:8080/game/${gameNo}/review/${reviewNo}`,
                {
                    headers : {'Authorization' :`Bearer ${token}`}
                }
            );

            // 리뷰 목록 새로고침
            loadReviews(currentPage);
            // 리뷰 작성 가능 상태로 변경
            setCanWriteReview(true);
            //인기리뷰 목록 새로고침
            loadPopularReviews();
            // 게임 데이터 새로고침 (평점 갱신을 위해)
            loadGameData();
            
        } catch (error) {
            console.error("리뷰 삭제 실패:", error);
            alert(t("gameDetail.deleteReviewError"));
        }
    }
};

/**
 * 리뷰 작성 제출 처리 함수
 */
const submitReview = async () => {
    if (!login) {
        alert(t("gameDetail.loginRequired"));
        return;
    }

    try {
        const token = sessionStorage.getItem('refreshToken');
        if (canWriteReview) {
            // 새 리뷰 작성
            await axios.post(`http://localhost:8080/game/${gameNo}/review`, newReview, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
             // 리뷰 작성 후 canWriteReview를 false로 설정
             setCanWriteReview(false);
        } else {
            // 기존 리뷰 찾기
            const userReview = reviews.find(review => review.memberId === memberId);
            if (userReview) {
                // 리뷰 수정
                await axios.put(
                    `http://localhost:8080/game/${gameNo}/review/${userReview.reviewNo}`, 
                    newReview,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
        }

        // 성공 시 처리
        setIsWritingReview(false);
        setNewReview({ reviewContent: "", reviewScore: 5 });
        loadReviews(1);
        loadGameData(); // 게임 평점 업데이트를 위한 새로고침

    } catch (error) {
        if (error.response) {
            alert(t("gameDetail.reviewSubmitError"));
        } else {
            alert(t("gameDetail.serverCommunicationError")); // alert 번역 추가
        }
        console.error("리뷰 처리 실패:", error);
    }
};

return (
    <div className={styles.pageContainer}>
        <div className={styles.contentWrapper}>
            {/* 게임 제목 영역 */}
            <div className={styles.titleArea}>
                <h1>{game.gameTitle}</h1>
                <div className={styles.developerInfo}>
                    <span>{t("gameDetail.developer")}: {game.gameDeveloper}</span>
                    <span>{t("gameDetail.publisher")}: {game.gamePublisher}</span>
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
                                alt={`${game.gameTitle} ${t("gameDetail.screenshot")} ${index + 1}`}
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
                            <div>{t("gameDetail.releaseDate")}: {new Date(game.gamePublicationDate).toLocaleDateString()}</div>
                            <div>{t("gameDetail.developer")}: {game.gameDeveloper}</div>
                            <div>{t("gameDetail.ageRating")}: {game.gameGrade}</div>
                        </div>

                        <div className={styles.tagSection}>
                            <h3>{t("gameDetail.popularTags")}:</h3>
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
                                {t("gameDetail.addToCart")}
                            </button>
                            <button className={styles.wishlistButton} onClick={() => addWishList(game)}>
                                {t("gameDetail.addToWishlist")}
                            </button>
                        </div>
                    </div>

                    {/* 시스템 요구사항 */}
                    <div className={styles.systemRequirements}>
                        <h3>{t("gameDetail.systemRequirements")}</h3>
                        <div className={styles.requirements}>
                            {game.gameSystemRequirement}
                        </div>
                    </div>
                </div>
            </div>

            {/* 리뷰 섹션 */}
            <div className={styles.reviewSummary}>
                    <div className={styles.ratingContainer}>
                        {/* StarRating 컴포넌트로 별점 표시 */}
                        <StarRating score={game.gameUserScore} />
                        {/* 점수 텍스트를 별점 오른쪽에 표시 */}
                        <span className={styles.scoreText}>
                            {game.gameUserScore.toFixed(1)}
                        </span>
                    </div>
                    <div className={styles.reviewCount}>
                        {game.gameReviewCount.toLocaleString()}{t("gameDetail.reviewCount")}
                    </div>
                    {login && canWriteReview && (
                        <button 
                            className={styles.writeReviewButton}
                            onClick={() => setIsWritingReview(true)}
                        >
                            {t("gameDetail.writeReview")}
                        </button>
                    )}
                    {login && !canWriteReview && (
                        <button 
                            className={`${styles.writeReviewButton} ${styles.editButton}`}
                            onClick={() => {
                                const userReview = reviews.find(review => review.memberId === memberId);
                                if (userReview) {
                                    setNewReview({
                                        reviewContent: userReview.reviewContent,
                                        reviewScore: userReview.reviewScore
                                    });
                                    setIsWritingReview(true);
                                }
                            }}
                        >
                            {t("gameDetail.editReview")}
                        </button>
                    )}
                </div>

            
          {/* 리뷰 작성 폼 */}
          {isWritingReview && (
                    <div className={styles.reviewForm}>
                        <div className={styles.reviewFormHeader}>
                            <h3>{canWriteReview ? t("gameDetail.writeReview") : t("gameDetail.editReview")}</h3>
                            <select 
                                value={newReview.reviewScore}
                                onChange={(e) => setNewReview({
                                    ...newReview,
                                    reviewScore: parseInt(e.target.value)
                                })}
                                className={styles.scoreSelect}
                            >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
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
                            placeholder={t("gameDetail.Placeholder")}
                        />
                        <div className={styles.reviewFormButtons}>
                            <button 
                                className={styles.submitReviewButton}
                                onClick={submitReview}
                            >
                                {t("gameDetail.submitReview")}
                            </button>
                            <button 
                                className={styles.cancelButton}
                                onClick={() => setIsWritingReview(false)}
                            >
                                {t("gameDetail.cancel")}
                            </button>
                        </div>
                    </div>
                )}

                {/* 인기 리뷰 목록 */}
                {popularReviews.length > 0 && (
                    <div className={styles.popularReviews}>
                        <h3>{t("gameDetail.mostHelpfulReviews")}</h3>
                        {popularReviews.map(review => (
                            <div key={review.reviewNo} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <span className={styles.reviewerName}>{review.memberNickname}</span>
                                    <div className={styles.reviewActions}>
                                        {/* 별점 표시 */}
                                        <div className={styles.reviewScore}>
                                            <StarRating score={review.reviewScore} />
                                        </div>
                                        {/* 작성자인 경우에만 삭제 버튼 표시 */}
                                        {login && review.memberId === memberId && (
                                            <button 
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteReview(review.reviewNo)}
                                            >
                                                {t("gameDetail.delete")}
                                            </button>
                                        )}
                                    </div>
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
                    <h3>{t("gameDetail.allReviews")}</h3>
                    {reviews.length === 0 ? (
                        <div className={styles.noReviewsMessage}>{t("gameDetail.noReviews")}</div>
                    ) : (
                        reviews.map(review => (
                            <div key={review.reviewNo} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <span className={styles.reviewerName}>{review.memberNickname}</span>
                                    <div className={styles.reviewActions}>
                                        {/* 별점 표시 */}
                                        <div className={styles.reviewScore}>
                                            <StarRating score={review.reviewScore} />
                                        </div>
                                        {/* 작성자인 경우에만 삭제 버튼 표시 */}
                                        {login && review.memberId === memberId && (
                                            <button 
                                                className={styles.deleteButton}
                                                onClick={() => handleDeleteReview(review.reviewNo)}
                                            >
                                                {t("gameDetail.delete")}
                                            </button>
                                        )}
                                    </div>
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
                        ))
                    )}
                </div>

                {/* 관리자 액션 버튼 */}
                {(memberLevel === '개발자' || memberLevel === '관리자') && (
                    <div className={styles.adminActions}>
                        <button 
                            className={styles.editButton}
                            onClick={() => navigate(`/game/edit/${gameNo}`)}
                        >
                            {t("gameDetail.editGameInfo")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};



export default GameDetail;