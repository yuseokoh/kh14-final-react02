import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import styles from './MyPageEdit.module.css';
import { useTranslation } from 'react-i18next';

const MemberEdit = () => {
  const { t } = useTranslation();
  const { memberId } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadMember();
  }, []);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const loadMember = useCallback(async () => {
    try {
      const resp = await axios.get(`http://localhost:8080/member/${memberId}`);
      setMember(resp.data);
    } catch (e) {
      setMember(null);
    }
  }, [memberId]);

  const changeMember = useCallback((e) => {
    setMember({
      ...member,
      [e.target.name]: e.target.value,
    });
  }, [member]);

  const updateMember = useCallback(async () => {
    try {
      const formData = new FormData();
      formData.append(
        "member",
        new Blob([JSON.stringify(member)], { type: "application/json" })
      );

      files.forEach((file) => {
        formData.append("files", file);
      });

      await axios.put("http://localhost:8080/member/edit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/member/mypage/${memberId}`);
    } catch (error) {
      console.error("Update failed:", error.response ? error.response.data : error.message);
      alert(t("updateFailed"));
    }
  }, [member, files, memberId]);

  const imageUrl = member?.attachment
    ? `http://localhost:8080/member/download/${member.attachment}`
    : "/default-profile.png";

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

  const levelInfo = getLevelInfo(member?.memberPoint);

  return member ? (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <div className={styles.profileInfo}>
          <div className={styles.profileNameContainer}>
            <img
              src={levelInfo.frame}
              alt={t(`levels.${levelInfo.level}`)}
              className={styles.levelImage}
            />
            <h1 className={styles.username}>{t("editInfo", { memberId: member.memberId })}</h1>
          </div>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.label}>{t("nickname")}</span>
              <input
                type="text"
                name="memberNickname"
                className="form-control"
                value={member.memberNickname || ""}
                onChange={changeMember}
              />
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>{t("email")}</span>
              <input
                type="email"
                name="memberEmail"
                className="form-control"
                value={member.memberEmail || ""}
                onChange={changeMember}
              />
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>{t("birthDate")}</span>
              <input
                type="date"
                name="memberBirth"
                className="form-control"
                value={member.memberBirth || ""}
                onChange={changeMember}
              />
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>{t("phoneNumber")}</span>
              <input
                type="text"
                name="memberContact"
                className="form-control"
                value={member.memberContact || ""}
                onChange={changeMember}
              />
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>{t("address")}</span>
              <input
                type="text"
                name="memberAddress1"
                className="form-control"
                value={member.memberAddress1 || ""}
                onChange={changeMember}
              />
              <input
                type="text"
                name="memberAddress2"
                className="form-control mt-2"
                value={member.memberAddress2 || ""}
                onChange={changeMember}
              />
            </div>
          </div>
          <div className="row mt-4">
            <div className="col text-center">
              <button type="button" className="btn btn-lg btn-success" onClick={updateMember}>
                {t("edit")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default MemberEdit;
