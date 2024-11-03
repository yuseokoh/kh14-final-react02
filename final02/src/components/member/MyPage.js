import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState } from "../../utils/recoil";
import { useNavigate } from 'react-router-dom';
import styles from './MyPage.module.css';
import { useTranslation } from 'react-i18next';

const MyPage = () => {
    const { t } = useTranslation();
    const [member, setMember] = useState({});
    const [image, setImage] = useState(null);
    const navigate = useNavigate(); 

    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);

    const loadMember = useCallback(async (memberId) => {
        try {
            const resp = await axios.get(`http://localhost:8080/member/${memberId}`);
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
                        <h1>{member.memberPoint} / {levelInfo.nextLevelPoints}</h1>
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
                    onClick={() => navigate(`/member/mypageedit/${memberId}`)}
                >
                    {t("edit")}
                </button>
            </div>
        </div>
    );
};

export default MyPage;
