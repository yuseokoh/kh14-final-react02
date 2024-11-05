import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from './GameDetail.module.css';
import { ThumbsUp } from 'lucide-react';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState, memberLevelState } from "../../utils/recoil";

/**
 * StarRating 컴포넌트
 * 게임의 평점을 별점으로 시각화
 * @param {number} score - 0-10 사이의 게임 평점
 */
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

/**
 * SystemRequirements 컴포넌트
 * 게임의 시스템 요구사항을 표시
 */
const SystemRequirements = ({ minimum, recommended }) => {
    if (!minimum && !recommended) return null;

    return (
        <div className={styles.systemRequirementsContainer}>
            <h2>시스템 요구사항</h2>
            <div className={styles.requirementsGrid}>
                {minimum && (
                    <div className={styles.requirementColumn}>
                        <h3>최소</h3>
                        <div className={styles.requirementsList}>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>운영체제:</span>
                                {minimum.os}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>프로세서:</span>
                                {minimum.processor}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>메모리:</span>
                                {minimum.memory}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>그래픽:</span>
                                {minimum.graphics}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>DirectX:</span>
                                {minimum.directxVersion}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>저장공간:</span>
                                {minimum.storage}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>사운드카드:</span>
                                {minimum.soundCard}
                            </div>
                        </div>
                    </div>
                )}

                {recommended && (
                    <div className={styles.requirementColumn}>
                        <h3>권장</h3>
                        <div className={styles.requirementsList}>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>운영체제:</span>
                                {recommended.os}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>프로세서:</span>
                                {recommended.processor}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>메모리:</span>
                                {recommended.memory}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>그래픽:</span>
                                {recommended.graphics}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>DirectX:</span>
                                {recommended.directxVersion}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>저장공간:</span>
                                {recommended.storage}
                            </div>
                            <div className={styles.requirementItem}>
                                <span className={styles.requirementLabel}>사운드카드:</span>
                                {recommended.soundCard}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * ReviewSystem 컴포넌트
 * 게임 리뷰 시스템을 관리하는 컴포넌트
 */
const ReviewSystem = ({ gameNo, login, memberId, memberLevel, game, onReviewUpdate  }) => {
    // 리뷰 목록 및 페이지네이션 상태 관리
    const [reviews, setReviews] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0
    });

    // 리뷰 폼 상태 관리
    const [reviewForm, setReviewForm] = useState({
        isOpen: false,
        mode: 'create', // 'create' or 'edit'
        data: {
            reviewContent: '',
            reviewScore: 5
        },
        editingReviewNo: null
    });

    // 사용자 권한 상태 관리
    const [permissions, setPermissions] = useState({
        canWrite: false,
        hasReview: false
    });

    /**
     * 리뷰 목록을 불러오는 비동기 함수
     * @param {number} page - 요청할 페이지 번호
     */
    // ReviewSystem 컴포넌트 수정
    const loadReviews = async (page = 1) => {
        try {
            const size = 10; // 페이지당 항목 수
            const response = await axios.get(
                `http://localhost:8080/game/${gameNo}/reviews`,
                {
                    params: {
                        page: page,
                        size: size
                    }
                }
            );

            if (response.data) {
                setReviews(response.data.reviews);
                setPagination({
                    currentPage: page,
                    totalPages: Math.ceil(response.data.totalCount / size),
                    totalCount: response.data.totalCount
                });
            }
        } catch (error) {
            console.error("리뷰 로드 실패:", error);
        }
    };

    /**
     * 사용자의 리뷰 권한을 확인하는 비동기 함수
     */
    const checkPermissions = async () => {
        if (login && memberId && memberLevel === '일반회원') {
            try {
                const token = sessionStorage.getItem('refreshToken');
                const response = await axios.get(
                    `http://localhost:8080/game/${gameNo}/review/check`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                setPermissions({
                    canWrite: true,
                    hasReview: response.data.hasReview
                });
            } catch (error) {
                console.error("권한 확인 실패:", error);
            }
        } else {
            setPermissions({
                canWrite: false,
                hasReview: false
            });
        }
    };

    /**
     * 리뷰 제출 (작성/수정) 처리 함수
     */
    const handleReviewSubmit = async () => {
        if (!login || memberLevel !== '일반회원') {
            alert(login ? "일반회원만 리뷰를 작성할 수 있습니다." : "로그인이 필요합니다.");
            return;
        }
    
        const token = sessionStorage.getItem('refreshToken');
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
    
        try {
            // 리뷰 작성 또는 수정
            if (reviewForm.mode === 'create') {
                await axios.post(
                    `http://localhost:8080/game/${gameNo}/review`,
                    reviewForm.data,
                    config
                );
            } else {
                await axios.put(
                    `http://localhost:8080/game/${gameNo}/review/${reviewForm.editingReviewNo}`,
                    reviewForm.data,
                    config
                );
            }
    
            // 폼 초기화
            setReviewForm({
                isOpen: false,
                mode: 'create',
                data: { reviewContent: '', reviewScore: 5 },
                editingReviewNo: null
            });
    
            // 리뷰 목록과 권한 새로고침
            await Promise.all([
                loadReviews(pagination.currentPage),
                checkPermissions()
            ]);
    
            // 게임 정보 (평점 포함) 새로고침
            await onReviewUpdate();
    
        } catch (error) {
            console.error("리뷰 제출 실패:", error);
            alert(error.response?.data || "리뷰 처리 중 오류가 발생했습니다.");
        }
    }; 
    /**
     * 리뷰 수정 시작 핸들러
     */
    const handleEditStart = (review) => {
        setReviewForm({
            isOpen: true,
            mode: 'edit',
            data: {
                reviewContent: review.reviewContent,
                reviewScore: review.reviewScore
            },
            editingReviewNo: review.reviewNo
        });
    };

    /**
     * 리뷰 삭제 핸들러
     */
    const handleDeleteReview = async (reviewNo) => {
        if (!login || memberLevel !== '일반회원') {
            alert(login ? "일반회원만 리뷰를 삭제할 수 있습니다." : "로그인이 필요합니다.");
            return;
        }

        if (window.confirm("리뷰를 삭제하시겠습니까?")) {
            try {
                const token = sessionStorage.getItem('refreshToken');
                await axios.delete(
                    `http://localhost:8080/game/${gameNo}/review/${reviewNo}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

               // 리뷰 목록과 권한 새로고침
                await Promise.all([
                    loadReviews(pagination.currentPage),
                    checkPermissions(),
                    onReviewUpdate()//게임 정보 새로고침
                ]);

            } catch (error) {
                console.error("리뷰 삭제 실패:", error);
                alert("리뷰 삭제 중 오류가 발생했습니다.");
            }
        }
    };

    /**
     * 리뷰 좋아요 처리 핸들러
     */
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
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            loadReviews(pagination.currentPage);
        } catch (error) {
            console.error("좋아요 처리 실패:", error);
        }
    };

    // 초기 로딩 및 권한 체크
    useEffect(() => {
        loadReviews(1);
        checkPermissions();
    }, [gameNo, login, memberId, memberLevel]);

    return (
        <div className={styles.reviewSection}>
            {/* 리뷰 섹션 상단 요약 */}
            <div className={styles.reviewSummary}>
                <div className={styles.ratingContainer}>
                    <StarRating score={game.gameUserScore || 0} />
                    <div className={styles.reviewCount}>
                        {game.gameReviewCount?.toLocaleString() || 0}개의 리뷰
                    </div>
                </div>
                {permissions.canWrite && !permissions.hasReview && (
                    <button
                        className={styles.writeReviewButton}
                        onClick={() => setReviewForm({
                            ...reviewForm,
                            isOpen: true,
                            mode: 'create'
                        })}
                    >
                        리뷰 작성
                    </button>
                )}
            </div>

            {/* 리뷰 작성/수정 폼 */}
            {reviewForm.isOpen && (
                <div className={styles.reviewForm}>
                    <div className={styles.reviewFormHeader}>
                        <h3>{reviewForm.mode === 'create' ? '리뷰 작성' : '리뷰 수정'}</h3>
                        <select
                            value={reviewForm.data.reviewScore}
                            onChange={(e) => setReviewForm({
                                ...reviewForm,
                                data: {
                                    ...reviewForm.data,
                                    reviewScore: parseInt(e.target.value)
                                }
                            })}
                            className={styles.scoreSelect}
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => (
                                <option key={score} value={score}>{score}/10</option>
                            ))}
                        </select>
                    </div>
                    <textarea
                        value={reviewForm.data.reviewContent}
                        onChange={(e) => setReviewForm({
                            ...reviewForm,
                            data: {
                                ...reviewForm.data,
                                reviewContent: e.target.value
                            }
                        })}
                        className={styles.reviewTextarea}
                        placeholder="이 게임에 대한 평가를 작성해주세요..."
                    />
                    <div className={styles.reviewFormButtons}>
                        <button
                            className={styles.submitReviewButton}
                            onClick={handleReviewSubmit}
                        >
                            {reviewForm.mode === 'create' ? '등록' : '수정'}
                        </button>
                        <button
                            className={styles.cancelButton}
                            onClick={() => setReviewForm({
                                isOpen: false,
                                mode: 'create',
                                data: { reviewContent: '', reviewScore: 5 },
                                editingReviewNo: null
                            })}
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}

            {/* 리뷰 목록 */}
            <div className={styles.reviewList}>
                {reviews.length === 0 ? (
                    <div className={styles.noReviewsMessage}>
                        아직 작성된 리뷰가 없습니다.
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.reviewNo} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <span className={styles.reviewerName}>
                                    {review.memberNickname}
                                </span>
                                <div className={styles.reviewScore}>
                                    <StarRating score={review.reviewScore} />
                                </div>
                            </div>
                            <div className={styles.reviewContent}>
                                {review.reviewContent}
                            </div>
                            <div className={styles.reviewFooter}>
                                <div className={styles.reviewActions}>
                                    {login &&
                                        memberLevel === '일반회원' &&
                                        review.memberId === memberId && ( // 본인이 작성한 리뷰인지 확인
                                            <>
                                                <button
                                                    className={styles.editButton}
                                                    onClick={() => handleEditStart(review)}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    className={styles.deleteButton}
                                                    onClick={() => handleDeleteReview(review.reviewNo)}
                                                >
                                                    삭제
                                                </button>
                                            </>
                                        )}
                                </div>
                                <span className={styles.reviewDate}>
                                    {new Date(review.reviewDate).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}

                {/* 페이지네이션 */}
                {pagination.totalPages > 1 && (
                    <div className={styles.pagination}>
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                            .map(page => (
                                <button
                                    key={page}
                                    onClick={() => loadReviews(page)}
                                    className={`${styles.pageButton} 
                                        ${pagination.currentPage === page ? styles.activePage : ''}`}
                                >
                                    {page}
                                </button>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * GameDetail 컴포넌트
 * 게임의 상세 정보를 표시하는 메인 컴포넌트
 */
const GameDetail = () => {
    const navigate = useNavigate();
    const { gameNo } = useParams();

    // Recoil 상태
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberLevel = useRecoilValue(memberLevelState);

    // 로컬 상태 관리
    const [game, setGame] = useState(null);
    const [systemRequirements, setSystemRequirements] = useState({
        minimum: null,
        recommended: null
    });
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);

    /**
     * 장바구니에 게임을 추가하는 함수
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
            console.error("장바구니 추가 실패:", error);
            window.alert("이미 장바구니에 있는 게임입니다");
        }
    }, [navigate]);

    /**
     * 위시리스트에 게임을 추가하는 함수
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
            console.error("위시리스트 추가 실패:", error);
            window.alert("이미 찜에 있는 게임입니다");
        }
    }, [navigate]);

    /**
     * 게임 데이터를 로드하는 함수
     */
    const loadGameData = useCallback(async () => {
        try {
            // 게임 정보, 이미지, 시스템 요구사항을 병렬로 로드
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

    const handleReviewUpdate = useCallback(async () => {
        await loadGameData();  // 기존의 loadGameData 함수 재사용
    }, [loadGameData]);

    // 초기 데이터 로드
    useEffect(() => {
        loadGameData();
    }, [loadGameData]);

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
                                    onClick={() => addCart(game)}
                                >
                                    장바구니에 추가
                                </button>
                                <button
                                    className={styles.wishlistButton}
                                    onClick={() => addWishList(game)}
                                >
                                    위시리스트에 추가
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 리뷰 섹션 */}
                <ReviewSystem
                    gameNo={gameNo}
                    login={login}
                    memberId={memberId}
                    memberLevel={memberLevel}
                    game={game}
                    onReviewUpdate={handleReviewUpdate} 
                />

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