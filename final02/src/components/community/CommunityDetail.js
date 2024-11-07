import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { throttle } from "lodash";
import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import moment from 'moment';
import 'moment/locale/ko';
import momentTimezone from 'moment-timezone';
import { toast, ToastContainer } from "react-toastify";
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";
import { useRecoilValue } from "recoil";
import './CommunityDetail.css'; 



//시간
moment.locale("ko");
//등록시간나오는거
// const formatDate = (dateString, isEdited = false) => {
//     const date = moment(dateString).tz("Asia/Seoul");
//     const formatForCreated = "MM.DD. HH:mm"; // 작성 시간 형식
//     const formatForEdited = "YY.MM.DD. HH:mm"; // 수정 시간 형식
//     return isEdited ? `${date.format(formatForEdited)} (수정됨)` : date.format(formatForCreated);
// };
const formatDate = (dateString, isEdited = false) => {
    const date = moment(dateString).tz("Asia/Seoul");
    return isEdited ? `${date.format("YY.MM.DD. HH:mm")} (수정됨)` : date.format("MM.DD. HH:mm");
};

const CommunityDetail = () => {
    const { communityNo } = useParams();
    const navigate = useNavigate();

    const memberId = useRecoilValue(memberIdState); // 로그인한 회원의 ID
    const isLoggedIn = useRecoilValue(loginState); // 로그인 여부

    const [community, setCommunity] = useState(null);//------이거
    
    const [communityImageList, setCommunityImageList] = useState([]); // 이미지 리스트 상태 추가
    const [load, setLoad] = useState(false);
    const [key, setKey] = useState(0); // 새로고침 없이 리렌더링용 key-----------

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

    
    // 초기데이터
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
            window.location.reload(); // 페이지 전체 새로고침
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
            loadReply(1); // 댓글 목록을 다시 로드하여 변경 사항 반영
            setKey(prevKey => prevKey + 1); // 새로고침 없이 리렌더링
            // window.location.reload(); // 페이지 전체 새로고침
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
            window.location.reload(); // 페이지 전체 새로고침
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
    //     await axios.delete(`/community/${communityNo}`);
    //     navigate("/community/list");
    // }, [communityNo, navigate]);
    try {
        await axios.delete(`/community/${communityNo}`);
        toast.success("게시글이 삭제되었습니다.", { position: "top-center", autoClose: 3000 });
        navigate("/community/list");
    } catch (error) {
        console.error("Failed to delete community:", error);
    }
}, [communityNo, navigate]);

// const updateCommunity = useCallback(() => {
//     toast.success("게시글이 수정되었습니다.", { position: "top-center", autoClose: 3000 });
//     navigate(`/community/edit/${communityNo}`);
// }, [communityNo, navigate]);


    

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
        <div key={key} className="kjh99detail-container">
    {/* 제목 */}
    <div className="kjh99row">
        <div className="kjh99col-title">제목</div>
        <div className="kjh99col-content">{community.communityTitle}</div>
        <div className="kjh99col-time">
            {community.communityUtime 
                ? formatDate(community.communityUtime, true) 
                : formatDate(community.communityWtime)}
        </div>
    </div>

    {/* 작성자, 카테고리, 내용 */}
    <div className="kjh99row">
        <div className="kjh99col-title">작성자</div>
        <div className="kjh99col-content">{community.communityWriter}</div>
    </div>
    <div className="kjh99row">
        <div className="kjh99col-title">카테고리</div>
        <div className="kjh99col-content">{community.communityCategory}</div>
    </div>
    <div className="kjh99row">
        <div className="kjh99col-title">내용</div>
        <div className="kjh99col-content-with-image"></div>
        <div className="kjh99col-content">{community.communityContent}</div>
    </div>

    {/* 이미지 표시 영역 */}
    {communityImageList.length > 0 && (
        <div className="kjh99image-section">
            {communityImageList.map((image) => (
                <img
                    key={image.attachmentNo}
                    src={`http://localhost:8080/community/download/${image.attachmentNo}`}
                    alt={`Community Image ${image.attachmentNo}`}
                    className="kjh99community-image"
                />
            ))}
        </div>
    )}

    {/* 버튼 섹션 */}
    <div className="kjh99button-section">
        <button className="kjh99button kjh99list-button" onClick={() => navigate("/community/list")}>목록</button>
        {community && community.communityWriter === memberId && (
            <>
                <button className="kjh99button kjh99edit-button" onClick={() => navigate(`/community/edit/${communityNo}`)}>수정하기</button>
                <button className="kjh99button kjh99delete-button" onClick={deleteCommunity}>삭제하기</button>
            </>
        )}
    </div>

    {/* 댓글 작성 및 좋아요 / 싫어요 버튼 */}
    <div className="kjh99reply-section">
        <input type="text" name="replyContent" className="kjh99reply-input"
            value={replyInput} onChange={e => setReplyInput(e.target.value)} />
        <button className="kjh99button kjh99reply-button" onClick={insertReply}>작성하기</button>
        <button
            className={`kjh99button ${isLiked ? "kjh99like-button-active" : "kjh99like-button"}`}
            onClick={handleLike}
        >
            좋아요 {likeCount}
        </button>
        <button
            className={`kjh99button ${isDisliked ? "kjh99dislike-button-active" : "kjh99dislike-button"}`}
            onClick={handleDislike}
        >
            싫어요 {dislikeCount}
        </button>
    </div>

    {/* 댓글 리스트 */}
    {result.replyList.map((reply, index) => (
        <div className="kjh99reply-container" key={`${reply.replyNo}-${index}`}>
            <div className="kjh99reply-writer">{reply.replyWriter}</div>
            <div className="kjh99reply-time">
                {reply.replyUtime 
                    ? formatDate(reply.replyUtime, true) 
                    : formatDate(reply.replyWtime)}
            </div>
            <div className="kjh99reply-content">
                {replyEditId === reply.replyNo ? (
                    <input
                        type="text"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="kjh99reply-edit-input"
                    />
                ) : (
                    reply.replyContent
                )}
            </div>
            {reply.replyWriter === memberId && (
                <div className="kjh99reply-buttons">
                    <button className="kjh99button kjh99delete-button" onClick={() => deleteReply(reply.replyNo)}>삭제</button>
                    {replyEditId === reply.replyNo ? (
                        <button className="kjh99button kjh99confirm-button" onClick={() => updateReply(reply.replyNo)}>완료</button>
                    ) : (
                        <button className="kjh99button kjh99edit-button" onClick={() => { setReplyEditId(reply.replyNo); setEditedContent(reply.replyContent); }}>수정</button>
                    )}
                </div>
            )}
        </div>
    ))}
</div>
    );
};

export default CommunityDetail;