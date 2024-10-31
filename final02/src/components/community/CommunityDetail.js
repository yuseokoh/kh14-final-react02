import axios from "axios";
import { useState, useEffect, useRef, useCallback } from "react";
import { throttle } from "lodash";
import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";

const CommunityDetail = () => {
    const { communityNo } = useParams();
    const user = "testuser123";
    const navigate = useNavigate();

    const [community, setCommunity] = useState(null);
    const [load, setLoad] = useState(false);

    const [replyInput, setReplyInput] = useState("");
    const [replyEditId, setReplyEditId] = useState(null);
    const [editedContent, setEditedContent] = useState("");
    const [result, setResult] = useState({
        count: 0,
        last: false,
        replyList: []
    });

    const loading = useRef(false);
    const [page, setPage] = useState(1);
    const size = 10;

    // 댓글 작성
    const insertReply = useCallback(async (e) => {
        e.preventDefault();
        if (!replyInput) return;
        await axios.post(`/reply/insert/${communityNo}`, { replyContent: replyInput });
        setReplyInput("");
        setResult({ count: 0, last: false, replyList: [] });  // 초기화
        setPage(1);  // 첫 페이지부터 다시 로드
        loadReplies(1);  // 댓글 목록 새로고침
    }, [replyInput, communityNo]);

    // 댓글 목록 불러오기
    const loadReplies = useCallback(async (newPage) => {
        if (loading.current || result.last) return;
    
        loading.current = true;
        const response = await axios.post("/reply/list", {
            replyOrigin: communityNo,
            beginRow: (newPage - 1) * size + 1,
            endRow: newPage * size
        });
        
        // replyNo를 기준으로 중복된 댓글을 걸러냄
        setResult((prevResult) => ({
            count: response.data.count,
            last: response.data.last,
            replyList: [
                ...prevResult.replyList,
                ...response.data.replyList.filter(
                    newReply => !prevResult.replyList.some(reply => reply.replyNo === newReply.replyNo)
                )
            ]
        }));
        
        setPage(newPage);
        loading.current = false;
    }, [communityNo, result.last]);

    // 댓글 삭제
    const deleteReply = useCallback(async (replyNo) => {
        try {
            await axios.delete(`/reply/${replyNo}`);
            setResult({ count: 0, last: false, replyList: [] });
            setPage(1);
            loadReplies(1);
        } catch (error) {
            console.error("삭제 요청 실패:", error);
        }
    }, [loadReplies]);

    // 댓글 수정
    const updateReply = useCallback(async (replyNo) => {
        if (!editedContent) return;
        await axios.put(`/reply/${replyNo}`, { replyContent: editedContent });
        setReplyEditId(null);
        setEditedContent("");
        setResult({ count: 0, last: false, replyList: [] });
        setPage(1);
        loadReplies(1);
    }, [editedContent, loadReplies]);
    // 초기 로드
    useEffect(() => {
        loadCommunity();
        loadReplies(1);
    }, [communityNo]);

    // 무한 스크롤
    useEffect(() => {
        const handleScroll = throttle(() => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollPercentage = (scrollTop / windowHeight) * 100;
            if(result.replyList === null) return;
            if (scrollPercentage > 70 && !loading.current && !result.last) {
                loadReplies(page + 1);
            }
        }, 300);

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [page, result.last, loadReplies]);
    

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
    }, [communityNo]);

    // 페이지 상태에 따른 렌더링
    if (!load) {
        return <div>로딩 중...</div>;
    }

    if (community === null) {
        return <Navigate to="/notFound" />;
    }

    return (
        <>
            <Jumbotron title={`${communityNo}번 글 상세정보`} />

            <div className="row mt-4">
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
                </div>
            </div>

            {result.replyList.map(reply => (
                <div className="row mt-4" key={reply.replyNo} style={{ position: 'relative' }}>
                    <div className="col">
                        <div className="row">
                            <div className="col-3">작성자</div>
                            <div className="col-9">{reply.replyWriter}</div>
                        </div>
                        <div className="row">
                            <div className="col-3">작성시간</div>
                            <div className="col-9">
                                {reply.replyWtime} {reply.replyUtime ? `(${reply.replyUtime} 수정됨)` : ""}
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
                                        onClick={() => setReplyEditId(reply.replyNo) || setEditedContent(reply.replyContent)}
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
        </>
    );
};

export default CommunityDetail;
