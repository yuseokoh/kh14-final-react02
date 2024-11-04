import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { throttle } from "lodash";
import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import moment from 'moment';
import 'moment/locale/ko';
import momentTimezone from 'moment-timezone';

//시간
moment.locale("ko");

const formatDate = (dateString, isEdited = false) => {
    const date = moment(dateString).tz("Asia/Seoul");
    const formatForCreated = "MM.DD. HH:mm"; // 작성 시간 형식
    const formatForEdited = "YY.MM.DD. HH:mm"; // 수정 시간 형식
    return isEdited ? `${date.format(formatForEdited)} (수정됨)` : date.format(formatForCreated);
};

const CommunityDetail = () => {
    const { communityNo } = useParams();
    const user = "";
    const navigate = useNavigate();

    const [community, setCommunity] = useState(null);
    const [communityImageList, setCommunityImageList] = useState([]); // 이미지 리스트 상태 추가
    const [load, setLoad] = useState(false);
    const [key, setKey] = useState(0); // 새로고침 없이 리렌더링용 key

    const [replyInput, setReplyInput] = useState("");
    const [replyEditId, setReplyEditId] = useState(null);
    const [editedContent, setEditedContent] = useState("");
    const [likeCount, setLikeCount] = useState(0);
    const [dislikeCount, setDislikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);

    const [result, setResult] = useState({
        count: 0,
        last: false,
        replyList: []
    });

    const loading = useRef(false);
    const [page, setPage] = useState(1);
    const size = 10;

    // 제목 영역을 참조하는 ref 생성
    const titleRef = useRef(null);

    
    // Load community, initial replies, reactions, and images on component mount
    useEffect(() => {
        loadCommunity();
        loadCommunityImages(); // 이미지 불러오기 호출
        loadReply(1);
        loadLikesDislikes();
    }, [communityNo]);

    //상단으로 올리게하는 코드
    useEffect(() => {
        if (titleRef.current) {
            titleRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [load,community]);

    const loadCommunityImages = useCallback(async () => {
        try {
            const response = await axios.get(`/community/image/${communityNo}`);
            setCommunityImageList(response.data);
        } catch (error) {
            console.error("Failed to load community images:", error);
        }
    }, [communityNo]);

    const loadLikesDislikes = useCallback(async () => {
        try {
            const response = await axios.get(`/community/reactions/count?communityNo=${communityNo}`);
            setLikeCount(response.data.likeCount);
            setDislikeCount(response.data.dislikeCount);
        } catch (error) {
            console.error("Failed to load like/dislike count:", error);
        }
    }, [communityNo]);

    const toggleReaction = async (reactionType) => {
        try {
            const response = await axios.post(`/community/reactions/toggle`, null, {
                params: {
                    communityNo: communityNo,
                    reactionType: reactionType
                }
            });

            setLikeCount(response.data.likeCount);
            setDislikeCount(response.data.dislikeCount);
            setIsLiked(response.data.isLiked);
            setIsDisliked(response.data.isDisliked);
            setKey(prevKey => prevKey + 1); // 새로고침 없이 리렌더링
        } catch (error) {
            console.error("Failed to toggle reaction:", error);
        }
    };

    const handleLike = () => toggleReaction("L");
    const handleDislike = () => toggleReaction("U");

    const loadReply = useCallback(async (newPage) => {
        if (loading.current || result.last) return;
        loading.current = true;

        try {
            const response = await axios.post("/reply/list", {
                replyOrigin: communityNo,
                beginRow: (newPage - 1) * size + 1,
                endRow: newPage * size
            });

            const newReplies = response.data.replyList.filter(
                newReply => !result.replyList.some(existingReply => existingReply.replyNo === newReply.replyNo)
            );

            setResult((prevResult) => ({
                count: response.data.count,
                last: response.data.last,
                replyList: newPage === 1 
                    ? newReplies
                    : [...prevResult.replyList, ...newReplies]
            }));
            setPage(newPage);
        } catch (error) {
            console.error("Failed to load replies:", error);
        } finally {
            loading.current = false;
        }
    }, [communityNo, size, result.last, result.replyList]);

    const insertReply = useCallback(async (e) => {
        e.preventDefault();
        if (!replyInput) return;
        
        try {
            await axios.post(`/reply/insert/${communityNo}`, { replyContent: replyInput });
            setReplyInput("");
            loadReply(1); // 필요한 경우에만 리플 로드
            setKey(prevKey => prevKey + 1); // 새로고침 없이 리렌더링
        } catch (error) {
            console.error("Failed to insert reply:", error);
        }
    }, [replyInput, communityNo, loadReply]);

    const deleteReply = useCallback(async (replyNo) => {
        try {
            await axios.delete(`/reply/${replyNo}`);
            setResult((prevResult) => ({
                ...prevResult,
                replyList: prevResult.replyList.filter(reply => reply.replyNo !== replyNo),
                count: prevResult.count - 1
            }));
            setKey(prevKey => prevKey + 1); // 새로고침 없이 리렌더링
        } catch (error) {
            console.error("Failed to delete reply:", error);
        }
    }, []);

    const updateReply = useCallback(async (replyNo) => {
        if (!editedContent) return;
        

        try {
            await axios.put(`/reply/${replyNo}`, { replyContent: editedContent });
            setReplyEditId(null);
            setEditedContent("");
            loadReply(1);
            setKey(prevKey => prevKey + 1); // 새로고침 없이 리렌더링
        } catch (error) {
            console.error("Failed to update reply:", error);
        }
    }, [editedContent, loadReply]);

    const loadCommunity = useCallback(async () => {
        try {
            const resp = await axios.get(`/community/${communityNo}`);
            setCommunity(resp.data);
        } catch (e) {
            setCommunity(null);
        }
        setLoad(true);
    }, [communityNo]);

    const deleteCommunity = useCallback(async () => {
        await axios.delete(`/community/${communityNo}`);
        navigate("/community/list");
    }, [communityNo, navigate]);

    

    useEffect(() => {
        const handleScroll = throttle(() => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercent = (scrollTop / windowHeight) * 100;
            if (scrollPercent > 70 && !loading.current && !result.last) {
                loadReply(page + 1);
            }
        }, 300);

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page, result.last, loadReply]);

    if (!load) return <div>Loading...</div>;
    if (community === null) return <Navigate to="/notFound" />;

    return (
        <div key={key}>
            <Jumbotron title={`${communityNo}번 글 상세정보`} />
            <div className="row mt-4" ref={titleRef}>
                <div className="col-sm-3">제목</div>
                <div className="col-sm-7">{community.communityTitle}</div>
                <div className="col-sm-2 text-end">
                    <span>
                        {community.communityUtime 
                            ? formatDate(community.communityUtime, true) 
                            : formatDate(community.communityWtime)}
                    </span>
                    </div>
            </div>

            

            <div className="row mt-4" ref={titleRef}>
                <div className="col-sm-3">제목</div>
                <div className="col-sm-9">{community.communityTitle}</div>
            </div>
            <div className="row mt-4">
                <div className="col-sm-3">작성자</div>
                <div className="col-sm-9">{community.communityWriter}</div>
            </div>
            <div className="row mt-4">
                <div className="col-sm-3">상태</div>
                <div className="col-sm-9">{community.communityState}</div>
            </div>
            <div className="row mt-4">
                <div className="col-sm-3">카테고리</div>
                <div className="col-sm-9">{community.communityCategory}</div>
            </div>
            <div className="row mt-4">
                <div className="col-sm-3">내용</div>
                <div className="col-sm-9">{community.communityContent}</div>
            </div>

            {/* 이미지 표시 영역 */}
            {communityImageList.length > 0 && (
    <div className="row mt-4">
        <div className="col-sm-3">첨부 이미지</div>
        <div className="col-sm-9">
            {communityImageList.map((image) => (
                <img
                    key={image.attachmentNo}
                    src={`http://localhost:8080/community/download/${image.attachmentNo}`} // 서버의 URL을 명시적으로 포함
                    alt={`Community Image ${image.attachmentNo}`}
                    style={{ maxWidth: "100%", marginBottom: "10px" }}
                />
            ))}
        </div>
    </div>
)}

            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-secondary ms-2" onClick={() => navigate("/community/list")}>목록</button>
                    <button className="btn btn-warning ms-2" onClick={() => navigate(`/community/edit/${communityNo}`)}>수정하기</button>
                    <button className="btn btn-danger ms-2" onClick={deleteCommunity}>삭제하기</button>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <input type="text" name="replyContent" className="form-control"
                        value={replyInput} onChange={e => setReplyInput(e.target.value)} />
                    <button className="btn btn-success placeholder col-2 ms-2" onClick={insertReply}>작성하기</button>
                    <button
                        className={`btn ms-2 ${isLiked ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={handleLike}
                    >
                        좋아요 {likeCount}
                    </button>
                    <button
                        className={`btn ms-2 ${isDisliked ? "btn-danger" : "btn-outline-danger"}`}
                        onClick={handleDislike}
                    >
                        싫어요 {dislikeCount}
                    </button>
                </div>
            </div>

            {result.replyList.map((reply, index) => (
                <div className="row mt-4" key={`${reply.replyNo}-${index}`} style={{ position: 'relative' }}>
                    <div className="col">
                        <div className="row">
                            <div className="col-3">작성자</div>
                            <div className="col-9">{reply.replyWriter}</div>
                        </div>
                        <div className="row">
                            <div className="col-3">작성시간</div>
                            <div className="col-9">
                                {/* {reply.replyWtime} {reply.replyUtime ? `(${reply.replyUtime} 수정됨)` : ""} */}
                                {reply.replyUtime 
                                    ? formatDate(reply.replyUtime, true) 
                                    : formatDate(reply.replyWtime)}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-3">작성내용</div>
                            <div className="col-9">
                                {replyEditId === reply.replyNo ? (
                                    <input
                                        type="text"
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="form-control"
                                    />
                                ) : (
                                    reply.replyContent
                                )}
                            </div>
                        </div>
                        {reply.replyWriter === user && (
                            <>
                                <button
                                    onClick={() => deleteReply(reply.replyNo)}
                                    className="btn btn-danger"
                                    style={{ position: 'absolute', top: '10px', right: '10px' }}
                                >
                                    삭제
                                </button>
                                {replyEditId === reply.replyNo ? (
                                    <button
                                        onClick={() => updateReply(reply.replyNo)}
                                        className="btn btn-primary"
                                        style={{ position: 'absolute', top: '10px', right: '80px' }}
                                    >
                                        완료
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => { setReplyEditId(reply.replyNo); setEditedContent(reply.replyContent); }}
                                        className="btn btn-secondary"
                                        style={{ position: 'absolute', top: '10px', right: '80px' }}
                                    >
                                        수정
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CommunityDetail;
