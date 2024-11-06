import { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import {
  loginState,
  memberIdState,
  memberLoadingState,
} from "../../utils/recoil";
import axios from "axios";

const FriendRequest = () => {
  //state
  const [requestToList, setRequestToList] = useState([]); //친구 요청 목록(발신)
  const [requestFromList, setRequestFromList] = useState([]); //친구 요청 목록(수신)
  const [memberList, setMemberList] = useState([]); //회원 목록
  const [friendList, setFriendList] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState([]);

 

  //recoil
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  const memberLoading = useRecoilValue(memberLoadingState);

  //token
  const accessToken = axios.defaults.headers.common["Authorization"];
  const refreshToken =
    window.localStorage.getItem("refreshToken") ||
    window.sessionStorage.getItem("refreshToken");

  //effect
  useEffect(() => {
    if(!memberId || memberLoading === false) return;
    loadMemberList();
    loadRequestToOther();
    loadRequestFromOther();
    loadFriendList();

  }, [memberId, memberLoading]);

  //callback
  const loadMemberList = useCallback(async () => {
    const resp = await axios.get("http://localhost:8080/friend/member");
    setMemberList(resp.data);
  }, []);

  const loadRequestToOther = useCallback(async ()=> {
    if(!memberId || memberLoading === false) return;
    const resp = await axios.get("http://localhost:8080/friend/request/"+memberId);
    setRequestToList(resp.data);
  }, [memberId]);
  const loadRequestFromOther = useCallback(async ()=>{
    if(!memberId || memberLoading === false) return;
    const resp = await axios.get("http://localhost:8080/friend/getRequest/"+memberId);
    setRequestFromList(resp.data);
  }, [memberId]);
  const loadFriendList = useCallback(async ()=>{
    if(!memberId || memberLoading === false) return;
    const resp = await axios.get("http://localhost:8080/friend/"+memberId);
    setFriendList(resp.data);
  }, [memberId]);

  const changeKeyword = useCallback(
    (e) => {
      setKeyword(e.target.value);
      setOpen(e.target.value.length > 0);
    },
    [keyword]
  );
  const selectKeyword = useCallback(
    (text) => {
      setKeyword(text);
      setOpen(false);
    },
    [keyword]
  );

  //이미 친구거나 요청 상태인지 확인
  const already = useCallback((memberId)=>{
    return (
      requestToList.some((request) => request.friendTo === memberId) || 
      requestFromList.some((request) => request.friendFrom === memberId) || 
      friendList.some((friend) => friend.friendFrom === memberId || friend.friendTo === memberId)
    );
  }, [requestToList, requestFromList, friendList]);
  
  //친구 요청
  const sendRequest = useCallback(async (target)=>{
    const resp = await axios.post("http://localhost:8080/friend/", { friendFrom: memberId, friendTo: target.memberId })
    setKeyword("");
    loadRequestToOther();
  }, [memberId]);
  //친구 수락
  const getRequest = useCallback(async (target)=>{
    const resp = await axios.put("http://localhost:8080/friend/"+target.friendFk);
    loadRequestToOther();
    loadRequestFromOther();
  }, []);
  //거절, 취소
  const deleteRequest = useCallback(async (target)=>{
    const resp = await axios.delete("http://localhost:8080/friend/"+target.friendFk);
    loadRequestToOther();
    loadRequestFromOther();
  }, []);

  //memo
  const searchResult = useMemo(() => {
    if (keyword.length === 0) return [];
    return memberList.filter((member) => member.memberId.includes(keyword));
  }, [keyword, memberList]);

  return (
    <>
    <div className="row pb-4" style={{ backgroundColor: "#141d29", minHeight: "100vh" }}>
      <div className="col">

      <div className="row mt-4 d-flex justify-content-center">
        <div className="col-6">
          <h2 style={{ backgroundColor: "#2c3e50"}}>친구 요청</h2>
        </div>
      </div>
      <div className="row mt-4 d-flex justify-content-center">
        <div className="col-6">
          <h3>회원 검색</h3>
        </div>
      </div>
      <div className="row mt-2 d-flex justify-content-center">
        <div className="col-6">
          {/* 입력값 useMemo로 memberList에서 조회후 출력*/}
          <input
            type="text"
            className="form-control"
            placeholder="아이디"
            value={keyword}
            onChange={changeKeyword}
            />
          {open === true && (
            <ul className="list-group">
              {searchResult.map((member) => (
                <li
                key={member.memberId}
                className="list-group-item"
                  onClick={(e) => selectKeyword(member.memberId)}
                  >
                  {member.memberId}
                  <button className="btn btn-success ms-4" onClick={()=> sendRequest(member)}
                    disabled={already(member.memberId)}>친구 추가</button>
                  <button className="btn btn-secondary ms-4">
                    프로필 보기
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="row mt-4 d-flex justify-content-center">
        <div className="col-6">
          <h3>보낸요청</h3>
        </div>
      </div>
      
      <div className="row mt-2 d-flex justify-content-center">
        <div className="col-6">
          <ul className="list-group">
            {requestToList.map((request)=>(
              <li key={request.friendFk} className="list-group-item">
               {request.friendTo}
                <button className="btn btn-danger ms-3" onClick={()=> deleteRequest(request)}>취소</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="row mt-2 d-flex justify-content-center">
        <div className="col-6">
          <h3>받은요청</h3>
        </div>
      </div>
      <div className="row mt-2 d-flex justify-content-center">
        <div className="col-6">
          <ul className="list-group">
            {requestFromList.map((request)=>(
              <li key={request.friendFk} className="list-group-item">
               {request.friendFrom}
                <button className="btn btn-success ms-3" onClick={()=> getRequest(request)}>수락</button>
                <button className="btn btn-danger ms-3" onClick={()=> deleteRequest(request)}>거절</button>
              </li>
            ))}
          </ul>
        </div>
      </div>

            {/* <button className="btn btn-success ms-3" onClick={()=> getRequest(request)}>수락</button> */}
            </div>
          </div>
    </>
  );
};
export default FriendRequest;
