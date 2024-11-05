import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRecoilState, useRecoilValue } from 'recoil';
import { loginState, memberIdState, memberLevelState } from "../../utils/recoil";
import { useNavigate } from 'react-router-dom';
import styles from './MyPage.module.css';
import { useTranslation } from 'react-i18next';
import styled from "styled-components";

const ProgressBar = styled.div`
    width: 100%;
    height: 30px;
    background-color: #dedede;
    border-radius: 12px;
    margin-top: 20px;
    overflow: hidden;
`;

const Progress = styled.div`
    width: ${(props) => props.width}%;
    height: 100%;
    text-align: right;
    background-color: skyblue;
    color: #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.8rem;
`;


const MyPage = () => {
    const { t } = useTranslation();
    const [member, setMember] = useState({});
    const [image, setImage] = useState(null);
    const navigate = useNavigate();
    const [memberId, setMemberId] = useRecoilState(memberIdState);
    const [memberLevel, setMemberLevel] = useRecoilState(memberLevelState);
    const login = useRecoilValue(loginState);


    const loadMember = useCallback(async () => {
        try {
            const resp = await axios.get("http://localhost:8080/member/");
            console.log("Member data received:", resp.data); // 데이터 출력
            setMember(resp.data);
        } catch (error) {
            console.error("Error loading member data:", error);
        }
    }, []);

    const loadImage = useCallback(async (memberId) => {
        try {
            const resp = await axios.get(`/member/image/${memberId}`);
            const { attachment } = resp.data;

            if (attachment) {
                const imageUrl = `/member/download/${attachment}`;
                setImage(imageUrl);
            } else {
                setImage('/default-profile.png');
            }
        } catch (error) {
            console.error("Error loading image:", error);
            setImage('/default-profile.png');
        }
    }, []);

    const logout = useCallback((e) => {
        // recoil에 저장된 memberId와 memberLevel을 제거
        setMemberId("");
        setMemberLevel("");

        // axios에 설정된 Authorization 헤더도 제거
        delete axios.defaults.headers.common["Authorization"];

        // localStorage, sessionStorage의 refreshToken 및 jwtToken 제거
        window.localStorage.removeItem("refreshToken");
        window.sessionStorage.removeItem("refreshToken");

        // 페이지 이동
        navigate("/");
    }, [setMemberId, setMemberLevel, , , , navigate]);

    const delmember = useCallback(async () => {
        try {
            await axios.delete(`/member/delete/${member.memberId}`);
            navigate("/"); // 삭제 후 메인 페이지로 이동
            logout("/");

        } catch (error) {
            console.error("Error deleting member:", error);
        }
    }, [member.memberId, navigate]);

    useEffect(() => {
        if (login && memberId) {
            loadMember(memberId);
            loadImage(memberId);
        }
    }, [login, memberId]);

    const imageUrl = image || '/default-profile.png';

    const levels = [
        { points: 20000, level: 'challenger', frame: `${process.env.PUBLIC_URL}/LevelImage/challenger.jpg` },
        { points: 10000, level: 'master', frame: `${process.env.PUBLIC_URL}/LevelImage/master.jpg` },
        { points: 5000, level: 'diamond', frame: `${process.env.PUBLIC_URL}/LevelImage/diamond.jpg` },
        { points: 2000, level: 'platinum', frame: `${process.env.PUBLIC_URL}/LevelImage/platinum.jpg` },
        { points: 1000, level: 'gold', frame: `${process.env.PUBLIC_URL}/LevelImage/gold.jpg` },
        { points: 500, level: 'silver', frame: `${process.env.PUBLIC_URL}/LevelImage/silver.jpg` },
        { points: 100, level: 'bronze', frame: `${process.env.PUBLIC_URL}/LevelImage/bronze.jpg` },
        { points: 0, level: 'iron', frame: `${process.env.PUBLIC_URL}/LevelImage/iron.jpg` }
    ];

    const getLevelInfo = (points) => {
        for (let i = 0; i < levels.length; i++) {
            if (points >= levels[i].points) {
                const currentLevel = levels[i];
                const nextLevelPoints = i > 0 ? levels[i - 1].points : currentLevel.points;
                return {
                    ...currentLevel,
                    nextLevelPoints
                };
            }
        }
        return levels[levels.length - 1];
    };

    const renderProfileImage = () => {
        const levelInfo = getLevelInfo(member?.memberPoint);


        return (
            <div className={styles.profileImageContainer}>
                <img
                    src={levelInfo.frame}
                    alt={t(`levels.${levelInfo.level}`)}
                    className={styles.levelFrame}
                />
            </div>
        );
    };

    const levelInfo = getLevelInfo(member?.memberPoint);
    const progressPercentage = ((member?.memberPoint || 0) / levelInfo.nextLevelPoints) * 100;

    const handleGoToCancelPage = () => navigate("/paymentList");
        
      
     

    return (
        <div className={styles.container}>
            <div className={styles.profileHeader}>
                {renderProfileImage()}
                <div className={styles.profileInfo}>
                    <h1 className={styles.username}>{t("myInfo", { memberId: member?.memberId || '' })}</h1>
                    <div className={`${styles.levelBadge} ${styles[levelInfo.level]}`}>
                        {t(`levels.${levelInfo.level}`).toUpperCase()}
                    </div>
                    <div>

                        {/* Progress bar */}
                        <ProgressBar>
                            <Progress width={progressPercentage}>
                                {progressPercentage.toFixed(2)}%
                                {/* <h3>{member.memberPoint} / {levelInfo.nextLevelPoints}</h3> */}
                            </Progress>
                        </ProgressBar>
                    </div>
                </div>
            </div>

            <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                    <div className={styles.label}>{t("nickname")}</div>
                    <div className={styles.value}>{member?.memberNickname}</div>
                </div>
                <div className={styles.infoRow}>
                    <div className={styles.label}>{t("phoneNumber")}</div>
                    <div className={styles.value}>{member?.memberContact}</div>
                </div>
                <div className={styles.infoRow}>
                    <div className={styles.label}>{t("email")}</div>
                    <div className={styles.value}>{member?.memberEmail}</div>
                </div>
                <div className={styles.infoRow}>
                    <div className={styles.label}>{t("birthDate")}</div>
                    <div className={styles.value}>{member?.memberBirth}</div>
                </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button
                    className={styles.editButton}
                    onClick={() => navigate(`/member/mypageedit`)}  // memberId 없이 수정 페이지로 이동
                >
                    {t("edit")}
                </button>
                <button
                    className={styles.delButton}
                    // onClick={() => navigate(`/member/delete/${memberId}`)}
                    onClick={delmember}
                >
                    {t("delete")}
                </button>

                <button onClick={handleGoToCancelPage} className={styles.payButton}>
                    {t('paymentSuccess.PaymentHistory')}
      </button>

            </div>
        </div>
    );
};

export default MyPage;