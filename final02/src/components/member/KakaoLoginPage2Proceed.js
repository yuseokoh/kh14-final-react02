import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { useSearchParams } from "react-router-dom";

const KakaoLoginPage2Proceed = ()=>{
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [error, setError] = useState(false);
    const [sent, setSent] = useState(false);

    const [certEmail, setCertEmail] = useState("");
    const [certNumber, setCertNumber] = useState("");
    const [certEmailValid, setCertEmailValid] = useState(false);
    const [member, setMember] = useState(null);
    const [kakaoId, setKakaoId] = useState("");

    useEffect(()=>{
        const code = searchParams.get("code");
        if(code) {
            sendLoginRequestToServer(code);
        }
    }, []);

    const sendLoginRequestToServer = useCallback(async (code)=>{
        try {
            const resp = await axios.get(`/kakao2/login/${code}`);
            //resp에 KakaoId만 들어있는 객체가 오면 신규가입
            //전부 다 정보가 차있으면 기존회원
            const member = resp.data;
            if(member.memberId) {
                //(로그인 성공) 리코일처리 + 메인페이지 이동
                navigate("/");
            }
            else {
                //(신규 가입) 이메일 인증
                setKakaoId(member.kakaoId);
            }
            setError(false);
        }
        catch(e) {
            setError(true);
        }
    }, []);

    const sendEmailValidRequest = useCallback(async ()=>{
        if(certEmail.length === 0) return;

        setSent(false);

        await axios.post("/kakao2/email/send", {
            certEmail:certEmail
        });

        setSent(true);
    }, [certEmail]);

    const sendEmailCheckRequest = useCallback(async ()=>{
        if(certNumber.length === 0) return;

        const resp = await axios.post("/kakao2/email/check", {
            certEmail : certEmail, 
            certNumber : certNumber
        });

        setCertEmailValid(resp.data.valid);
        if(resp.data.member) {//member가 있으면(기존회원)
            setMember(resp.data.member);
        }
    }, [certEmail, certNumber]);
    
    if(error) {
        return <Navigate to="/member/KakaoLoginPage2"/>;
    }

    return (<>
        <h1>2단계 : 이메일 인증</h1>

        <input type="text" value={certEmail} onChange={e=>setCertEmail(e.target.value)}/>
        <button onClick={sendEmailValidRequest}>보내기</button>

        {sent && (<>
        <input type="text" value={certNumber} onChange={e=>setCertNumber(e.target.value)}/>
        <button onClick={sendEmailCheckRequest}>인증하기</button>
        </>)}

        {/* 신규 회원 가입 안내 */}
        {certEmailValid && (<>
            {member === null ? (
                <h2>가입된 정보가 없어서 신규 가입하세요</h2>
            ) : (<>
                <h2>이미 가입된 아이디가 있습니다</h2>
                <p>아이디 : {member.memberId}</p>

                연동하실래요?
            </>)}
        </>)}


    </>);
};

export default KakaoLoginPage2Proceed;