import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import {
  memberIdState,
  memberLevelState,
  kakaoIdState,
  kakaoAccessTokenState,
} from '../../utils/recoil';

function KakaoEmail() {
  const [email, setEmail] = useState('');
  const [kakaoId, setKakaoId] = useState('');
  const [isEmailRequired, setIsEmailRequired] = useState(false);
  const navigate = useNavigate();

  // Recoil 상태 설정 함수
  const setMemberId = useSetRecoilState(memberIdState);
  const setMemberLevel = useSetRecoilState(memberLevelState);
  const setKakaoIdState = useSetRecoilState(kakaoIdState);
  const setKakaoAccessToken = useSetRecoilState(kakaoAccessTokenState);

  useEffect(() => {
    const storedKakaoId = window.localStorage.getItem('kakaoId');
    const storedJwtToken = window.sessionStorage.getItem('jwtToken');
    const storedRefreshToken = window.sessionStorage.getItem('refreshToken');

    if (storedKakaoId) {
      setKakaoId(storedKakaoId);

      if (storedJwtToken && storedRefreshToken) {
        // 토큰이 있으면 로그인 상태를 유지
        setMemberId(storedKakaoId);
        setMemberLevel('카카오 회원');
        setKakaoIdState(storedKakaoId);
        setKakaoAccessToken(storedJwtToken);
        navigate('/');
      } else {
        // 서버에 요청하여 임시 이메일 여부 확인
        axios
          .get(`/kakao/find/${storedKakaoId}`)
          .then((response) => {
            if (
              response.data &&
              response.data.memberEmail &&
              !response.data.memberEmail.startsWith('no-email@')
            ) {
              setMemberId(storedKakaoId);
              setMemberLevel('카카오 회원');
              setKakaoIdState(storedKakaoId);
              navigate('/');
            } else {
              setIsEmailRequired(true);
            }
          })
          .catch((error) => console.error('임시 이메일 확인 중 오류 발생: ', error));
      }
    } else {
      alert('카카오 로그인 정보가 없습니다.');
      navigate('/');
    }
  }, [navigate, setKakaoAccessToken, setKakaoIdState, setMemberId, setMemberLevel]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    try {
      const response = await axios.post('/kakao/saveEmail', {
        kakaoId,
        memberEmail: email,
      });

      if (response.status === 200 && response.data.success) {
        alert('이메일 저장 및 계정 연동에 성공했습니다.');
        const { jwtToken, refreshToken } = response.data;

        if (jwtToken) {
          window.sessionStorage.setItem('jwtToken', jwtToken);
          setKakaoAccessToken(jwtToken);
        }
        if (refreshToken) {
          window.sessionStorage.setItem('refreshToken', refreshToken);
        }

        setMemberId(kakaoId);
        setMemberLevel('카카오 회원');
        setKakaoIdState(kakaoId);

        navigate('/');
      } else {
        alert('이메일 저장 및 계정 연동에 실패했습니다.');
      }
    } catch (error) {
      console.error(
        '이메일 저장 및 계정 연동 실패: ',
        error.response ? error.response.data : error.message
      );
      alert('이메일 저장 및 계정 연동에 실패했습니다.');
    }
  };

  if (!isEmailRequired) {
    return null;
  }

  return (
    <div>
      <h2>이메일 입력</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">이메일 주소: </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">저장</button>
      </form>
    </div>
  );
}

export default KakaoEmail;
