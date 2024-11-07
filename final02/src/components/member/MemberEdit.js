import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { memberLevelState } from '../utils/recoil';
import axios from 'axios';
import styles from './MemberEdit.module.css';

const MemberEdit = () => {
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
        const response = await axios.get(`/api/member/${memberId}`);
        setMemberInfo(response.data);
      } catch (error) {
        setError('회원 정보를 가져오는데 실패했습니다.');
      }
    };

    fetchMemberInfo();
  }, [memberId, currentUserLevel, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/member/${memberId}`, memberInfo);
      // 개발자 권한 요청 처리 완료 시 요청 삭제
      await axios.delete(`/api/developer-requests/${memberId}`);
      navigate('/admin/members');
    } catch (error) {
      setError('회원 정보 수정에 실패했습니다.');
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

        {/* 관리자만 볼 수 있는 회원 레벨 수정 옵션 */}
        {currentUserLevel === "관리자" && (
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
        )}

        {/* 기타 회원 정보 필드들 */}
        <div className={styles.formGroup}>
          <label>이메일</label>
          <input
            type="email"
            value={memberInfo.email}
            onChange={(e) => setMemberInfo({
              ...memberInfo,
              email: e.target.value
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

export default MemberEdit;