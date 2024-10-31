import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const MemberEdit = () => {
    // 파라미터 추출
    const { memberId } = useParams();

    // 네비게이터
    const navigate = useNavigate();

    // state
    const [member, setMember] = useState(null);

    // 이미지 업로드 상태 추가
    const [files, setFiles] = useState([]);

    // effect
    useEffect(() => {
        loadMember();
    }, []);

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        setFiles([...e.target.files]);
    };

    // member 정보 로드
    const loadMember = useCallback(async () => {
        try {
            const resp = await axios.get(`http://localhost:8080/member/${memberId}`);
            setMember(resp.data);
        } catch (e) {
            setMember(null);
        }
    }, [memberId]);

    const changeMember = useCallback(e => {
        setMember({
            ...member,
            [e.target.name]: e.target.value
        });
    }, [member]);

    // 회원 정보와 함께 이미지 업데이트
    const updateMember = useCallback(async () => {
        try {
            const formData = new FormData();

            // 회원 정보를 JSON 문자열로 변환하여 추가
            formData.append('member', new Blob([JSON.stringify(member)], {
                type: 'application/json'
            }));

            // 이미지 파일들 추가
            files.forEach(file => {
                formData.append('files', file);
            });

            // 한 번의 요청으로 회원 정보와 이미지 모두 전송
            await axios.put("http://localhost:8080/member/edit", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            navigate("/member/mypage/" + memberId);
        } catch (error) {
            console.error("수정 실패:", error.response ? error.response.data : error.message);
            alert("수정에 실패했습니다");
        }
    }, [member, files, memberId]);

    // 이미지 URL 생성 시 옵셔널 체이닝으로 안정성 강화
    const imageUrl = member?.attachment 
        ? `http://localhost:8080/member/download/${member.attachment}`
        : '/default-profile.png';

    return (member !== null ? (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src={imageUrl}
                    alt="Profile"
                    style={{ width: '100px', height: '100px', borderRadius: '50%', marginRight: '10px' }}
                />
                <h1>{`${member?.memberId || ''}의 정보수정`}</h1>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <label>프로필 이미지</label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="form-control"
                        onChange={handleFileChange}
                    />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <label>닉네임</label>
                    <input type="text" name="memberNickname" className="form-control"
                        value={member?.memberNickname || ''} onChange={changeMember} />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <label>이메일</label>
                    <input type="email" name="memberEmail" className="form-control"
                        value={member?.memberEmail || ''} onChange={changeMember} />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <label>생년월일</label>
                    <input type="date" name="memberBirth" className="form-control"
                        value={member?.memberBirth || ''} onChange={changeMember} />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <label>전화번호</label>
                    <input type="text" name="memberContact" className="form-control"
                        value={member?.memberContact || ''} onChange={changeMember} />
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <label>주소</label>
                    <input type="text" name="memberAddress1" className="form-control"
                        value={member?.memberAddress1 || ''} onChange={changeMember} />
                    <input type="text" name="memberAddress2" className="form-control mt-2"
                        value={member?.memberAddress2 || ''} onChange={changeMember} />
                </div>
            </div>

            {/* 숨겨진 필드들 */}
            <input type="hidden" name="memberId" value={member?.memberId || ''} />
            <input type="hidden" name="memberPw" value={member?.memberPw || ''} />
            <input type="hidden" name="memberLogin" value={member?.memberLogin || ''} />
            <input type="hidden" name="memberJoin" value={member?.memberJoin || ''} />
            <input type="hidden" name="memberLogout" value={member?.memberLogout || ''} />
            <input type="hidden" name="memberLevel" value={member?.memberLevel || ''} />
            <input type="hidden" name="verificationToken" value={member?.verificationToken || ''} />
            <input type="hidden" name="emailVerified" value={member?.emailVerified || ''} />
            <input type="hidden" name="memberPoint" value={member?.memberPoint || ''} />
            <input type="hidden" name="kakaoUserId" value={member?.kakaoUserId || ''} />

            <div className="row mt-4">
                <div className="col text-center">
                    <button type="button" className="btn btn-lg btn-success"
                        onClick={updateMember}>수정</button>
                </div>
            </div>
        </>
    ) : (<></>));
};

export default MemberEdit;
