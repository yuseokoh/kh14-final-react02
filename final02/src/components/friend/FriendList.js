import { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
  loginState,
  memberIdState,
  memberLoadingState,
  receiverIdState,
} from "../../utils/recoil";
import axios from "axios";
import { useNavigate, useParams } from "react-router";
import { NavLink } from "react-router-dom";
import { MdPersonAddAlt1 } from "react-icons/md";


const FriendList = () => {
  //navigate
  const navigate = useNavigate();

  //state
  const [receiverId, setReceiverId] = useState([]);
  const [friendList, setFriendList] = useState([]); //친구 목록
  const [keyword, setKeyword] = useState("");
  const [open, setOpen] = useState(false);
  const [roomList, setRoomList] = useState([]);
  const [memberJoin, setMemberJoin] = useState([
    {
      roomNo: null,
      roomName: null,
      join: null,
    },
  ]);

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
    if (!memberId || memberLoading === false) return;
    loadFriendList();
    loadRoomList();
    checkMemberJoin();
  }, [memberLoading]);

  //callback

  const chatClick = useCallback(
    (friend) => {
      if (memberId === null) return;
      console.log("friend : ", friend);
      const targetId =
        memberId === friend.friendTo ? friend.friendFrom : friend.friendTo;
      setReceiverId(targetId);
      if (targetId === null) return;
      createChatRoom(friend);
    },
    [memberId]
  );

  const loadFriendList = useCallback(async () => {
    const resp = await axios.get("/friend/" + memberId);
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

  const deleteFriend = useCallback(async (target) => {
    if (!memberId || memberLoading === false) return;
    const resp = await axios.delete(
      "/friend/" + target.friendFk
    );
    loadFriendList();
    const resp2 = await axios.delete("/room/"+target.friendFk);
  }, []);

  const loadRoomList = useCallback(async () => {
    const resp = await axios.get("/room/");
    setRoomList(resp.data);
  }, [roomList]);

  const viewProfile = useCallback(
    (friend) => {
      const targetId =
        memberId === friend.friendTo ? friend.friendFrom : friend.friendTo;
      navigate(`/member/profile/${targetId}`);
    },
    [memberId]
  );

  const createChatRoom = useCallback(
    async (friend) => {
      if (!memberId || memberLoading === false) return;
       try{
      const roomName = friend.friendFrom + ", " + friend.friendTo;
      console.log("friendFK" + friend.friendFk);
      const resp = await axios.post("/room/", {
        roomNo: friend.friendFk,
        roomName: roomName,
      });
      loadRoomList();
      await axios.post("/room/enter", { roomNo: friend.friendFk });
      checkMemberJoin();
      console.log("try : ");
      navigate(`/room-chat/${friend.friendFk}`);
    }
      catch {

        try{
            const resp = await axios.post("/room/enter", {
                roomNo: friend.friendFk,
            });
            loadRoomList();
            checkMemberJoin();
        } catch {
            loadRoomList();
            console.log("catch : ");
            navigate(`/room-chat/${friend.friendFk}`);
        }
        checkMemberJoin();
       }
       finally {
        loadRoomList();
        
        checkMemberJoin();
        console.log("finally : ");
        navigate(`/room-chat/${friend.friendFk}`);
       }
    },
    [memberJoin, memberLoading, memberId]
  );

  const checkMemberJoin = useCallback(async () => {
    const resp = await axios.get("/room/member");
    setMemberJoin(prev => ({ ...prev, ...resp.data }));
    console.log("join :", resp.data);
}, []);

  const enterRoom = useCallback(async (friend) => {
    // try {
      await axios.post("/room/enter", { roomNo: friend.friendFk });
    // } catch {
      //방으로 이동
    //   navigate(`/room-chat/${friend.friendFk}`);
    // }
  }, []);

  //memo
  const searchResult = useMemo(() => {
    if (keyword.length === 0) return [];

    return friendList.filter(
      (friend) =>
        friend.friendFrom.includes(keyword) || friend.friendTo.includes(keyword)
    );
  }, [keyword, friendList]);

  return (
    <>
      <div
        className="row"
        style={{ backgroundColor: "#141d29", minHeight: "100vh" }}
      >
        <div className="col-12">
          <div className="row mt-4 justify-content-center">
            <div className="col-6">
              <h3>친구 목록</h3>
            </div>
            <div className="col-6">
              <NavLink className="nav-link" to="/friend/request">
                <MdPersonAddAlt1 style={{ fontSize: "2em" }} />
              </NavLink>
            </div>
          </div>
          <div className="row mt-2 justify-content-center">
            <div className="col">
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
                  {searchResult.map((friend) => (
                    <li
                      key={friend.friendFk}
                      className="list-group-item"
                      onClick={(e) => selectKeyword(friend.friendFk)}
                    >
                      {memberId === friend.friendTo
                        ? friend.friendFrom
                        : friend.friendTo}
                      {/* {memberJoin.map((member) =>
                        member.join === "Y" ? ( */}
                          {/* <button
                            className="btn btn-success ms-4"
                            onClick={() => enterRoom(friend)}
                          >
                            채팅입장
                          </button> */}
                        {/* ) : ( */}
                          <button
                            className="btn btn-success ms-4"
                            onClick={() => chatClick(friend)}
                          >
                            채팅
                          </button>
                        {/* )
                      )} */}
                      <button
                        className="btn btn-secondary ms-4"
                        onClick={() => viewProfile(friend)}
                      >
                        프로필 보기
                      </button>
                      <button
                        className="btn btn-danger ms-4"
                        onClick={() => deleteFriend(friend)}
                      >
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="row mt-2 justify-content-center">
            <div className="col">
              {open === false && (
                <ul className="list-group">
                  {friendList.map((friend) => (
                    <li key={friend.friendFk} className="list-group-item">
                      {memberId === friend.friendTo
                        ? friend.friendFrom
                        : friend.friendTo}
                      {/* {memberJoin.map(member=>(
                                member.join === 'N' ? ( */}
                      <button
                        className="btn btn-success ms-4"
                        onClick={() => chatClick(friend)}
                      >
                        채팅
                      </button>
                      {/* ) : ( */}
                      {/* <button
                        className="btn btn-success ms-4"
                        onClick={() => enterRoom(friend)}
                      >
                        채팅입장
                      </button> */}
                      {/* )
                            ))} */}
                      <button
                        className="btn btn-secondary ms-4"
                        onClick={() => viewProfile(friend)}
                      >
                        프로필 보기
                      </button>
                      <button
                        className="btn btn-danger ms-4"
                        onClick={() => deleteFriend(friend)}
                      >
                        삭제
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FriendList;
