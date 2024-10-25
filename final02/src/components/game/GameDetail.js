// GameDetail.js

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import styles from './GameDetail.module.css';
import { Tag, ThumbsUp, ThumbsDown, Share2, Flag } from 'lucide-react';

/**
 * 게임 상세 정보 페이지 컴포넌트
 * Steam 스타일의 상세 정보 페이지를 구현
 * 주요 섹션:
 * - 게임 헤더 (제목, 개발사, 출시일)
 * - 게임 미디어 (스크린샷, 영상)
 * - 게임 설명
 * - 사용자 태그
 * - 시스템 요구사항
 */
const GameDetail = () => {
    const navigate = useNavigate();
    const { gameNo } = useParams();
    
    // 상태 관리
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // 게임 데이터 로딩
    const loadGame = useCallback(async () => {
        try {
            const resp = await axios.get(`http://localhost:8080/game/${gameNo}`);
            setGame(resp.data);
            setLoading(false);
        }
        catch (err) {
            console.error(err);
            setLoading(false);
        }
    }, [gameNo]);

    useEffect(() => {
        loadGame();
    }, [loadGame]);

    if (loading) return <div className={styles.loading}>로딩 중...</div>;
    if (!game) return <div className={styles.error}>게임을 찾을 수 없습니다</div>;

    return (
        <div className={styles.container}>
            {/* 게임 헤더 섹션 */}
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>{game.gameTitle}</h1>
                    <div className={styles.metadata}>
                        <span>개발사: {game.gameDeveloper}</span>
                        <span>출시일: {new Date(game.gamePublicationDate).toLocaleDateString()}</span>
                        <span>이용등급: {game.gameGrade}</span>
                    </div>
                </div>
                
                {/* 네비게이션 탭 */}
                <div className={styles.tabs}>
                    <button 
                        className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        개요
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'reviews' ? styles.active : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        리뷰
                    </button>
                    <button 
                        className={`${styles.tab} ${activeTab === 'specifications' ? styles.active : ''}`}
                        onClick={() => setActiveTab('specifications')}
                    >
                        시스템 사양
                    </button>
                </div>
            </div>

            {/* 메인 컨텐츠 영역 */}
            <div className={styles.mainContent}>
                {/* 미디어 갤러리 */}
                <div className={styles.mediaGallery}>
                    <div className={styles.mainMedia}>
                        <img src="/api/placeholder/600/337" alt="메인 이미지" />
                    </div>
                    <div className={styles.thumbnailStrip}>
                        {[1,2,3,4].map((_, index) => (
                            <img 
                                key={index}
                                src="/api/placeholder/115/65" 
                                alt={`썸네일 ${index + 1}`}
                                className={styles.thumbnail}
                            />
                        ))}
                    </div>
                </div>

                {/* 게임 요약 정보 */}
                <div className={styles.summary}>
                    <div className={styles.shortDescription}>
                        {game.gameShortDescription}
                    </div>
                    <div className={styles.tags}>
                        <h3>인기 태그:</h3>
                        <div className={styles.tagList}>
                            {game.gameCategory.split(',').map((category, index) => (
                                <span key={index} className={styles.tag}>
                                    {category.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 상세 설명 */}
                <div className={styles.description}>
                    <h2>상세 설명</h2>
                    <div dangerouslySetInnerHTML={{ __html: game.gameDescription }} />
                </div>

                {/* 시스템 요구사항 */}
                <div className={styles.systemRequirements}>
                    <h2>시스템 요구사항</h2>
                    <div className={styles.requirementsGrid}>
                        <div className={styles.minimumRequirements}>
                            <h3>최소 사양</h3>
                            <div>{game.gameSystemRequirement}</div>
                        </div>
                        <div className={styles.recommendedRequirements}>
                            <h3>권장 사양</h3>
                            <div>{game.gameSystemRequirement}</div>
                        </div>
                    </div>
                </div>

                {/* 사용자 리뷰 섹션 */}
                <div className={styles.reviews}>
                    <h2>사용자 리뷰</h2>
                    <div className={styles.reviewSummary}>
                        <div className={styles.score}>
                            <span className={styles.scoreNumber}>{game.gameUserScore}</span>/10
                        </div>
                        <div className={styles.reviewCount}>
                            {game.gameReviewCount.toLocaleString()}개의 리뷰
                        </div>
                    </div>
                </div>

                {/* 플랫폼 지원 정보 */}
                <div className={styles.platforms}>
                    <h2>지원 플랫폼</h2>
                    <div className={styles.platformList}>
                        {game.gamePlatforms.split(',').map((platform, index) => (
                            <span key={index} className={styles.platform}>
                                {platform.trim()}
                            </span>
                        ))}
                    </div>
                </div>

                {/* 추가 기능 버튼 */}
                <div className={styles.actions}>
                    <button className={styles.actionButton}>
                        <Share2 /> 공유하기
                    </button>
                    <button className={styles.actionButton}>
                        <Flag /> 신고하기
                    </button>
                    <button 
                        className={styles.editButton}
                        onClick={() => navigate(`/game/edit/${gameNo}`)} // 수정된 부분
                    >
                        게임 수정하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameDetail;