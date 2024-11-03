import axios from "axios";
import Jumbotron from "../Jumbotron";
import { useCallback, useState } from 'react';
import { useNavigate } from "react-router";
import { toast } from "react-toastify"; 

const CommunityAdd = () => {
    const navigate = useNavigate();

    // 게시글 및 파일 관련 상태
    const [input, setInput] = useState({
        communityTitle: "",
        communityState: "",
        communityCategory: "자유",  
        communityContent: ""
    });
    const [files, setFiles] = useState([]); // 여러 파일 첨부를 위해 배열로 변경
    const [message, setMessage] = useState();

    // 입력 변경 처리 함수
    const changeInput = useCallback(e => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }, [input]);

    // 파일 선택 처리 함수
    const changeFiles = (e) => {
        setFiles(Array.from(e.target.files)); // 선택된 파일들을 배열로 저장
    };

    // 게시글 저장 함수
    const saveCommunity = useCallback(async () => {
        if (input.communityTitle.length === 0 || input.communityContent.length === 0) {
            setMessage("제목과 내용은 필수입니다.");
            return;
        }

        try {
            // FormData를 생성하여 JSON 데이터와 파일을 함께 전송
            const formData = new FormData();
            formData.append("community", new Blob([JSON.stringify(input)], { type: "application/json" }));
            files.forEach(file => formData.append("files", file)); // 여러 파일 첨부

            // 게시글 저장 요청
            const resp = await axios.post("http://localhost:8080/community/", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            // 성공적으로 등록되면 목록으로 이동
            toast.success("게시글이 등록되었습니다.");
            navigate("/community/list");
        } catch (error) {
            console.error("Error while saving the community post:", error);
            toast.error("게시글 등록에 실패했습니다.");
        }
    }, [input, files, navigate]);

    // 화면 렌더링
    return (
        <>
            <Jumbotron title="게시글 등록" />

            <div className="row mt-4">
                <div className="col">
                    <label>제목</label>
                    <input type="text" name="communityTitle" className="form-control"
                        value={input.communityTitle} onChange={changeInput} />
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <label>상태</label>
                    <select name="communityState" className="form-control" value={input.communityState} onChange={changeInput}>
                        <option value="public">공개</option>
                        <option value="private">비공개</option>
                    </select>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <label>카테고리</label>
                    <select name="communityCategory" className="form-control" value={input.communityCategory} onChange={changeInput}>
                        <option value="자유">자유</option>
                        <option value="질문">질문</option>
                        <option value="공략">공략</option>
                        <option value="스포">스포</option>
                    </select>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <label>내용</label>
                    <textarea name="communityContent" className="form-control"
                        value={input.communityContent} onChange={changeInput} />
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <label>파일 첨부</label>
                    <input type="file" multiple onChange={changeFiles} />
                </div>
            </div>

            <div className="row">
                <div className="col text-danger text-center">
                    {message}
                </div>
            </div>

            <div className="row mt-4">
                <div className="col text-center">
                    <button type="button" className="btn btn-lg btn-success" onClick={saveCommunity}>등록</button>
                    <button type="button" className="btn btn-lg btn-secondary ms-2" onClick={() => navigate("/community/list")}>목록</button>
                </div>
            </div>
        </>
    );
};

export default CommunityAdd;
