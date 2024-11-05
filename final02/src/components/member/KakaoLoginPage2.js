import axios from "axios";
import { useCallback, useEffect } from "react";
import { useParams } from "react-router";

const REST_API_KEY = "e027bcf677db65dbc9a5954313eb0a3f";
const REDIRECT_URI = "http://localhost:3000/member/KakaoLoginPage2Proceed";

const KakaoLoginPage2 = ()=>{
    const moveKakaoLoginPage = useCallback(()=>{
        window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    }, []);
    return (<>
        <h1>카카오로그인 2</h1>

        <button className="btn btn-primary" onClick={moveKakaoLoginPage}>로그인하기</button>
    </>);
};

export default KakaoLoginPage2;