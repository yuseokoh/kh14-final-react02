import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useEffect, useState, useCallback } from 'react';
import axios from "axios";

//ㅈㄴ 힘들어 살려주세요

const CommunityDetail = () => {
    const { communityNo } = useParams();
    const navigate = useNavigate();
    const [community, setCommunity] = useState(null);
    const [load, setLoad] = useState(false);
    const [replyList, setReplyList] = useState([]);
    const [newReply, setNewReply] = useState("");
    const [newReplyParent, setNewReplyParent] = useState(null); 

    useEffect(() => {
        loadCommunity();
        loadReplies();
    }, [communityNo]);

    const loadCommunity = useCallback(async () => {
        try {
            const resp = await axios.get(`/community/${communityNo}`);
            setCommunity(resp.data);
        } catch (e) {
            setCommunity(null);
        }
        setLoad(true);
    }, [communityNo]);

    const loadReplies = useCallback(async () => {
        try {
            const resp = await axios.get(`/reply/`);
            setReplyList(resp.data);
        } catch (e) {
            console.error(e);
        }
    }, [communityNo]);

    // 댓글 작성
    const addReply = useCallback(async () => {
        try {
            const response = await axios.post("/reply/", {
                replyContent: newReply,
                replyOrigin: communityNo,
                replyGroup: newReplyParent ? newReplyParent.replyGroup : null,
                replyDepth: newReplyParent ? newReplyParent.replyDepth + 1 : 0
            });
    
            console.log("댓글이 성공적으로 등록되었습니다:", response.data);
    
            // 댓글 등록 성공 시, 입력 필드를 초기화하고 댓글 목록을 새로고침
            setNewReply("");
            setNewReplyParent(null);
            loadReplies();
            
        } catch (error) {
            console.error("댓글 작성 중 오류 발생:", error);
        }
    }, [newReply, newReplyParent, communityNo, loadReplies]);
    

    // 댓글 삭제
    const deleteReply = useCallback(async (replyNo) => {
        try {
            await axios.delete(`/reply/${replyNo}`);
            loadReplies(); 
        } catch (e) {
            console.error(e);
        }
    }, [loadReplies]);

    // 댓글 수정
    const updateReply = useCallback(async (replyNo, updatedContent) => {
        try {
            await axios.put(`/reply/${replyNo}`, { replyContent: updatedContent });
            loadReplies(); 
        } catch (e) {
            console.error(e);
        }
    }, [loadReplies]);

    // 글 삭제 함수 추가
    const deleteCommunity = useCallback(async () => {
        try {
            await axios.delete(`/community/${communityNo}`);
            navigate("/community/list");
        } catch (e) {
            console.error(e);
        }
    }, [communityNo, navigate]);

    const startReplyTo = (reply) => {
        setNewReplyParent(reply);
        setNewReply(`@${reply.replyWriter} `); 
    };

    const renderReplies = () => {
        return replyList.map(reply => (
            <div key={reply.replyNo} style={{ marginLeft: reply.replyDepth * 20 + 'px' }} className="mt-3">
                <div><b>{reply.replyWriter}</b> - {reply.replyWtime}</div>
                <div>{reply.replyContent}</div>
                <button onClick={() => deleteReply(reply.replyNo)} className="btn btn-danger btn-sm">삭제</button>
                <button onClick={() => startReplyTo(reply)} className="btn btn-secondary btn-sm">대댓글</button>
            </div>
        ));
    };

    if (load === false) {
        return (<>
            <Jumbotron title={"?번 글상세정보"} />
            {/* 로딩 중일 때 보일 플레이스홀더 */}
        </>);
    }

    if (community === null) {
        return <Navigate to="/notFound" />
    }

    return (<>
        <Jumbotron title={communityNo + "번 글 상세정보"} />
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

        {/* 댓글 작성 폼 */}
        <div className="row mt-4">
            <div className="col-sm-12">
                <h4>댓글</h4>
                <input
                    type="text"
                    className="form-control"
                    value={newReply}
                    onChange={e => setNewReply(e.target.value)}
                    placeholder="댓글을 입력하세요"
                />
                <button onClick={addReply} className="btn btn-primary mt-2">댓글 작성</button>
                {newReplyParent && <div>대댓글 대상: {newReplyParent.replyWriter}</div>}
            </div>
        </div>

        {/* 댓글 목록 렌더링 */}
        <div className="row mt-4">
            <div className="col-sm-12">
                {renderReplies()}
            </div>
        </div>

        {/* 각종 버튼들 */}
        <div className="row mt-4">
            <div className="col text-end">
                <button className="btn btn-secondary ms-2" onClick={e => navigate("/community/list")}>목록</button>
                <button className="btn btn-warning ms-2" onClick={e => navigate("/community/edit/" + communityNo)}>수정하기</button>
                <button className="btn btn-danger ms-2" onClick={deleteCommunity}>삭제하기</button>
            </div>
        </div>
    </>);
};

export default CommunityDetail;
