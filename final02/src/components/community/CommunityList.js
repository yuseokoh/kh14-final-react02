import axios from "axios";
import { useState, useEffect } from 'react';
import { FaPlus, FaCommentDots } from "react-icons/fa6"; // FaCommentDots 추가
import Jumbotron from "../Jumbotron";
import { NavLink, useNavigate } from "react-router-dom";
import { loginState, memberIdState, memberLoadingState } from "../../utils/recoil";
import { useRecoilValue } from "recoil";

const CommunityList = () => {

    const axiosInstance = axios.create({
        baseURL: "http://localhost:3000",
        timeout: 10000, // 10초로 설정
    });
    const navigate = useNavigate();
    const [communityList, setCommunityList] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [results, setResults] = useState([]);
    const login = useRecoilValue(loginState);
    const memberId = useRecoilValue(memberIdState);
    const memberLoading = useRecoilValue(memberLoadingState);

    useEffect(() => {
        loadCommunityList();
    }, []);

    const loadCommunityList = async () => {
        try {
            const resp = await axios.get("/community/");
            setCommunityList(resp.data);
            setResults(resp.data);
        } catch (error) {
            console.error("목록 로드 중 오류 발생:", error);
        }
    };

    const handleSearch = async () => {
        if (!keyword.trim()) {
            setResults(communityList);
            return;
        }
        try {
            const response = await axios.get(`/community/search/title/${keyword}`);
            setResults(response.data);
        } catch (error) {
            console.error("검색 중 오류 발생:", error);
        }
    };

    return (
        <>
            <Jumbotron title="게임게시판" content="커뮤니티" />

            <div className="row mt-4">
                <div className="col">
                    <input 
                        type="text" 
                        className="form-control" 
                        placeholder="검색어를 입력하세요" 
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>
                <div className="col-auto">
                    <button className="btn btn-primary" onClick={handleSearch}>
                        검색
                    </button>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <NavLink className="btn btn-success" to="/community/add">
                        <FaPlus /> 등록
                    </NavLink>
                    <button className="btn btn-success ms-2" 
                            onClick={() => navigate("/community/add")}>
                        <FaPlus /> 등록
                    </button>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col">
                    <div className="table-responsive">
                        <table className="table text-nowrap">
                            <thead>
                                <tr>
                                    <th>글 번호</th>
                                    <th>제목</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.length > 0 ? (
                                    results.map(community => (
                                        <tr key={community.communityNo}>
                                            <td>{community.communityNo}</td>
                                            <td>
                                                <NavLink to={`/community/detail/${community.communityNo}`}>
                                                    {community.communityTitle}
                                                    <span className="ms-2 text-muted">
                                                        <FaCommentDots className="me-1" /> {/* 댓글 아이콘 */}
                                                        {community.communityReplies || 0} {/* 댓글 수 */}
                                                    </span>
                                                </NavLink>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="2">검색 결과가 없습니다.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CommunityList;
