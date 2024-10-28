import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from './GameDetail.module.css';
import { Tag, ThumbsUp, ThumbsDown, Share2, Flag } from 'lucide-react';
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";

const GameDetail = () => {
    const navigate = useNavigate();
    const { gameNo } = useParams();
    
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [imageUrl, setImageUrl] = useState(null);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(0);

    // Recoil 상태 사용
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  const memberLoading = useRecoilValue(memberLoadingState);

  
    // 게임 데이터 및 이미지 로딩
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

    // 장바구니에 추가
    const addCart = useCallback(async (game) => {
        try {
            // 전달되는 game 데이터를 콘솔에 출력
            console.log("Adding to cart:", game);

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

    const addWishList = useCallback(async (game) => {
        try {
            // 전달되는 game 데이터를 콘솔에 출력하여 gameNo 확인
            console.log("Adding to wishlist:", game);
            
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
   

    // 게임 데이터 로딩
    useEffect(() => {
        loadGameData();
    }, [loadGameData]);

    if (loading) return <div className={styles.loading}>로딩 중...</div>;
    if (!game) return <div className={styles.error}>게임을 찾을 수 없습니다</div>;

    const handleThumbnailClick = (index) => {
        setSelectedImage(index);
        setImageUrl(images[index]);
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

                            <div className={styles.purchaseButtons}>
                                <button className={styles.addToCartButton} onClick={() => addCart(game)}>장바구니에 추가</button>
                                <button className={styles.wishlistButton} onClick={()=>addWishList(game)}>위시리스트에 추가</button>
                            </div>
                        </div>

                        <div className={styles.systemRequirements}>
                            <h3>시스템 요구사항</h3>
                            <div className={styles.requirements}>
                                {game.gameSystemRequirement}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 하단: 리뷰 섹션 */}
                <div className={styles.reviewSection}>
                    <h2>고객 리뷰</h2>
                    <div className={styles.reviewSummary}>
                        <div className={styles.score}>
                            <span className={styles.scoreNumber}>{game.gameUserScore}</span>/10
                        </div>
                        <div className={styles.reviewCount}>
                            {game.gameReviewCount.toLocaleString()}개의 리뷰
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
