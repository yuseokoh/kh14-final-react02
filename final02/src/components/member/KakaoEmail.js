import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import {
  memberIdState,
  memberLevelState,
  kakaoIdState,
  kakaoAccessTokenState,
  loginState,
} from '../../utils/recoil';

function KakaoEmail() {
  const [email, setEmail] = useState('');
  const [kakaoId, setKakaoId] = useState('');
  const navigate = useNavigate();

  // Recoil 상태 설정 함수
  const setMemberId = useSetRecoilState(memberIdState);
  const setMemberLevel = useSetRecoilState(memberLevelState);
  const setKakaoIdState = useSetRecoilState(kakaoIdState);
  const setKakaoAccessToken = useSetRecoilState(kakaoAccessTokenState);
  const setLogin = useSetRecoilState(loginState);

  useEffect(() => {
    const storedKakaoId = localStorage.getItem('kakaoId');
    if (storedKakaoId) {
      setKakaoId(storedKakaoId);
      console.log('저장된 카카오 ID: ', storedKakaoId);
    } else {
      alert('카카오 로그인 정보가 없습니다.');
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // 이메일 형식 검증
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      alert('유효한 이메일 주소를 입력해주세요.');
      return;
    }

    axios
    .post('http://localhost:8080/kakao/saveEmail', { kakaoId, memberEmail: email })
    .then((response) => {
      if (response.status === 200 && response.data.success) { // 성공 조건 수정
        alert('이메일 저장 및 계정 연동에 성공했습니다.');

        // Recoil 상태 업데이트
        setMemberId(kakaoId);
        setMemberLevel('카카오 회원');
        setKakaoIdState(kakaoId);
        setKakaoAccessToken(localStorage.getItem('accessToken'));
        setLogin(true);

        navigate('/');
      } else {
        alert('이메일 저장 및 계정 연동에 실패했습니다.');
      }
    })
    .catch((error) => {
      console.error('이메일 저장 및 계정 연동 실패: ', error.response ? error.response.data : error.message);
      alert('이메일 저장 및 계정 연동에 실패했습니다.');
    });
};

    // 이메일 저장 및 계정 연동 API 호출
  //   axios
  //     .post('http://localhost:8080/kakao/saveEmail', { kakaoId, memberEmail: email })
  //     .then((response) => {
  //       if (response.status === 200 && response.data === "성공 메시지") { // 적절한 성공 메시지를 확인
  //         alert('이메일 저장 및 계정 연동에 성공했습니다.');

  //         // 로그인 상태 및 사용자 정보 업데이트
  //         setMemberId(kakaoId); // 카카오 ID를 memberId로 설정
  //         setMemberLevel('카카오 회원'); // 회원 레벨 설정
  //         setKakaoIdState(kakaoId);

  //         // 액세스 토큰이 존재하는지 확인
  //         const accessToken = localStorage.getItem('accessToken');
  //         if (accessToken) {
  //           setKakaoAccessToken(accessToken); // 카카오 액세스 토큰 설정
  //         } else {
  //           console.warn('액세스 토큰이 없습니다.');
  //         }

  //         setLogin(true); // 로그인 상태로 설정

  //         navigate('/'); // 메인 페이지로 리다이렉트
  //       }else {
  //         alert('이메일 저장 및 계정 연동에 실패했습니다.');
  //       }
        
  //     })
  //     .catch((error) => {
  //       console.error('이메일 저장 및 계정 연동 실패: ', error.response ? error.response.data : error.message);
  //       alert('이메일 저장 및 계정 연동에 실패했습니다.');
  //     });
  // };

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
