import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useRecoilState, useSetRecoilState } from 'recoil'; 
import { kakaoIdState, kakaoAccessTokenState, memberLevelState, memberIdState } from "../../utils/recoil";

function KakaoLoginPage() {
  const REST_API_KEY = "e027bcf677db65dbc9a5954313eb0a3f";
  const REDIRECT_URI = "http://localhost:3000/member/KakaoLoginPage";
  const navigate = useNavigate();
  
  // 로그인 유지 상태
  const [stay, setStay] = useState(false); // stay state 사용

  // Recoil 상태 설정 함수 가져오기
  const setMemberId = useSetRecoilState(memberIdState);
  const setKakaoId = useSetRecoilState(kakaoIdState);
  const setKakaoAccessToken = useSetRecoilState(kakaoAccessTokenState);
  const [memberLevel, setMemberLevel] = useRecoilState(memberLevelState);

  const KakaoLogin = () => {
    // 카카오 로그인 페이지로 리다이렉트
    window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
  };

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");
    if (code) {
      // 카카오 로그인 API 호출
      axios.post("http://localhost:8080/kakao/login", { code }, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        console.log("응답 데이터: ", response.data); 
      
      // 응답에서 필요한 데이터 추출
      const { accessToken, jwtToken, refreshToken, emailRequired, kakaoId, nickname, memberLevel } = response.data;

        console.log("Access Token:", accessToken);
        console.log("JWT Token:", jwtToken);
        console.log("Refresh Token:", refreshToken);
        console.log("Email Required:", emailRequired);
        console.log("Kakao ID:", kakaoId);
        console.log("Nickname:", nickname);
      
        // 이메일 입력이 필요한 경우 이메일 입력 페이지로 이동
        if (emailRequired) {
          console.log("카카오 ID 저장: ", kakaoId);
          localStorage.setItem('kakaoId', kakaoId);
          navigate('/member/KakaoEmail');
        } else if (jwtToken && accessToken) {
          // JWT 토큰이 있을 경우 저장하고 메인 페이지로 이동
          console.log('JWT Token:', jwtToken);
          console.log('Access Token:', accessToken);
          // 1. 세션 또는 로컬 스토리지에 저장 (stay 상태에 따라)
          if (stay) {
            window.localStorage.setItem('refreshToken', refreshToken);
            // window.localStorage.setItem('accessToken', accessToken);
          } else {
            window.sessionStorage.setItem('refreshToken', refreshToken);
            // window.sessionStorage.setItem('accessToken', accessToken);
          }
          // sessionStorage.setItem('jwtToken', jwtToken);
          // sessionStorage.setItem('accessToken', accessToken);
          // sessionStorage.setItem('nickname', nickname);
      
          // 2. Recoil 상태에도 저장
          setMemberId(kakaoId);
          setMemberLevel(memberLevel);
          console.log('Recoil에 저장된 Kakao ID:', kakaoId);
          console.log('Recoil에 저장된 Access Token:', accessToken);
      
          // 3. 메인 페이지로 이동
          navigate('/');
        } else {
          console.error("JWT Token is missing");
          // alert('로그인 실패');
        }
      })
      .catch(error => {
        console.error("로그인 실패: ", error.response ? error.response.data : error.message);
        // alert('로그인에 실패했습니다.');
      });
    }
  }, [navigate, setKakaoId, setKakaoAccessToken, stay]);

  return (
    <div>
      <button onClick={KakaoLogin}>카카오 로그인</button>

      {/* 로그인 유지 체크박스 */}
      <label>
        <input
          type="checkbox"
          checked={stay}
          onChange={(e) => setStay(e.target.checked)}
        />
        로그인 유지
      </label>
    </div>
  );
}

export default KakaoLoginPage;