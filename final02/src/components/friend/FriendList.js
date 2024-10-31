import { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { loginState, memberIdState, memberLoadingState, receiverIdState } from "../../utils/recoil";
import axios from "axios";
import { useNavigate, useParams } from "react-router";

const FriendList = ()=>{
    //navigate
    const navigate = useNavigate();

    const setReceiverId = useSetRecoilState(receiverIdState);

    const chatClickFromId = (friend) => {
        setReceiverId(friend.friendFrom);
        navigate('/websocket');
    };
    const chatClickToId = (friend) => {
        setReceiverId(friend.friendTo);
        navigate('/websocket');
    };
    
    //state
    const [friendList, setFriendList] = useState([]);//친구 목록
    const [keyword, setKeyword] = useState("");
    const [open, setOpen] = useState(false);

    
    

    //recoil
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberLoading = useRecoilValue(memberLoadingState);

    //token
    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken")
                                        || window.sessionStorage.getItem("refreshToken");

    //effect
    useEffect(()=>{
        if(!memberId || memberLoading === false) return;
        loadFriendList();
    }, [memberLoading]);

    //callback
  
    
    const loadFriendList = useCallback(async ()=>{
        const resp = await axios.get("http://localhost:8080/friend/"+memberId);
        setFriendList(resp.data);
    }, [memberId]);

    const changeKeyword = useCallback(e=>{
        setKeyword(e.target.value);
        setOpen(e.target.value.length > 0);
    }, [keyword]);
    const selectKeyword = useCallback(text=>{
        setKeyword(text);
        setOpen(false);
    }, [keyword]);
    const deleteFriend = useCallback(async (target)=>{
        if(!memberId || memberLoading === false) return;
        const resp = await axios.delete("http://localhost:8080/friend/"+target.friendFk);
        loadFriendList();
      }, []);

    //memo
    const searchResult = useMemo(() => {
        if (keyword.length === 0) return [];
        
        return friendList.filter(friend => 
            (friend.friendFrom.includes(keyword) || friend.friendTo.includes(keyword))
        );
    }, [keyword, friendList]);

    return (<>
    <div className="row mt-4">
        <div className="col">
            <h3>친구 목록</h3>
        </div>
    </div>
    <div className="row mt-2">
        <div className="col">
            {/* 입력값 useMemo로 memberList에서 조회후 출력*/}
            <input type="text" className="form-control" placeholder="아이디" 
            value={keyword} onChange={changeKeyword}/> 
            {open === true && (
                <ul className="list-group">
                    {searchResult.map(friend=>(
                        <li key={friend.friendFk} className="list-group-item" 
                        onClick={e=>selectKeyword(friend.friendFk)}>
                            {memberId === friend.friendTo ? friend.friendFrom : friend.friendTo}
                            {memberId === friend.friendTo ? 
                            <button className="btn btn-success ms-4" onClick={()=> chatClickFromId(friend)}>채팅</button>
                             : <button className="btn btn-success ms-4" onClick={()=> chatClickToId(friend)}>채팅</button>}
                            <button className="btn btn-secondary ms-4">프로필 보기</button>
                            <button className="btn btn-danger ms-4" onClick={()=> deleteFriend(friend)}>삭제</button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>
    <div className="row mt-2">
        <div className="col">
    {open === false && (
            <ul className="list-group">
                {friendList.map(friend=>(
                    <li key={friend.friendFk} className="list-group-item">
                        {memberId === friend.friendTo ? friend.friendFrom : friend.friendTo}
                        {memberId === friend.friendTo ? 
                            <button className="btn btn-success ms-4" onClick={()=> chatClickFromId(friend)}>채팅</button>
                             : <button className="btn btn-success ms-4" onClick={()=> chatClickToId(friend)}>채팅</button>}
                        <button className="btn btn-secondary ms-4">프로필 보기</button>
                        <button className="btn btn-danger ms-4" onClick={()=> deleteFriend(friend)}>삭제</button>
                    </li>
                ))}
            </ul>
            )}
        </div>
    </div>

    </>);
};

export default FriendList;