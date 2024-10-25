import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function KakaoEmail() {
  const [email, setEmail] = useState('');
  const [kakaoId, setKakaoId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 로컬 스토리지에서 저장된 kakaoId를 가져옴
    const storedKakaoId = localStorage.getItem('kakaoId');
    if (storedKakaoId) {
      setKakaoId(storedKakaoId);  // kakaoId를 설정
      console.log("저장된 카카오 ID: ", storedKakaoId); 
    } else {
      alert('카카오 로그인 정보가 없습니다.');
      navigate('/');  // 카카오 로그인 정보가 없으면 메인 페이지로 리다이렉트
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // 입력한 이메일과 kakaoId를 백엔드로 전송하여 저장
    axios.post('http://localhost:8080/kakao/saveEmail', { kakaoId, memberEmail: email })
      .then(response => {
        if (response.status === 200) {
          alert('이메일이 성공적으로 저장되었습니다.');
          // 저장 후 로그인 처리 및 메인 페이지로 리다이렉트
          localStorage.setItem('jwtToken', response.data.jwtToken);
          navigate('/');
        }
      })
      .catch(error => {
        console.error('이메일 저장 실패: ', error.response ? error.response.data : error.message);
        alert('이메일 저장에 실패했습니다.');
      });
  };

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
