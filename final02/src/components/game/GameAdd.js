import axios from "axios";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router";
import styles from './GameAdd.module.css'; 
import { X, Upload, Image } from 'lucide-react';
import { useTranslation } from "react-i18next"; // i18next 추가

const GameAdd = ()=>{
    const navigate = useNavigate();
    const { t } = useTranslation(); // t 함수 가져오기

    //이미지 파일들을 관리하기 위한 state
    const [selectedFiles, setSelectedFiles] = useState([]);

    //이미지 미리보기 URL들을 관리하기 위한 state
    const [previewUrls, setPreviewUrls] = useState([]);

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
            
        if (files.length > 0) {
            // 기존 선택된 파일들과 새로 선택된 파일들 합치기
            setSelectedFiles(prevFiles => [...prevFiles, ...files]);
            
            // 새로운 미리보기 URL 생성
            const urls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prevUrls => [...prevUrls, ...urls]);
        }
    };

    //특정 이미지 제거
    const removeImage = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
        
        //이전 미리보기 URL 해제
        URL.revokeObjectURL(previewUrls[index]);

        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviewUrls);
    }

    //state
    //입력창
    const [input, setInput] = useState({
        gameTitle:"",
        gamePrice:"",
        gameDeveloper:"",
        gamePublicationDate:"",
        gameDiscount:"",
        gameCategory:"",
        gameGrade:"",
        gameTheme:"",
        gameDescription:"",
        gameShortDescription:"",
        gameUserScore:"",
        gameReviewCount:"",
        gamePlatforms:"",
        gameSystemRequirement:"",
    });

    //게임 등록에 사용할 함수
    const changeInput = useCallback(e=> {
        setInput({
            ...input,
            [e.target.name] : e.target.value
        });
    }, [input]);

    const saveGame = useCallback(async()=> {
        try{
            //formData 객체 생성
            const formData = new FormData();

            //게임 정볼르 JSON형태로 추가
            formData.append('game', new Blob([JSON.stringify(input)],{
                type: 'application/json'
            }));
        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        //서버에 데이터 전송
        await axios.post("http://localhost:8080/game/", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        //미리보기 URL 정리
        previewUrls.forEach(url => URL.revokeObjectURL(url));

        //알림 코드
        navigate("/game/list");
        }
        catch(error) {
            console.error("게임 등록 실패 : ", error);
            alert("게임 등록에 실패했습니다.");
        }
    }, [input, selectedFiles, navigate]);


    return (
        <>
            <div className={styles.container}>
                <h1 className={styles.title}>{t("gameAdd.title")}</h1>
                
                {/* 이미지 업로드 섹션 */}
                <div className={styles.imageUploadSection}>
                    <h3>{t("gameAdd.gameImages")}</h3>
                    <div className={styles.imagePreviewArea}>
                        {previewUrls.map((url, index) => (
                            <div key={index} className={styles.previewContainer}>
                                <img 
                                    src={url} 
                                    alt={`${t("gameAdd.previewAlt")} ${index + 1}`} 
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
                                <span>{t("gameAdd.addImage")}</span>
                            </div>
                        </label>
                    </div>
                    <p className={styles.imageHelp}>
                        {t("gameAdd.imageHelp")}
                    </p>
                </div>

                <div className={styles.formSection}>
                    
                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.gameTitle")}</label>
                        <input 
                            type="text"
                            className={styles.input}
                            placeholder={t("gameAdd.gameTitlePlaceholder")}
                            name="gameTitle"
                            value={input.gameTitle}
                            onChange={changeInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.price")}</label>
                        <input 
                            type="number"
                            className={styles.input}
                            placeholder={t("gameAdd.pricePlaceholder")}
                            name="gamePrice"
                            value={input.gamePrice}
                            onChange={changeInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.developer")}</label>
                        <input 
                            type="text"
                            className={styles.input}
                            placeholder={t("gameAdd.developerPlaceholder")}
                            name="gameDeveloper"
                            value={input.gameDeveloper}
                            onChange={changeInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.publicationDate")}</label>
                        <input 
                            type="date"
                            className={styles.input}
                            name="gamePublicationDate"
                            value={input.gamePublicationDate}
                            onChange={changeInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.discount")}</label>
                        <input 
                            type="number"
                            className={styles.input}
                            placeholder={t("gameAdd.discountPlaceholder")}
                            name="gameDiscount"
                            value={input.gameDiscount}
                            onChange={changeInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.category")}</label>
                        <input 
                            type="text"
                            className={styles.input}
                            placeholder={t("gameAdd.categoryPlaceholder")}
                            name="gameCategory"
                            value={input.gameCategory}
                            onChange={changeInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.grade")}</label>
                        <input 
                            type="text"
                            className={styles.input}
                            placeholder={t("gameAdd.gradePlaceholder")}
                            name="gameGrade"
                            value={input.gameGrade}
                            onChange={changeInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.theme")}</label>
                        <input 
                            type="text"
                            className={styles.input}
                            placeholder={t("gameAdd.themePlaceholder")}
                            name="gameTheme"
                            value={input.gameTheme}
                            onChange={changeInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.description")}</label>
                        <input 
                            type="text"
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder={t("gameAdd.descriptionPlaceholder")}
                            name="gameDescription"
                            value={input.gameDescription}
                            onChange={changeInput}
                            rows="6"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.shortDescription")}</label>
                        <input 
                            type="text"
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder={t("gameAdd.shortDescriptionPlaceholder")}
                            name="gameShortDescription"
                            value={input.gameShortDescription}
                            onChange={changeInput}
                            rows="3"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.userScore")}</label>
                        <input 
                            type="number"
                            className={styles.input}
                            placeholder={t("gameAdd.userScorePlaceholder")}
                            name="gameUserScore"
                            value={input.gameUserScore}
                            onChange={changeInput}
                            min="0"
                            max="10"
                            step="0.1"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.reviewCount")}</label>
                        <input 
                            type="number"
                            className={styles.input}
                            placeholder={t("gameAdd.reviewCountPlaceholder")}
                            name="gameReviewCount"
                            value={input.gameReviewCount}
                            onChange={changeInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.platforms")}</label>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder={t("gameAdd.platformsPlaceholder")}
                            name="gamePlatforms"
                            value={input.gamePlatforms}
                            onChange={changeInput}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{t("gameAdd.systemRequirements")}</label>
                        <textarea
                            className={`${styles.input} ${styles.textarea}`}
                            placeholder={t("gameAdd.systemRequirementsPlaceholder")}
                            name="gameSystemRequirement"
                            value={input.gameSystemRequirement}
                            onChange={changeInput}
                            rows="6"
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button 
                            className={styles.submitButton}
                            onClick={saveGame}
                        >
                            {t("gameAdd.submit")}
                        </button>
                        <button 
                            className={styles.cancelButton}
                            onClick={() => navigate("/game/list")}
                        >
                            {t("gameAdd.cancel")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GameAdd;