import axios from "axios";
import { useState, useEffect, useCallback, useRef } from 'react';
import { FaPlus, FaCommentDots, FaThumbsUp } from "react-icons/fa6";
import Jumbotron from "../Jumbotron";
import { useNavigate } from "react-router-dom";
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";
import { useRecoilValue } from "recoil";
import throttle from "lodash/throttle";
import moment from 'moment';
import momentTimezone from 'moment-timezone';
import { toast, ToastContainer } from 'react-toastify'; // Toast 컴포넌트 import
import 'react-toastify/dist/ReactToastify.css'; 
import './CommunityList.css';


moment.locale("ko"); // 한국어 로케일 설정

// 작성 및 수정 시간 형식화 함수
const formatDate = (dateString, isEdited = false) => {
    const date = moment(dateString).tz("Asia/Seoul"); // UTC 변환 없이 한국 시간대로 설정

    const formatForCreated = "MM.DD. HH:mm"; // 작성 시간 형식 (년도 제외)
    const formatForEdited = "YY.MM.DD. HH:mm"; // 수정 시간 형식

    if (isEdited) {
        return `${date.format(formatForEdited)} (수정됨)`;
    }
    return date.format(formatForCreated);
};


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
            console.log("percent : "+percent);
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
                 // 이미지 URL 가져오기
                 const imageResponse = await axios.get(`/community/image/${community.communityNo}`);
                 const imageUrl = imageResponse.data[0]
                 ? `http://localhost:8080/community/download/${imageResponse.data[0].attachmentNo}`
                 : null;
 
                return {
                    ...community,
                    netLikes: likeCount - dislikeCount,
                    communityReplies: community.communityReplies || 0,
                    imageUrl // 이미지 URL 추가
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


                // 이미지 URL 가져오기
                const imageResponse = await axios.get(`/community/image/${community.communityNo}`);
                const imageUrl = imageResponse.data[0]
                ? `http://localhost:8080/community/download/${imageResponse.data[0].attachmentNo}`
                : null;

                return {
                    ...community,
                    netLikes: likeCount - dislikeCount,
                    communityReplies: community.communityReplies || 0,
                    imageUrl // 이미지 URL 추가
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
        console.log(scrollPercent);
        return scrollPercent;
    }, []);

    const changeInput = useCallback(e => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    // 게시글 등록 버튼 클릭 핸들러--------(추가한 코드)
    const handleRegisterClick = () => {
        if (!login) {
            // 알림 표시
            toast.error("로그인 후 사용하세요.", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                className: "kjhtoast-steam" // 커스텀 스타일 적용
            });
            // 로그인 페이지로 이동
            setTimeout(() => {
                navigate("/member/MemberLogin");
            }, 2000); // 알림 표시 후 3초 뒤에 이동
        } else {
            navigate("/community/add");
        }
    };

    return (
        <>
            {/* <Jumbotron title="게임게시판" content="커뮤니티" /> */}

            {/* Search Bar */}
            <div className="kjh-margin kjh-row kjh-search-bar container">
    <div className="kjh-col kjh-input-group" style={{ flexGrow: 1 }}>
        <select className="kjh-form-select" name="column" value={input.column} onChange={changeInput}>
            <option value="community_title">제목</option>
            <option value="community_writer">작성자</option>
        </select>
        <input type="search" className="kjh-form-control" name="keyword" value={input.keyword} onChange={changeInput} />
        <button className="kjh-btn" onClick={setFirstPage}>검색</button>
    </div>
    <div className="kjh-col text-end">
        <button className="kjh-btn" onClick={handleRegisterClick}>게시글 등록 <FaPlus /></button>
    </div>
</div>

<div className="kjh-grid">
    {result.communityList.map((community) => {
        const cardSizeClass = community.imageUrl
            ? "kjh-card-large"
            : community.communityContent.length > 100
            ? "kjh-card-medium"
            : "kjh-card-small";

        return (
            <div className={`kjh-card ${cardSizeClass}`} key={community.communityNo} onClick={() => navigate("/community/detail/" + community.communityNo)}>
                {community.imageUrl && (
                    <img src={community.imageUrl} className="kjh-card-img-top" alt="게시글 이미지" />
                )}
                <div className="kjh-card-body">
                    <h5 className="kjh-card-title">{community.communityTitle}</h5>
                    <div className="kjh-meta-text">
                        <span>{community.communityCategory}</span>
                        <span>{community.communityUtime ? formatDate(community.communityUtime, true) : formatDate(community.communityWtime)}</span>
                    </div>
                    <div className="kjh-content-text">
                        {community.communityContent}
                    </div>
                    <div className="kjh-stats-row">
                        <div><FaThumbsUp /> {community.netLikes}</div>
                        <div><FaCommentDots /> {community.communityReplies}</div>
                        <div className="kjh-writer-text">{community.communityWriter} 작성자</div>
                    </div>
                </div>
            </div>
        );
    })}
</div>




            
        </>
    );
};

export default CommunityList;
