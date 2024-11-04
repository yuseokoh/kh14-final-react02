import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from './GameDetail.module.css';
import { ThumbsUp } from 'lucide-react';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState, memberLevelState, memberLoadingState } from "../../utils/recoil";

const StarRating = ({ score }) => {
    const maxStars = 5;
    const normalizedScore = score * (maxStars / 10);
    const starPercentage = normalizedScore ? (normalizedScore / maxStars) * 100 : 0;

    return (
        <div className={styles.starRating}>
            <div className={styles.starRatingOuter}>
                <div className={styles.starsBackground}>★★★★★</div>
                <div 
                    className={styles.starRatingInner}
                    style={{ width: `${starPercentage}%` }}
                >
                    ★★★★★
                </div>
            </div>
            <span className={styles.scoreText}>
                {score.toFixed(1)}
            </span>
        </div>
    );
};

const SystemRequirements = ({ minimum, recommended }) => {
    if (!minimum && !recommended) return null;

    return (
        <div className={styles.systemRequirementsContainer}>
            <h2 className={styles.sectionTitle}>시스템 요구사항</h2>
            <div className={styles.requirementsGrid}>
                {minimum && (
                    <div className={styles.requirementColumn}>
                        <h3>최소 사양</h3>
                        <div className={styles.requirementsList}>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>운영체제:</span>
                                <span>{minimum.os}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>프로세서:</span>
                                <span>{minimum.processor}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>메모리:</span>
                                <span>{minimum.memory}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>그래픽:</span>
                                <span>{minimum.graphics}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>DirectX:</span>
                                <span>{minimum.directxVersion}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>저장공간:</span>
                                <span>{minimum.storage}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>사운드카드:</span>
                                <span>{minimum.soundCard}</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {recommended && (
                    <div className={styles.requirementColumn}>
                        <h3>권장 사양</h3>
                        <div className={styles.requirementsList}>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>운영체제:</span>
                                <span>{recommended.os}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>프로세서:</span>
                                <span>{recommended.processor}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>메모리:</span>
                                <span>{recommended.memory}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>그래픽:</span>
                                <span>{recommended.graphics}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>DirectX:</span>
                                <span>{recommended.directxVersion}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>저장공간:</span>
                                <span>{recommended.storage}</span>
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>사운드카드:</span>
                                <span>{recommended.soundCard}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
const GameDetail = () => {
    const navigate = useNavigate();
    const { gameNo } = useParams();

    // Recoil 상태
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberLevel = useRecoilValue(memberLevelState);

    // 상태 관리
    const [game, setGame] = useState(null);
    const [systemRequirements, setSystemRequirements] = useState({
        minimum: null,
        recommended: null
    });
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);

    // 리뷰 관련 상태
    const [reviews, setReviews] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isWritingReview, setIsWritingReview] = useState(false);
    const [canWriteReview, setCanWriteReview] = useState(true);
    const [newReview, setNewReview] = useState({
        reviewContent: "",
        reviewScore: 5
    });

    // 초기 데이터 로드
    const loadGameData = useCallback(async () => {
        try {
            const [gameResponse, imageResponse, requirementsResponse] = await Promise.all([
                axios.get(`http://localhost:8080/game/${gameNo}`),
                axios.get(`http://localhost:8080/game/image/${gameNo}`),
                axios.get(`http://localhost:8080/game/requirements/${gameNo}`)
            ]);

            setGame(gameResponse.data);

            // 이미지 처리
            if (imageResponse.data && imageResponse.data.length > 0) {
                const imageUrls = imageResponse.data
                    .filter(img => img.attachmentNo)
                    .map(img => `http://localhost:8080/game/download/${img.attachmentNo}`);
                
                if (imageUrls.length > 0) {
                    setImages(imageUrls);
                    setImageUrl(imageUrls[0]);
                }
            }

            // 시스템 요구사항 처리
            const requirements = requirementsResponse.data;
            setSystemRequirements({
                minimum: requirements.find(r => r.requirementType === 'minimum'),
                recommended: requirements.find(r => r.requirementType === 'recommended')
            });

            setLoading(false);
        } catch (err) {
            console.error("게임 데이터 로드 실패:", err);
            setLoading(false);
        }
    }, [gameNo]);

    // 리뷰 목록 로드
    const loadReviews = useCallback(async (page) => {
        try {
            const response = await axios.get(`http://localhost:8080/game/${gameNo}/reviews`, {
                params: {
                    page,
                    size: 10
                }
            });
            
            if (response.data) {
                setReviews(response.data.reviews);
                setTotalPages(response.data.totalPages);
                setCurrentPage(page);
            }
        } catch (error) {
            console.error("리뷰 로드 실패:", error);
        }
    }, [gameNo]);

    // 리뷰 작성 가능 여부 확인
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

    // 초기 데이터 로드
    useEffect(() => {
        loadGameData();
        loadReviews(1);
    }, [loadGameData, loadReviews]);

    // 리뷰 제출 처리
    const submitReview = async () => {
        if (!login) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const token = sessionStorage.getItem('refreshToken');
            if (canWriteReview) {
                await axios.post(
                    `http://localhost:8080/game/${gameNo}/review`,
                    {
                        ...newReview,
                        gameNo: gameNo
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                setCanWriteReview(false);
            } else {
                const userReview = reviews.find(review => review.memberId === memberId);
                if (userReview) {
                    await axios.put(
                        `http://localhost:8080/game/${gameNo}/review/${userReview.reviewNo}`,
                        {
                            ...newReview,
                            gameNo: gameNo
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                }
            }

            setIsWritingReview(false);
            setNewReview({ reviewContent: "", reviewScore: 5 });
            loadReviews(1);
            loadGameData();
        } catch (error) {
            console.error("리뷰 제출 실패:", error);
            alert("리뷰 처리 중 오류가 발생했습니다.");
        }
    };

    // 리뷰 삭제 처리
    const handleDeleteReview = async (reviewNo) => {
        if (!login) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (window.confirm("리뷰를 삭제하시겠습니까?")) {
            try {
                const token = sessionStorage.getItem('refreshToken');
                await axios.delete(
                    `http://localhost:8080/game/${gameNo}/review/${reviewNo}`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );

                setCanWriteReview(true);
                loadReviews(currentPage);
                loadGameData();
            } catch (error) {
                console.error("리뷰 삭제 실패:", error);
                alert("리뷰 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    // 리뷰 좋아요 처리
    const handleLikeReview = async (reviewNo) => {
        if (!login) {
            alert("로그인이 필요합니다.");
            return;
        }

        try {
            const token = sessionStorage.getItem('refreshToken');
            await axios.post(
                `http://localhost:8080/game/${gameNo}/review/${reviewNo}/like`,
                null,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            loadReviews(currentPage);
        } catch (error) {
            console.error("좋아요 처리 실패:", error);
        }
    };

    if (loading) return <div className={styles.loading}>로딩 중...</div>;
    if (!game) return <div className={styles.error}>게임을 찾을 수 없습니다</div>;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.contentWrapper}>
                {/* 게임 제목 영역 */}
                <div className={styles.titleArea}>
                    <h1>{game.gameTitle}</h1>
                    <div className={styles.developerInfo}>
                        <span>개발: {game.gameDeveloper}</span>
                        <span>배급: {game.gamePublisher}</span>
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
                                    onClick={() => {
                                        setSelectedImage(index);
                                        setImageUrl(img);
                                    }}
                                />
                            ))}
                        </div>
                        
                        {/* 게임 설명 */}
                        <div className={styles.description}>
                            <div dangerouslySetInnerHTML={{ __html: game.gameDescription }} />
                        </div>
    
                        {/* 시스템 요구사항 */}
                        <SystemRequirements 
                            minimum={systemRequirements.minimum}
                            recommended={systemRequirements.recommended}
                        />
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
                                                ₩{game.gamePrice.toLocaleString()}
                                            </span>
                                            <span className={styles.finalPrice}>
                                                ₩{(game.gamePrice * (1 - game.gameDiscount / 100)).toLocaleString()}
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <div className={styles.finalPrice}>
                                        ₩{game.gamePrice.toLocaleString()}
                                    </div>
                                )}
                            </div>
    
                            {/* 구매 버튼 영역 */}
                            <div className={styles.purchaseButtons}>
                                <button 
                                    className={styles.addToCartButton}
                                    onClick={() => navigate('/cart/add', { state: { game } })}
                                >
                                    장바구니에 추가
                                </button>
                                <button 
                                    className={styles.wishlistButton}
                                    onClick={() => navigate('/wishlist/add', { state: { game } })}
                                >
                                    위시리스트에 추가
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
    
                {/* 리뷰 섹션 */}
                <div className={styles.reviewSection}>
                    <div className={styles.reviewSummary}>
                        <div className={styles.ratingContainer}>
                            <StarRating score={game.gameUserScore || 0} />
                            <div className={styles.reviewCount}>
                                {game.gameReviewCount?.toLocaleString() || 0}개의 리뷰
                            </div>
                        </div>
                        {login && canWriteReview && (
                            <button 
                                className={styles.writeReviewButton}
                                onClick={() => setIsWritingReview(true)}
                            >
                                리뷰 작성
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
                                내 리뷰 수정
                            </button>
                        )}
                    </div>
    
                    {/* 리뷰 작성 폼 */}
                    {isWritingReview && (
                        <div className={styles.reviewForm}>
                            <div className={styles.reviewFormHeader}>
                                <h3>{canWriteReview ? "리뷰 작성" : "리뷰 수정"}</h3>
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
                                placeholder="이 게임에 대한 평가를 작성해주세요..."
                            />
                            <div className={styles.reviewFormButtons}>
                                <button 
                                    className={styles.submitReviewButton}
                                    onClick={submitReview}
                                >
                                    {canWriteReview ? "리뷰 등록" : "리뷰 수정"}
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
    
                    {/* 전체 리뷰 목록 */}
                    <div className={styles.allReviews}>
                        {reviews.length === 0 ? (
                            <div className={styles.noReviewsMessage}>
                                아직 작성된 리뷰가 없습니다.
                            </div>
                        ) : (
                            <>
                                {reviews.map(review => (
                                    <div key={review.reviewNo} className={styles.reviewCard}>
                                        <div className={styles.reviewHeader}>
                                            <span className={styles.reviewerName}>
                                                {review.memberNickname}
                                            </span>
                                            <div className={styles.reviewActions}>
                                                <div className={styles.reviewScore}>
                                                    <StarRating score={review.reviewScore} />
                                                </div>
                                                {login && review.memberId === memberId && (
                                                    <button 
                                                        className={styles.deleteButton}
                                                        onClick={() => handleDeleteReview(review.reviewNo)}
                                                    >
                                                        삭제
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div className={styles.reviewContent}>
                                            {review.reviewContent}
                                        </div>
                                        <div className={styles.reviewFooter}>
                                            <button 
                                                className={styles.likeButton}
                                                onClick={() => handleLikeReview(review.reviewNo)}
                                            >
                                                <ThumbsUp size={16} /> {review.reviewLikes}
                                            </button>
                                            <span className={styles.reviewDate}>
                                                {new Date(review.reviewDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                
                                {/* 페이지네이션 */}
                                {totalPages > 1 && (
                                    <div className={styles.pagination}>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => loadReviews(page)}
                                                className={`${styles.pageButton} ${
                                                    currentPage === page ? styles.activePage : ''
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
    
                {/* 관리자/개발자 전용 버튼 */}
                {(memberLevel === '개발자' || memberLevel === '관리자') && (
                    <div className={styles.adminActions}>
                        <button 
                            className={styles.editButton}
                            onClick={() => navigate(`/game/edit/${gameNo}`)}
                        >
                            게임 정보 수정
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameDetail;