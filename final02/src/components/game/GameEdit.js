import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import styles from './GameEdit.module.css';
import { X, Upload } from 'lucide-react';

const GameEdit = () => {
    const { gameNo } = useParams();
    const navigate = useNavigate();

    // Game data state
    const [game, setGame] = useState(null);
    
    // Image handling states
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    // Load game data
    useEffect(() => {
        loadGame();
    }, []);

    const loadGame = useCallback(async () => {
        try {
            const resp = await axios.get(`http://localhost:8080/game/${gameNo}`);
            setGame(resp.data);
        }
        catch (e) {
            setGame(null);
        }
    }, [gameNo]);

    // File handling functions
    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
            
        if (files.length > 0) {
            setSelectedFiles(prevFiles => [...prevFiles, ...files]);
            
            const urls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prevUrls => [...prevUrls, ...urls]);
        }
    };

    const removeImage = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
        
        URL.revokeObjectURL(previewUrls[index]);

        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviewUrls);
    };

    const changeGame = useCallback(e => {
        setGame({
            ...game,
            [e.target.name]: e.target.value
        });
    }, [game]);

    const updateGame = useCallback(async () => {
        try {
            const formData = new FormData();

            formData.append('game', new Blob([JSON.stringify(game)], {
                type: 'application/json'
            }));

            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            await axios.put("http://localhost:8080/game/", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Cleanup preview URLs
            previewUrls.forEach(url => URL.revokeObjectURL(url));

            navigate("/game/detail/" + gameNo);
        } catch (error) {
            console.error("수정 실패:", error);
            alert("수정에 실패했습니다");
        }
    }, [game, selectedFiles, gameNo, navigate]);

    return (game !== null ? (
        <div className={styles.container}>
            <h1 className={styles.title}>{game.gameTitle} 정보 수정</h1>

            {/* Image Upload Section */}
            <div className={styles.imageUploadSection}>
                <h3>게임 이미지</h3>
                <div className={styles.imagePreviewArea}>
                    {previewUrls.map((url, index) => (
                        <div key={index} className={styles.previewContainer}>
                            <img 
                                src={url} 
                                alt={`미리보기 ${index + 1}`} 
                                className={styles.previewImage}
                            />
                            <button 
                                onClick={() => removeImage(index)}
                                className={styles.removeButton}
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ))}
                    <label className={styles.uploadButton}>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                        <div className={styles.uploadPlaceholder}>
                            <Upload size={24} />
                            <span>이미지 추가</span>
                        </div>
                    </label>
                </div>
                <p className={styles.imageHelp}>
                    권장: 16:9 비율의 이미지, 최대 5장
                </p>
            </div>

            {/* Form Section */}
            <div className={styles.formSection}>
                <div className={styles.formGroup}>
                    <label>게임명</label>
                    <input 
                        type="text"
                        className={styles.input}
                        name="gameTitle"
                        value={game.gameTitle}
                        onChange={changeGame}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>금액</label>
                    <input 
                        type="number"
                        className={styles.input}
                        name="gamePrice"
                        value={game.gamePrice}
                        onChange={changeGame}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>개발자</label>
                    <input 
                        type="text"
                        className={styles.input}
                        name="gameDeveloper"
                        value={game.gameDeveloper}
                        onChange={changeGame}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>출시일</label>
                    <input 
                        type="date"
                        className={styles.input}
                        name="gamePublicationDate"
                        value={game.gamePublicationDate}
                        onChange={changeGame}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>할인율 (%)</label>
                    <input 
                        type="number"
                        className={styles.input}
                        name="gameDiscount"
                        value={game.gameDiscount}
                        onChange={changeGame}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>카테고리</label>
                    <input 
                        type="text"
                        className={styles.input}
                        name="gameCategory"
                        value={game.gameCategory}
                        onChange={changeGame}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>등급</label>
                    <input 
                        type="text"
                        className={styles.input}
                        name="gameGrade"
                        value={game.gameGrade}
                        onChange={changeGame}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>테마</label>
                    <input 
                        type="text"
                        className={styles.input}
                        name="gameTheme"
                        value={game.gameTheme}
                        onChange={changeGame}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>상세 설명</label>
                    <textarea 
                        className={`${styles.input} ${styles.textarea}`}
                        name="gameDescription"
                        value={game.gameDescription}
                        onChange={changeGame}
                        rows="6"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>간단 설명</label>
                    <textarea 
                        className={`${styles.input} ${styles.textarea}`}
                        name="gameShortDescription"
                        value={game.gameShortDescription}
                        onChange={changeGame}
                        rows="3"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>평점</label>
                    <input 
                        type="number"
                        className={styles.input}
                        name="gameUserScore"
                        value={game.gameUserScore}
                        onChange={changeGame}
                        min="0"
                        max="10"
                        step="0.1"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>리뷰수</label>
                    <input 
                        type="number"
                        className={styles.input}
                        name="gameReviewCount"
                        value={game.gameReviewCount}
                        onChange={changeGame}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>지원 플랫폼</label>
                    <input 
                        type="text"
                        className={styles.input}
                        name="gamePlatforms"
                        value={game.gamePlatforms}
                        onChange={changeGame}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>시스템 요구사항</label>
                    <textarea
                        className={`${styles.input} ${styles.textarea}`}
                        name="gameSystemRequirement"
                        value={game.gameSystemRequirement}
                        onChange={changeGame}
                        rows="6"
                    />
                </div>

                <div className={styles.buttonGroup}>
                    <button 
                        className={styles.submitButton}
                        onClick={updateGame}
                    >
                        수정
                    </button>
                    <button 
                        className={styles.cancelButton}
                        onClick={() => navigate(`/game/detail/${gameNo}`)}
                    >
                        취소
                    </button>
                </div>
            </div>
        </div>
    ) : (
        <div className={styles.container}>
            <p>로딩 중...</p>
        </div>
    ));
};

export default GameEdit;