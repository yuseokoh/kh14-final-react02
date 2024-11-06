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

    //현재 유저정보 스테이트
    const [currentUser, setCurrentUser] = useState(null);

    // Image handling states
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [existingImages, setExistingImages] = useState([]); // 기존 이미지 목록
    const [deletedImageNos, setDeletedImageNos] = useState([]); // 삭제할 이미지 번호들

    // GameEdit.js에 추가할 state
    const [requirements, setRequirements] = useState({
        minimum: {
            requirementType: 'minimum',
            os: '',
            processor: '',
            memory: '',
            graphics: '',
            directxVersion: '',
            storage: '',
            soundCard: ''
        },
        recommended: {
            requirementType: 'recommended',
            os: '',
            processor: '',
            memory: '',
            graphics: '',
            directxVersion: '',
            storage: '',
            soundCard: ''
        }
    });

    // Load game data
    useEffect(() => {
        const loadData = async () => {
            try {
                // 게임 정보 로드
                const gameResp = await axios.get(`http://localhost:8080/game/${gameNo}`);
                setGame(gameResp.data);

                // 기존 이미지 로드
                const imageResp = await axios.get(`http://localhost:8080/game/image/${gameNo}`);
                setExistingImages(imageResp.data || []);

                // 시스템 요구사항 로드
                const reqResponse = await axios.get(`http://localhost:8080/game/requirements/${gameNo}`);
                const reqData = reqResponse.data.reduce((acc, req) => {
                    acc[req.requirementType] = {
                        ...req,
                        requirementType: req.requirementType,
                    };
                    return acc;
                }, {
                    minimum: { requirementType: 'minimum' },
                    recommended: { requirementType: 'recommended' }
                });

                setRequirements(reqData);
            } catch (err) {
                console.error("데이터 로딩 실패:", err);
                setGame(null);
            }
        };
        loadData();
    }, [gameNo]);

    // handleRequirementChange 함수 추가
    const handleRequirementChange = (type, field, value) => {
        setRequirements(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };


    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = sessionStorage.getItem("accessToken");
                if (!token) return;

                const response = await axios.get("http://localhost:8080/member/", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCurrentUser(response.data);
            } catch (error) {
                console.error("사용자 정보 조회 실패:", error);
            }
        };
        fetchUserInfo();
    }, []);

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

    //첨부된 이미지를 삭제처리하는 코드
    const handleExistingImageDelete = async (attachmentNo) => {
        try {
            // 서버로 삭제 요청 보내기
            await axios.delete(`http://localhost:8080/game/image/${attachmentNo}`, {
                params: { gameNo },
            });

            // 삭제에 성공하면 화면에서 제거
            setExistingImages(prev =>
                prev.filter(img => img.attachmentNo !== attachmentNo)
            );
            setDeletedImageNos(prev => [...prev, attachmentNo]);
        } catch (error) {
            console.error("이미지 삭제 실패:", error);
            alert("이미지 삭제에 실패했습니다");
        }
    };

    const changeGame = useCallback(e => {
        setGame({
            ...game,
            [e.target.name]: e.target.value
        });
    }, [game]);

    const updateGame = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('accessToken');
            const formData = new FormData();

            formData.append('game', new Blob([JSON.stringify(game)], {
                type: 'application/json'
            }));

            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            deletedImageNos.forEach(no => {
                formData.append('deletedImageNos', no);
            });

            // 게임 정보 업데이트
            await axios.put(
                `http://localhost:8080/game/${gameNo}`,
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            // 시스템 요구사항 업데이트
            await axios.put(
                `http://localhost:8080/game/requirements/${gameNo}`,
                [
                    {
                        ...requirements.minimum,
                        gameNo: gameNo,
                        requirementType: 'minimum'
                    },
                    {
                        ...requirements.recommended,
                        gameNo: gameNo,
                        requirementType: 'recommended'
                    }
                ],
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // 미리보기 URL 정리 (기존 코드 유지)
            previewUrls.forEach(url => URL.revokeObjectURL(url));

            alert("수정이 완료되었습니다.");
            navigate("/game/detail/" + gameNo);
        } catch (error) {
            console.error("수정 실패:", error);
            console.error("에러 상세:", error.response?.data);
            alert("게임 정보 수정 중 오류가 발생했습니다.");
        }
    }, [game, selectedFiles, deletedImageNos, gameNo, requirements, navigate, previewUrls]);


    // 삭제 함수 추가
    const handleDelete = async () => {
        try {
            const token = sessionStorage.getItem("accessToken");
            if (!token) {
                alert("로그인이 필요합니다.");
                return;
            }

            // 삭제 확인
            if (!window.confirm("정말 이 게임을 삭제하시겠습니까?")) {
                return;
            }

            await axios.delete(`http://localhost:8080/game/${gameNo}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("게임이 성공적으로 삭제되었습니다.");
            navigate("/game/list");
        } catch (error) {
            console.error("게임 삭제 실패:", error);
            alert("게임 삭제 중 오류가 발생했습니다.");
        }
    };


    return (game !== null ? (
        <div className={styles.container}>
            <h1 className={styles.title}>{game.gameTitle} 정보 수정</h1>

            {/* Image Upload Section */}
            <div className={styles.imageUploadSection}>
                <h3>게임 이미지</h3>
                <div className={styles.imagePreviewArea}>
                    {/* 기존 이미지들 */}
                    {existingImages.map((img) => (
                        <div key={img.attachmentNo} className={styles.previewContainer}>
                            <img
                                src={`http://localhost:8080/game/download/${img.attachmentNo}`}
                                alt="기존 게임 이미지"
                                className={styles.previewImage}
                            />
                            <button
                                onClick={() => handleExistingImageDelete(img.attachmentNo)}
                                className={styles.removeButton}
                            >
                                <X size={20} />
                            </button>
                            <div className={styles.imageLabel}>기존 이미지</div>
                        </div>
                    ))}

                    {/* 새로 추가된 이미지들 */}
                    {previewUrls.map((url, index) => (
                        <div key={`new-${index}`} className={styles.previewContainer}>
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
                            <div className={styles.imageLabel}>새 이미지</div>
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
                    <select name="gameGrade" className={styles.input}
                        value={styles.input.gameGrade} onChange={changeGame}>
                        <option value="">선택하세요</option>
                        <option>전체이용가</option>
                        <option>12세이용가</option>
                        <option>15세이용가</option>
                        <option>19세이용가</option>
                    </select>
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
                    <label>지원 플랫폼</label>
                    <input
                        type="text"
                        className={styles.input}
                        name="gamePlatforms"
                        value={game.gamePlatforms}
                        onChange={changeGame}
                    />
                </div>

                <div className={styles.systemRequirements}>
                    <h3 className={styles.requirementTitle}>최소 시스템 사양</h3>
                    <div className={styles.requirementGrid}>
                        <div className={styles.formGroup}>
                            <label>운영체제</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: Windows 10 64-bit"
                                value={requirements.minimum.os}
                                onChange={(e) => handleRequirementChange('minimum', 'os', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>프로세서</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: Intel Core i5-4460"
                                value={requirements.minimum.processor}
                                onChange={(e) => handleRequirementChange('minimum', 'processor', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>메모리</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: 8 GB RAM"
                                value={requirements.minimum.memory}
                                onChange={(e) => handleRequirementChange('minimum', 'memory', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>그래픽</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: NVIDIA GTX 1060"
                                value={requirements.minimum.graphics}
                                onChange={(e) => handleRequirementChange('minimum', 'graphics', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>DirectX</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: Version 11"
                                value={requirements.minimum.directxVersion}
                                onChange={(e) => handleRequirementChange('minimum', 'directxVersion', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>저장공간</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: 50 GB"
                                value={requirements.minimum.storage}
                                onChange={(e) => handleRequirementChange('minimum', 'storage', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>사운드카드</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: DirectX Compatible"
                                value={requirements.minimum.soundCard}
                                onChange={(e) => handleRequirementChange('minimum', 'soundCard', e.target.value)}
                            />
                        </div>
                    </div>

                    <h3 className={styles.requirementTitle}>권장 시스템 사양</h3>
                    <div className={styles.requirementGrid}>
                        <div className={styles.formGroup}>
                            <label>운영체제</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: Windows 11 64-bit"
                                value={requirements.recommended.os}
                                onChange={(e) => handleRequirementChange('recommended', 'os', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>프로세서</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: Intel Core i7-8700"
                                value={requirements.recommended.processor}
                                onChange={(e) => handleRequirementChange('recommended', 'processor', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>메모리</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: 16 GB RAM"
                                value={requirements.recommended.memory}
                                onChange={(e) => handleRequirementChange('recommended', 'memory', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>그래픽</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: NVIDIA RTX 3060"
                                value={requirements.recommended.graphics}
                                onChange={(e) => handleRequirementChange('recommended', 'graphics', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>DirectX</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: Version 12"
                                value={requirements.recommended.directxVersion}
                                onChange={(e) => handleRequirementChange('recommended', 'directxVersion', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>저장공간</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: 100 GB"
                                value={requirements.recommended.storage}
                                onChange={(e) => handleRequirementChange('recommended', 'storage', e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>사운드카드</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="예: DirectX Compatible"
                                value={requirements.recommended.soundCard}
                                onChange={(e) => handleRequirementChange('recommended', 'soundCard', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button
                        className={styles.submitButton}
                        onClick={updateGame}  // saveGame이 아닌 updateGame 사용
                    >
                        수정
                    </button>
                    {currentUser?.memberLevel === "관리자" && (
                        <button
                            className={styles.deleteButton}
                            onClick={async () => {
                                try {
                                    if (!window.confirm("정말 이 게임을 삭제하시겠습니까?")) return;

                                    const token = sessionStorage.getItem("accessToken");
                                    await axios.delete(`http://localhost:8080/game/${gameNo}`, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    });

                                    alert("게임이 성공적으로 삭제되었습니다.");
                                    navigate("/game/list");
                                } catch (error) {
                                    console.error("게임 삭제 실패:", error);
                                    alert("게임 삭제 중 오류가 발생했습니다.");
                                }
                            }}
                        >
                            삭제
                        </button>
                    )}
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