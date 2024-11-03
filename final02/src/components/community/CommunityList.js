import axios from "axios";
import { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlus, FaCommentDots, FaThumbsUp } from "react-icons/fa6";
import Jumbotron from "../Jumbotron";
import { useNavigate } from "react-router-dom";
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";
import { useRecoilValue } from "recoil";
import throttle from "lodash/throttle";

const CommunityList = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(null);
    const [size, setSize] = useState(12);
    const [result, setResult] = useState({
        count: 0,
        last: true,
        communityList: []
    });
    const [input, setInput] = useState({
        column: "community_title",
        keyword: "",
        beginRow: "",
        endRow: ""
    });
    const loading = useRef(false);

    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberLoading = useRecoilValue(memberLoadingState);

    useEffect(() => {
        setInput({
            ...input,
            beginRow: page * size - (size - 1),
            endRow: page * size
        });
    }, [page, size]);

    useEffect(() => {
        if (page === null) setFirstPage(); 
        if (page <= 1) {
            loadCommunityList();
        }
        else if (page >= 2) {
            loadMoreCommunityList();
        }
    }, [input.beginRow, input.endRow]);

    useEffect(() => {
        if (page === null) return;
        if (result.last === true) return;

        const resizeHandler = throttle(() => {
            const percent = getScrollPercent();
            if (percent >= 70 && loading.current === false) {
                setPage(page + 1);
            }
        }, 300);

        window.addEventListener("scroll", resizeHandler);
        return () => {
            window.removeEventListener("scroll", resizeHandler);
        };
    });

    const loadCommunityList = useCallback(async () => {
        loading.current = true;
        const response = await axios.post("/community/list", input);

        const communityListWithLikes = await Promise.all(
            response.data.communityList.map(async (community) => {
                const reactionResponse = await axios.get(`/community/reactions/count?communityNo=${community.communityNo}`);
                const likeCount = reactionResponse.data.likeCount || 0;
                const dislikeCount = reactionResponse.data.dislikeCount || 0;
                return {
                    ...community,
                    netLikes: likeCount - dislikeCount,
                    communityReplies: community.communityReplies || 0
                };
            })
        );

        setResult({
            ...response.data,
            communityList: communityListWithLikes
        });

        loading.current = false;
    }, [input]);

    const loadMoreCommunityList = useCallback(async () => {
        loading.current = true;
        const response = await axios.post("/community/list", input);

        const moreCommunityListWithLikes = await Promise.all(
            response.data.communityList.map(async (community) => {
                const reactionResponse = await axios.get(`/community/reactions/count?communityNo=${community.communityNo}`);
                const likeCount = reactionResponse.data.likeCount || 0;
                const dislikeCount = reactionResponse.data.dislikeCount || 0;
                return {
                    ...community,
                    netLikes: likeCount - dislikeCount,
                    communityReplies: community.communityReplies || 0
                };
            })
        );

        setResult({
            ...result,
            last: response.data.last,
            communityList: [...result.communityList, ...moreCommunityListWithLikes]
        });

        loading.current = false;
    }, [input.beginRow, input.endRow]);

    const setFirstPage = useCallback(() => {
        setPage(prev => null);
        setTimeout(() => {
            setPage(prev => 1);
        }, 1);
    }, [page]);

    const getScrollPercent = useCallback(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / documentHeight) * 100;
        return scrollPercent;
    }, []);

    const changeInput = useCallback(e => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    return (
        <>
            <Jumbotron title="게임게시판" content="커뮤니티" />

            {/* 검색창 */}
            <div className="row">
                <div className="col input-group">
                    <select className="form-select" name="column" value={input.column} onChange={changeInput}>
                        <option value="community_title">제목</option>
                        <option value="community_writer">작성자</option>
                    </select>
                    <input type="search" className="form-control" name="keyword" value={input.keyword} onChange={changeInput} />
                    <button className="btn btn-secondary" onClick={setFirstPage}>검색</button>
                </div>
            </div>
            {/* 게시글 등록 버튼 */}
            <div className="col text-end mt-2">
                <button className="btn btn-primary" onClick={() => navigate("/community/add")}>게시글 등록 <FaPlus /></button>
            </div>

            {/* 목록 */}
            <div className="row mt-4">
                {result.communityList.map((community) => (
                    <div className="col-sm-4 col-md-4 col-lg-3 mt-3" key={community.communityNo} onClick={() => navigate("/community/detail/" + community.communityNo)}>
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{community.communityTitle}</h5>
                                이미지
                                <div className="card-text">
                                    <div className="row">
                                        <div className="col">
                                            <div className="text-start">{community.communityContent}</div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6 text-start">
                                            <FaThumbsUp /> {community.netLikes}
                                        </div>
                                        <div className="col-6 text-end">
                                            <FaCommentDots /> {community.communityReplies}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6 text-start">
                                            {community.communityWriter} 작성자
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default CommunityList;
