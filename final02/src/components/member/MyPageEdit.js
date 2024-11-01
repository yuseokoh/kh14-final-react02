import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const MemberEdit = () => {
  // Extract parameter
  const { memberId } = useParams();

  // Navigator
  const navigate = useNavigate();

  // State
  const [member, setMember] = useState(null);
  const [files, setFiles] = useState([]);

  // Load member info on component mount
  useEffect(() => {
    loadMember();
  }, []);

  // File selection handler
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  // Load member information
  const loadMember = useCallback(async () => {
    try {
      const resp = await axios.get(`http://localhost:8080/member/${memberId}`);
      setMember(resp.data);
    } catch (e) {
      setMember(null);
    }
  }, [memberId]);

  // Update member state on input change
  const changeMember = useCallback((e) => {
    setMember({
      ...member,
      [e.target.name]: e.target.value,
    });
  }, [member]);

  // Update member info and upload images
  const updateMember = useCallback(async () => {
    try {
      const formData = new FormData();

      // Append member data as JSON
      formData.append(
        "member",
        new Blob([JSON.stringify(member)], {
          type: "application/json",
        })
      );

      // Append selected files
      files.forEach((file) => {
        formData.append("files", file);
      });

      // Send update request
      await axios.put("http://localhost:8080/member/edit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate(`/member/mypage/${memberId}`);
    } catch (error) {
      console.error("Update failed:", error.response ? error.response.data : error.message);
      alert("Update failed");
    }
  }, [member, files, memberId]);

  // Set image URL with optional chaining
  const imageUrl = member?.attachment
    ? `http://localhost:8080/member/download/${member.attachment}`
    : "/default-profile.png";

  return member ? (
    <>
      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={imageUrl}
          alt="Profile"
          style={{ width: "100px", height: "100px", borderRadius: "50%", marginRight: "10px" }}
        />
        <h1>{`${member.memberId}의 정보수정`}</h1>
      </div>

      <div className="row mt-4">
        <div className="col">
          <label>프로필 이미지</label>
          <input type="file" multiple accept="image/*" className="form-control" onChange={handleFileChange} />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col">
          <label>닉네임</label>
          <input
            type="text"
            name="memberNickname"
            className="form-control"
            value={member.memberNickname || ""}
            onChange={changeMember}
          />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col">
          <label>이메일</label>
          <input
            type="email"
            name="memberEmail"
            className="form-control"
            value={member.memberEmail || ""}
            onChange={changeMember}
          />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col">
          <label>생년월일</label>
          <input
            type="date"
            name="memberBirth"
            className="form-control"
            value={member.memberBirth || ""}
            onChange={changeMember}
          />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col">
          <label>전화번호</label>
          <input
            type="text"
            name="memberContact"
            className="form-control"
            value={member.memberContact || ""}
            onChange={changeMember}
          />
        </div>
      </div>

      <div className="row mt-4">
        <div className="col">
          <label>주소</label>
          <input
            type="text"
            name="memberAddress1"
            className="form-control"
            value={member.memberAddress1 || ""}
            onChange={changeMember}
          />
          <input
            type="text"
            name="memberAddress2"
            className="form-control mt-2"
            value={member.memberAddress2 || ""}
            onChange={changeMember}
          />
        </div>
      </div>

      {/* Hidden Fields */}
      <input type="hidden" name="memberId" value={member.memberId} />
      <input type="hidden" name="memberPw" value={member.memberPw} />
      <input type="hidden" name="memberLogin" value={member.memberLogin} />
      <input type="hidden" name="memberJoin" value={member.memberJoin} />
      <input type="hidden" name="memberLogout" value={member.memberLogout} />
      <input type="hidden" name="memberLevel" value={member.memberLevel} />
      <input type="hidden" name="verificationToken" value={member.verificationToken} />
      <input type="hidden" name="emailVerified" value={member.emailVerified} />
      <input type="number" name="memberPoint" value={member.memberPoint} />
      <input type="hidden" name="kakaoUserId" value={member.kakaoUserId} />

      <div className="row mt-4">
        <div className="col text-center">
          <button type="button" className="btn btn-lg btn-success" onClick={updateMember}>
            수정
          </button>
        </div>
      </div>
    </>
  ) : null;
};

export default MemberEdit;