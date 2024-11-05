import { useRecoilValue } from "recoil";
import { loginState, memberIdState, memberLoadingState, receiverIdState } from "../../utils/recoil";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import moment from "moment";
import "moment/locale/ko";

//websocket
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

moment.locale("ko"); 

const WebsocketClient = ()=>{

    //state
    const [messageList, setMessageList] = useState([]);
    const [input, setInput] = useState([]);
    const [more, setMore] = useState(false);
    
    //callback
    
    
    
    //state for websocket
    const [client, setClient] = useState(null);
    const [connect, setConnect] = useState(false);
    
    //recoil
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberLoading = useRecoilValue(memberLoadingState);
    const receiverId = useRecoilValue(receiverIdState);
    
    //token
    const accessToken = axios.defaults.headers.common["Authorization"];
    const refreshToken = window.localStorage.getItem("refreshToken")
    || window.sessionStorage.getItem("refreshToken");
    
    //memo
    const firstMessageNo = useMemo(()=>{
        if(messageList.length === 0) return null;
        const message = messageList[0];
        return message.no || null;
    }, [messageList]);
    
    //websocket connecting
    const location = useLocation();
    useEffect(()=>{
        if(!memberLoading) return;
        const client = connectToServer();
        return ()=> {
            disconnectFromServer(client);
        };
        
    }, [location.pathname, memberLoading]);

    //callback for websocket
    const connectToServer = useCallback(()=>{
        const socket = new SockJS("http://localhost:8080/ws");
        
        const client = new Client({
            webSocketFactory: ()=> socket,
            onConnect: ()=>{
                if(login === true){
                    client.subscribe("/public/chat/"+memberId, (message)=>{
                        const json = JSON.parse(message.body);
                        setMessageList(prev=>[...prev, json]);
                    });
                    client.subscribe("/public/db/"+memberId, (message)=>{
                        const json = JSON.parse(message.body);
                        setMessageList(json.messageList);
                        setMore(json.last === false);
                    });
                }
                else {
                    setConnect(false);
                }
                setConnect(true);
            },
            onDisconnect: ()=>{
                setConnect(false);
            },
        });
        if(login === true){
            client.connectHeaders = {
                accessToken: accessToken,
                refreshToken: refreshToken
            };
        }

        client.activate();
        setClient(client);
        }, [memberLoading]);

        const disconnectFromServer = useCallback((client)=>{
            if(client){
                client.deactivate();
            }
        }, []);

    //메세지 전송
    const sendMessage = useCallback(()=>{
        if(login === false) return;
        if(client === null) return;
        if(connect === false) return;
        if(input.length === 0) return;

        const json = {
            content: input
        };
        const message = {
            destination: "app/chat"+receiverId, 
            body: JSON.stringify(json), 
            headers: {
                accessToken : accessToken, 
                refreshToken : refreshToken
            }
        }
        client.publish(message);
        setInput("");
    }, [input, client, connect]);

    const loadMoreMessageList = useCallback(async ()=>{
        const resp = await axios.get("/message/more/"+firstMessageNo);
        setMore(resp.data.last === false);
    }, [messageList, firstMessageNo, more]);
    
    return (<>
    <div className="row pb-4" style={{ backgroundColor: "#141d29", minHeight: "100vh" }}>
    <div className="col">

    <div className="row mt-4 d-flex justify-content-center">
        <div className="col-6">
            <h3>friendId : {receiverId}</h3>
            <h3>memberId : {memberId}</h3>
        </div>
    </div>
    <div className="row mt-4 d-flex justify-content-center">
        <div className="col-3">
            <div className="input-group">
                <input type="text" className="form-control" value={input} onChange={e=>setInput(e.target.value)} 
                disabled={login === false}/>
                <button className="btn btn-success" disabled={login === false} onClick={sendMessage}>보내기</button>
            </div>
        </div>
    </div>
    {/* 메세지 목록 */}
    <div className="col-9">
            {/* 더보기 버튼 */}
            {more === true && (
                <button className="btn btn-outline-success w-100" 
                onClick={loadMoreMessageList}>
                    더보기
                </button>
            )}
          <ul className="list-group">
            {messageList.map((message, index) => (
                <li className="list-group-item" key={index}>
                {/* 일반 채팅일 경우(type === chat) */}
                  <div className="row">
                    <div
                      className={`col-5${
                          login &&
                        memberId === message.senderMemberId &&
                        " offset-7"
                    }`}
                    >
                      {/* 발신자 정보 */}
                      {login && memberId !== message.senderMemberId && (
                        <h3>
                          {message.senderMemberId}
                          <small>({message.senderMemberLevel})</small>
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
                

              </li>
            ))}
          </ul>
        </div>

            </div>
            </div>
    </>);
};

export default WebsocketClient;