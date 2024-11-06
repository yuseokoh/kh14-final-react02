import { useLocation, useNavigate, useParams } from "react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import {
  loginState,
  memberIdState,
  memberLoadingState,
} from "../../utils/recoil";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import axios from "axios";
import moment from "moment";

const Chat = () => {
  const { roomNo } = useParams();
  const navigate = useNavigate();

  //state
  const [input, setInput] = useState(""); //채팅 입력값
  const [messageList, setMessageList] = useState([]); //채팅 메세지
  const [userList, setUserList] = useState([]); //참가자 목록
  const [client, setClient] = useState(null); //웹소켓 통신 도구
  const [connect, setConnect] = useState(false); //연결 상태
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scrollLock, setScrollLock] = useState(false);
  const messageListRef = useRef(null);
  const loadMoreTrigger = useRef(null);
  const prevScrollHeightRef = useRef(0);

  //recoil
  const login = useRecoilValue(loginState);
  const memberId = useRecoilValue(memberIdState);
  const memberLoading = useRecoilValue(memberLoadingState);

  //token
  const accessToken = axios.defaults.headers.common["Authorization"];
  const refreshToken =
    window.localStorage.getItem("refreshToken") ||
    window.sessionStorage.getItem("refreshToken");

  const firstMessageNo = useMemo(() => {
    if (messageList.length === 0) return null;
    const message = messageList[0];
    return message.no || null;
  }, [messageList]);

  useEffect(() => {
    if(firstMessageNo !== null) return;
    setMore();
  }, [firstMessageNo]);
  

  useEffect(() => {
    if (messageListRef.current && !scrollLock) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messageList]);

  // 초기 로딩 시에도 스크롤을 최하단으로 설정
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, []);

  //effect
  const location = useLocation();
  useEffect(() => {
    if (memberLoading === false) return; //로딩이 완료되지 않았다면 중지

    //입장 가능한 상황인지 검사
    checkRoom();

    //웹소켓 연결
    const client = connectToServer(); //연결 시도 후 도구를 반환해서
    setClient(client); //state에 설정하고
    return () => {
      //clean up code//화면을 벗어나게 되면
      disconnectFromServer(client); //연결 종료하세요
    };
  }, [location.pathname, memberLoading]);

  //callback
  const connectToServer = useCallback(() => {
    //소켓 연결 생성
    const socket = new SockJS("http://localhost:8080/ws");
    //STOMP로 업그레이드(비회원이 없고 모두 회원)
    const client = new Client({
      webSocketFactory: () => socket, //연결에 사용할 소켓 설정
      connectHeaders: {
        //무조건 회원이므로 헤더를 설정
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      onConnect: () => {
        client.subscribe(`/private/chat/${roomNo}`, (message) => {
          const data = JSON.parse(message.body);
          setMessageList((prev) => [...prev, data]);
        });
        client.subscribe("/public/users", (message) => {
          const json = JSON.parse(message.body);
          setUserList(json);
        });
        client.subscribe(`/private/db/${roomNo}/${memberId}`, (message) => {
          const data = JSON.parse(message.body);
          setMessageList(data.messageList);
          //더보기 관련된 설정 추가
        });

        setConnect(true); //연결상태 갱신
      },
      onDisconnect: () => {
        setConnect(false); //연결상태 갱신
      },
      debug: (str) => {
        console.log(str);
      },
    });

    client.activate(); //client 활성화
    return client;
  }, [memberLoading]);

  const disconnectFromServer = useCallback((client) => {
    if (client) {
      //클라이언트가 null이 아니라면(존재한다면)
      client.deactivate();
    }
  }, []);

  const sendMessage = useCallback(() => {
    //차단
    if (client === null) return;
    if (connect === false) return;
    if (input.length === 0) return;

    client.publish({
      //전송
      destination: "/app/room/" + roomNo,
      headers: {
        accessToken: accessToken,
        refreshToken: refreshToken,
      },
      body: JSON.stringify({ content: input }),
    });
    setInput(""); //입력창 초기화
  }, [input, client, connect]);

  const checkRoom = useCallback(async () => {
    const resp = await axios.get("/room/check/" + roomNo);
    if (resp.data === false) {
      //replace는 기록에 남지 않도록 설정하는것(뒤로가기로 진입불가)
      navigate("/room", { replace: true });
    }
  }, [roomNo]);

  const loadMoreMessageList = useCallback(async () => {
    if (!firstMessageNo) return;
    if (loading) return;
  
    setLoading(true);
    setScrollLock(true); // 스크롤 잠금 활성화
  
    let currentScrollHeight = 0;
    if (messageListRef.current) {
      currentScrollHeight = messageListRef.current.scrollHeight;
    }
  
    try {
      const resp = await axios.get(`/room/more/${firstMessageNo}/${roomNo}`);
      setMessageList((prev) => [...resp.data.messageList, ...prev]);
      setMore(resp.data.last);
    } catch (error) {
      console.log("더보기 요청 중 오류 발생 : ", error);
    } finally {
      setLoading(false);
  
      if (messageListRef.current) {
        requestAnimationFrame(() => {
          if (messageListRef.current) {
            messageListRef.current.scrollTop =
              messageListRef.current.scrollHeight - currentScrollHeight;
          }
          setScrollLock(false); // 스크롤 잠금 해제
        });
      }
    }
  }, [firstMessageNo, more, loading]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && more) {
          loadMoreMessageList();
        }
      },
      {
        root: messageListRef.current,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (loadMoreTrigger.current) {
      observer.observe(loadMoreTrigger.current);
    }

    return () => {
      if (loadMoreTrigger.current) {
        observer.unobserve(loadMoreTrigger.current);
      }
    };
  }, [more, loadMoreMessageList]);

  //view
  return (
    <>
      <div
        className="container-fluid pt-4 pb-4"
        style={{ backgroundColor: "#141d29", minHeight: "100vh" }}
      >
        <div className="row d-flex justify-content-center">
          <div className="col-lg-10 col-md-12">
            <div className="row">
              {/* 사용자 목록 */}
              <div className="col-md-3 col-12 mb-4">
                <div
                  className="user-list-container p-3"
                  style={{
                    backgroundColor: "#1e293b",
                    borderRadius: "10px",
                    maxHeight: "600px",
                    overflowY: "auto",
                    color: "#ffffff",
                  }}
                >
                  <h5 className="text-center">참가자 목록</h5>
                  <ul className="list-group">
                    {userList.map((user, index) => (
                      <li
                        className="list-group-item bg-dark text-white"
                        style={{
                          borderRadius: "5px",
                          marginBottom: "5px",
                        }}
                        key={index}
                      >
                        {user === memberId ? `${user} (나)` : user}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 메세지 목록 */}
              <div className="col-md-9 col-12">
                <div
                  className="message-list-container"
                  style={{
                    backgroundColor: "#ffffff",
                    height: "600px", 
                    width: "800px", 
                    overflowY: "scroll",
                    borderRadius: "10px",
                    padding: "20px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                  ref={messageListRef}
                >
                  <div ref={loadMoreTrigger} style={{ height: "1px" }} />
                  <ul className="list-group">
                    {messageList.map((message, index) => (
                      <li
                        key={index}
                        className={`list-group-item border-0 ${
                          login && memberId === message.senderMemberId
                            ? "text-end bg-lightblue"
                            : "text-start bg-light"
                        }`}
                        style={{
                          marginBottom: "10px",
                          borderRadius: "15px",
                          padding: "15px",
                          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <div className="message-content">
                          {/* 발신자 정보 */}
                          {login && memberId !== message.senderMemberId && (
                            <h6 className="mb-1 text-primary">
                              {message.senderMemberId}{" "}
                              
                            </h6>
                          )}
                          {/* 사용자가 보낸 본문 */}
                          <p className="mb-2" style={{ fontSize: "1rem" }}>
                            {message.content}
                          </p>
                          {/* 시간 */}
                          <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                            {moment(message.time).format("a h:mm")}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 메세지 입력창 */}
                <div className="row mt-4">
                  <div className="col-9">
                    <div className="input-group">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyUp={(e) => e.key === "Enter" && sendMessage()}
                        className="form-control"
                        placeholder="메시지를 입력하세요..."
                      />
                      <button
                        className="btn btn-primary"
                        style={{ minWidth: "100px" }}
                        onClick={sendMessage}
                      >
                        보내기
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Chat;
