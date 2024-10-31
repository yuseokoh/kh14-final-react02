import { useCallback, useEffect, useMemo, useState } from "react";
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

    const navigate = useNavigate();


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


    const loadImage = useCallback(async (memberId) => {
        try {
            const resp = await axios.get(`/member/image/${memberId}`);
            const { attachment } = resp.data;

            if (attachment) {
                // attachmentNo를 기반으로 이미지 URL 생성
                const imageUrl = `/member/download/${attachment}`;
                setImage(imageUrl); // 이미지 URL 설정
            } else {
                setImage(null); // attachmentNo가 없을 경우 처리 (예: 기본 이미지 설정)
            }
        } catch (error) {
            console.error("Error loading image:", error);
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
                <div className="col-3">레벨</div>
                <div className="col-3">
                    {(() => {
                        let levelText = "";
                        switch (true) {
                            case member.memberPoint >= 20000:
                                levelText = "challenger";
                                break;
                            case member.memberPoint >= 10000:
                                levelText = "master";
                                break;
                            case member.memberPoint >= 5000:
                                levelText = "diamond";
                                break;
                            case member.memberPoint >= 2000:
                                levelText = "platinum";
                                break;
                            case member.memberPoint >= 1000:
                                levelText = "Gold";
                                break;
                            case member.memberPoint >= 500:
                                levelText = "Silver";
                                break;
                            case member.memberPoint >= 100:
                                levelText = "Bronze";
                                break;
                            default:
                                levelText = "iron";
                        }
                        return levelText;
                    })()}
                </div>
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
