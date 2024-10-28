import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function KakaoLoginPage() {
  const REST_API_KEY = "e027bcf677db65dbc9a5954313eb0a3f";
  const REDIRECT_URI = "http://localhost:3000/member/KakaoLoginPage";
  const navigate = useNavigate();

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
        const { jwtToken, emailRequired, kakaoId} = response.data;

        // 이메일 입력이 필요한 경우 이메일 입력 페이지로 이동
        if (emailRequired) {
          console.log("카카오 ID 저장: ", kakaoId);
           localStorage.setItem('kakaoId', kakaoId);
          navigate('/member/KakaoEmail');
        } else if (jwtToken) {
          // JWT 토큰이 있을 경우 저장하고 메인 페이지로 이동
          localStorage.setItem('jwtToken', jwtToken);
          navigate('/');
        } else {
          console.error("JWT Token is missing");
          alert('로그인 실패');
        }
      })
      .catch(error => {
        console.error("로그인 실패: ", error.response ? error.response.data : error.message);
        alert('로그인에 실패했습니다.');
      });
    }
  }, [navigate]);

  return (
    <div>
      <button onClick={KakaoLogin}>카카오 로그인</button>
    </div>
  );
}

export default KakaoLoginPage;
