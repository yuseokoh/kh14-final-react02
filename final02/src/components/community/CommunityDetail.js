import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useEffect, useState, useCallback } from 'react';
import axios from "axios";

const CommunityDetail = () => {
    const { communityNo } = useParams(); // URL 파라미터에서 communityNo 가져오기
    const navigate = useNavigate();

    // State
    const [community, setCommunity] = useState(null); // 게시글 정보 저장
    const [load, setLoad] = useState(false); // 로딩 상태
    const [comments, setComments] = useState([]); // 댓글 목록 저장
    const [newComment, setNewComment] = useState(''); // 새 댓글 입력 값
    const [editCommentId, setEditCommentId] = useState(null); // 수정 중인 댓글 ID
    const [editCommentContent, setEditCommentContent] = useState(''); // 수정 중인 댓글 내용

    // JWT 토큰 가져오기
    const token = localStorage.getItem('token'); // 로컬 스토리지에서 JWT 토큰 가져오기

    // 게시글 및 댓글 로드
    useEffect(() => {
        console.log("communityNo:", communityNo); // 커뮤니티 번호 확인용 로그
        loadCommunity(); // 게시글 로드
        loadComments(); // 댓글 로드
    }, [communityNo]);

    // 게시글 로드 함수
    const loadCommunity = useCallback(async () => {
        try {
            const resp = await axios.get(`/community/${communityNo}`, {
                headers: {
                    Authorization: `Bearer ${token}` // 토큰을 헤더에 추가
                }
            });
            console.log("Community Detail - Post loaded:", resp.data); // 게시글 정보 확인 로그
            setCommunity(resp.data);
        } catch (e) {
            console.error("Failed to load community post:", e); // 게시글 로드 실패 로그
            setCommunity(null);
        }
        setLoad(true);
    }, [communityNo, token]);

    // 댓글 로드 함수
    const loadComments = useCallback(async () => {
        try {
            const resp = await axios.get(`/community/comments/${communityNo}`, {
                headers: {
                    Authorization: `Bearer ${token}` // 토큰을 헤더에 추가
                }
            });
            console.log("Community Detail - Comments loaded:", resp.data); // 댓글 목록 확인 로그
            setComments(resp.data);
        } catch (e) {
            console.error("Failed to load comments:", e); // 댓글 로드 실패 로그
        }
    }, [communityNo, token]);

    // 댓글 작성 핸들러
    const handleCommentSubmit = async () => {
        if (!newComment.trim()) {
            alert("댓글 내용을 입력하세요.");
            return;
        }

        try {
            const response = await axios.post('/community/comment', {
                communityNo: communityNo,
                communityContent: newComment,
                communityWriter: '작성자명' // 필요 시 로그인한 사용자 정보로 대체
            }, {
                headers: {
                    Authorization: `Bearer ${token}` // 토큰을 헤더에 추가
                }
            });
            console.log("Comment submitted:", response); // 댓글 등록 성공 시 로그
            setNewComment(''); // 입력 필드 초기화
            loadComments(); // 댓글 목록 다시 로드
        } catch (e) {
            console.error("Failed to submit comment:", e); // 댓글 등록 실패 로그
            alert("댓글 등록에 실패했습니다.");
        }
    };

    // 게시글 삭제 핸들러
    const deleteCommunity = useCallback(async () => {
        if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
            try {
                const response = await axios.delete(`/community/${communityNo}`, {
                    headers: {
                        Authorization: `Bearer ${token}` // 토큰을 헤더에 추가
                    }
                });
                console.log("Community deleted:", response); // 게시글 삭제 성공 로그
                navigate("/community/list"); // 삭제 후 목록 페이지로 이동
            } catch (e) {
                console.error("Failed to delete community post:", e); // 게시글 삭제 실패 로그
            }
        }
    }, [communityNo, token, navigate]);

    if (load === false) {
        return (<>
            <Jumbotron title={"?번 글상세정보"} />
            {/* 로딩 중 상태 */}
        </>);
    }

    if (community === null) {
        return <Navigate to="/notFound" />;
    }

    return (
        <>
            <Jumbotron title={`${communityNo}번 글 상세정보`} />

            {/* 게시글 정보 */}
            <div className="row mt-4">
                <div className="col-sm-3">제목</div>
                <div className="col-sm-9">{community.communityTitle}</div>
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

            {/* 댓글 목록 */}
            <h3>댓글</h3>
            <ul>
                {comments.map(comment => (
                    <li key={comment.communityNo}>
                        <p>{comment.communityContent}</p>
                        <small>작성자: {comment.communityWriter} / 작성시간: {comment.communityWtimeString}</small>
                    </li>
                ))}
            </ul>

            {/* 댓글 작성 폼 */}
            <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요"
            />
            <button onClick={handleCommentSubmit}>댓글 작성</button>

            {/* 버튼 */}
            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-secondary ms-2" onClick={() => navigate("/community/list")}>목록</button>
                    <button className="btn btn-warning ms-2" onClick={() => navigate(`/community/edit/${communityNo}`)}>수정하기</button>
                    <button className="btn btn-danger ms-2" onClick={deleteCommunity}>삭제하기</button>
                </div>
            </div>
        </>
    );
};

export default CommunityDetail;
