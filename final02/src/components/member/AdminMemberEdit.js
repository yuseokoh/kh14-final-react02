import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { memberLevelState } from '../../utils/recoil';
import axios from 'axios';
import styles from './AdminMemberEdit.module.css';

const AdminMemberEdit = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const currentUserLevel = useRecoilValue(memberLevelState);
  const [memberInfo, setMemberInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 관리자가 아니면 접근 불가
    if (currentUserLevel !== "관리자") {
      navigate('/');
      return;
    }

    // 회원 정보 가져오기
    const fetchMemberInfo = async () => {
      try {
        const token = window.localStorage.getItem("jwtToken");
        if (!token) {
          throw new Error("인증 토큰이 없습니다.");
        }

        const response = await axios.get(
          `/member/${memberId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data) {
          setMemberInfo(response.data);
        } else {
          throw new Error("회원 정보가 없습니다.");
        }
      } catch (error) {
        console.error("회원 정보 조회 실패:", error);
        setError('회원 정보를 가져오는데 실패했습니다.');
      }
    };

    fetchMemberInfo();
  }, [memberId, currentUserLevel, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = window.localStorage.getItem("jwtToken");
      if (!token) {
        throw new Error("인증 토큰이 없습니다.");
      }

      // 회원 정보 수정 요청
      await axios.put(
        `/member/admin/edit/${memberId}`,
        memberInfo,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      alert("회원 정보가 성공적으로 수정되었습니다.");
      navigate(-1);
    } catch (error) {
      console.error("회원 정보 수정 실패:", error);
      setError('회원 정보 수정에 실패했습니다.');
      alert("회원 정보 수정 중 오류가 발생했습니다.");
    }
  };

  if (error) return <div className={styles.error}>{error}</div>;
  if (!memberInfo) return <div>로딩중...</div>;

  return (
    <div className={styles.editContainer}>
      <h2>회원 정보 수정</h2>
      <form onSubmit={handleSubmit} className={styles.editForm}>
        <div className={styles.formGroup}>
          <label>회원 ID</label>
          <input type="text" value={memberInfo.memberId} disabled />
        </div>

        <div className={styles.formGroup}>
          <label>회원 레벨</label>
          <select
            value={memberInfo.memberLevel}
            onChange={(e) => setMemberInfo({
              ...memberInfo,
              memberLevel: e.target.value
            })}
          >
            <option value="일반회원">일반회원</option>
            <option value="개발자">개발자</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>이메일</label>
          <input
            type="email"
            value={memberInfo.memberEmail || ''}
            onChange={(e) => setMemberInfo({
              ...memberInfo,
              memberEmail: e.target.value
            })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>닉네임</label>
          <input
            type="text"
            value={memberInfo.memberNickname || ''}
            onChange={(e) => setMemberInfo({
              ...memberInfo,
              memberNickname: e.target.value
            })}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            저장
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={styles.cancelButton}
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminMemberEdit;