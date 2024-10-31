import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRecoilValue } from 'recoil';
import { loginState, memberIdState } from "../../utils/recoil";
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
    // state
    const [member, setMember] = useState({});
    const navigate = useNavigate(); 

    // Recoil 상태 사용
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);

    // effect
    useEffect(() => {
        if (login && memberId) {
            loadMember(memberId);
        }
    }, [login, memberId]);

    // member 정보 로드
    const loadMember = useCallback(async (memberId) => {
        try {
            const resp = await axios.get(`http://localhost:8080/member/${memberId}`);
            setMember(resp.data);
        } catch (error) {
            console.error("Error loading member data:", error);
        }
    }, []);

    // 이미지 URL 생성
    const imageUrl = member.attachment 
        ? `http://localhost:8080/member/download/${member.attachment}`
        : '/default-profile.png';

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src={imageUrl}
                    alt="Profile"
                    style={{ width: '100px', height: '100px', borderRadius: '50%', marginRight: '10px' }}
                />
                <h1>{`${member?.memberId || ''} 님의 정보`}</h1>
            </div>

            <div className="row mt-4">
                <div className="col-3">닉네임</div>
                <div className="col-3">{member.memberNickname}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">전화번호</div>
                <div className="col-3">{member.memberContact}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">이메일</div>
                <div className="col-3">{member.memberEmail}</div>
            </div>
            <div className="row mt-4">
                <div className="col-3">생년월일</div>
                <div className="col-3">{member.memberBirth}</div>
            </div>
            
            <div className="row mt-4">
                <div className="col text-end">
                <button 
    className="btn btn-warning ms-2"
    onClick={() => {
        console.log(memberId); // memberId 값 확인
        // debugger;
        navigate(`/member/mypageedit/${memberId}`);
    }}
>
    수정하기
</button>

                        
                </div>
            </div>
        </>
    );
};

export default MyPage;
