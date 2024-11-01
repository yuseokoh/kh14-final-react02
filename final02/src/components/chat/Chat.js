import { useLocation, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useCallback, useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import { loginState, memberIdState, memberLevelState, memberLoadingState } from "../../utils/recoil";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import moment from "moment";

const Chat = ()=> {
    const {roomNo} = useParams();
    const navigate = useNavigate();

    //state
    const [input, setInput] = useState("");//채팅 입력값
    const [messageList, setMessageList] = useState([]);//채팅 메세지
    const [userList, setUserList] = useState([]);//참가자 목록
    const [client, setClient] = useState(null);//웹소켓 통신 도구
    const [connect, setConnect] = useState(false);//연결 상태

    //recoil
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberLevel = useRecoilValue(memberLevelState);
    const memberLoading = useRecoilValue(memberLoadingState);

    //token
    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken")
                                    || window.sessionStorage.getItem("refreshToken");

    //effect
    const location = useLocation();
    useEffect(()=>{
        if(memberLoading === false) return;//로딩이 완료되지 않았다면 중지

        //입장 가능한 상황인지 검사
        checkRoom();

        //웹소켓 연결
        const client = connectToServer();//연결 시도 후 도구를 반환해서
        setClient(client);//state에 설정하고
        return ()=>{//clean up code//화면을 벗어나게 되면
            disconnectFromServer(client);//연결 종료하세요
        };
    }, [location.pathname, memberLoading]);

    //callback
    const connectToServer = useCallback(()=>{
        //소켓 연결 생성
        const socket = new SockJS(process.env.REACT_APP_BASE_URL+"/ws");
        //STOMP로 업그레이드(비회원이 없고 모두 회원)
        const client = new Client({
            webSocketFactory:()=>socket,//연결에 사용할 소켓 설정
            connectHeaders:{//무조건 회원이므로 헤더를 설정
                accessToken : accessToken ,
                refreshToken : refreshToken
            },
            onConnect:()=>{
                client.subscribe(`/private/chat/${roomNo}`, (message)=>{
                    const data = JSON.parse(message.body);
                    setMessageList(prev=>[...prev, data]);
                });
                client.subscribe(`/private/user/${roomNo}`, (message)=>{});
                client.subscribe(`/private/dm/${roomNo}/${memberId}`, (message)=>{});
                client.subscribe(`/private/db/${roomNo}/${memberId}`, (message)=>{
                    const data = JSON.parse(message.body);
                    setMessageList(data.messageList);
                    //더보기 관련된 설정 추가
                });

                setConnect(true);//연결상태 갱신
            },
            onDisconnect:()=>{
                setConnect(false);//연결상태 갱신
            },
            debug:(str)=>{
                console.log(str);
            }
        });

        client.activate();//client 활성화
        return client;
    }, [memberLoading]);
    
    const disconnectFromServer = useCallback((client)=>{
        if(client) {//클라이언트가 null이 아니라면(존재한다면)
            client.deactivate();
        }
    }, []);

    const sendMessage = useCallback(()=>{
        //차단
        if(client === null) return;
        if(connect === false) return;
        if(input.length === 0) return;

        client.publish({//전송
            destination : "/app/room/"+roomNo,
            headers:{
                accessToken : accessToken,
                refreshToken : refreshToken
            },
            body: JSON.stringify({content : input})
        });
        setInput("");//입력창 초기화
    }, [input, client, connect]);

    const checkRoom = useCallback(async ()=>{
        const resp = await axios.get("/room/check/"+roomNo);
        if(resp.data === false) {
            //replace는 기록에 남지 않도록 설정하는것(뒤로가기로 진입불가)
            navigate("/room", {replace:true});
        }
    }, [roomNo]);

    //view
    return (<>
        <Jumbotron title={"방 제목"} content={"?번 채팅방"}/>

        {/* 메세지 입력창 */}
        <div className="row mt-4">
            <div className="col">
                <div className="input-group">
                    <input type="text" value={input}
                            onChange={e=>setInput(e.target.value)}
                            onKeyUp={e=>e.key === 'Enter' && sendMessage()}
                            className="form-control"/>
                    <button className="btn btn-primary">보내기</button>
                </div>
            </div>
        </div>


        <div className="row mt-4">
            {/* 사용자 목록 */}
            <div className="col-3">
                <ul className="list-group">
                    {userList.map((user, index)=>(
                    <li className="list-group-item" key={index}>
                        {user === memberId ? user + "(나)" : user}
                    </li>
                    ))}
                </ul>
            </div>

            {/* 메세지 목록 */}
            <div className="col-9">
                
                <ul className="list-group">
                    {messageList.map((message, index)=>(
                    <li className="list-group-item" key={index}>

                        {/* 일반 채팅일 경우(type === chat) */}
                        {message.type === "chat" && (
                        <div className="row">
                            <div className={`col-5${(login && memberId === message.senderMemberId) && ' offset-7'}`}>
                                {/* 발신자 정보 */}
                                {(login && memberId !== message.senderMemberId) && (
                                <h3>
                                    {message.senderMemberId}
                                    <small>
                                        ({message.senderMemberLevel})
                                    </small>
                                </h3>
                                )}
                                {/* 사용자가 보낸 본문 */}
                                <p>{message.content}</p>
                                {/* 시간 */}
                                <p className="text-muted">
                                    {moment(message.time).format("a h:mm")}
                                    {/* ({moment(message.time).fromNow()}) */}
                                </p>
                            </div>
                        </div>
                        )}
                        {/* DM인 경우(type === dm) */}
                        {message.type === "dm" && (
                        <div className="row">
                            <div className={`col-5${(login && memberId === message.senderMemberId) && ' offset-7'}`}>
                                {/* 수신자일 경우 ooo님으로부터 온 메세지 형태로 출력 */}
                                {(memberId === message.receiverMemberId) && (
                                <h3 className="text-danger">
                                    {message.senderMemberId} 님으로 부터 온 메세지
                                </h3>
                                )}
                                {/* 발신자일 경우 ooo님에게 보낸 메세지 형태로 출력 */}
                                {(memberId === message.senderMemberId) && (
                                <h3 className="text-danger">
                                    {message.receiverMemberId} 님에게 보낸 메세지
                                </h3>
                                )}
                                
                                {/* 사용자가 보낸 본문 */}
                                <p className="text-danger">{message.content}</p>
                                {/* 시간 */}
                                <p className="text-muted">
                                    {moment(message.time).format("a h:mm")}
                                    {/* ({moment(message.time).fromNow()}) */}
                                </p>
                            </div>
                        </div>
                        )}

                        {message.type === "system" && (<></>)}

                    </li>
                    ))}
                </ul>

            </div>
        </div>
    </>);
};


export default Chat;