import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import './CommunityAdd.css'; 

const CommunityEdit = () => {
    const { communityNo } = useParams();
    const navigate = useNavigate();

    const [community, setCommunity] = useState(null);
    const [message, setMessage] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]); // 새로 추가할 파일
    const [previewUrls, setPreviewUrls] = useState([]); // 새로 추가할 파일의 미리보기 URL
    const [existingImages, setExistingImages] = useState([]); // 기존 이미지 목록
    const [deletedImageNos, setDeletedImageNos] = useState([]); // 삭제할 이미지 번호들

    useEffect(() => {
        loadCommunity();
        loadCommunityImages();
    }, []);

    // 게시글 정보 로드
    const loadCommunity = useCallback(async () => {
        try {
            const resp = await axios.get(`/community/${communityNo}`);
            setCommunity(resp.data);
        } catch (e) {
            setCommunity(null);
        }
    }, [communityNo]);

    // 기존 이미지 로드
    const loadCommunityImages = useCallback(async () => {
        try {
            const resp = await axios.get(`/community/image/${communityNo}`);
            setExistingImages(resp.data || []);
        } catch (e) {
            console.error("Failed to load images:", e);
        }
    }, [communityNo]);

    // 게시글 정보 변경 핸들러
    const changeCommunity = useCallback(e => {
        setCommunity({
            ...community,
            [e.target.name]: e.target.value
        });
    }, [community]);

    // 새 파일 선택 핸들러
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prevFiles => [...prevFiles, ...files]);

        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prevUrls => [...prevUrls, ...urls]);
    };

    // 새로 선택한 이미지 삭제 핸들러
    const removeImage = (index) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
        
        URL.revokeObjectURL(previewUrls[index]);
        setSelectedFiles(newFiles);
        setPreviewUrls(newPreviewUrls);
    };

    // 기존 이미지 삭제 핸들러
    // 기존 이미지 삭제 핸들러
    const handleExistingImageDelete = async (attachmentNo) => {
        try {
            await axios.delete(`/community/image/${attachmentNo}`);
            
            setExistingImages(prev => prev.filter(img => img.attachmentNo !== attachmentNo));
        } catch (error) {
            console.error("이미지 삭제 실패:", error);
            alert("이미지 삭제에 실패했습니다.");
        }
    };
    

    // 게시글 업데이트 요청
    const updateCommunity = useCallback(async () => {
        if (!community.communityTitle || !community.communityContent) {
            setMessage("제목과 내용은 필수입니다.");
            return;
        }

        const formData = new FormData();
        formData.append("community", new Blob([JSON.stringify({ ...community, communityNo })], { type: 'application/json' }));
        
        // 새로 추가할 파일
    selectedFiles.forEach(file => {
        formData.append("files", file);
    });


        // 삭제할 이미지 번호들을 추가
        deletedImageNos.forEach(no => {
            formData.append("deletedImageNos", no);
        });

        try {
            await axios.put(`/community/${communityNo}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            previewUrls.forEach(url => URL.revokeObjectURL(url));
            alert("수정이 완료되었습니다.");
            navigate(`/community/detail/${communityNo}`);
        } catch (error) {
            console.error("Update failed:", error);
            setMessage("수정 중 오류가 발생했습니다.");
        }
    }, [community, communityNo, selectedFiles, deletedImageNos, previewUrls, navigate]);

    return (community !== null ? (
        <>
            {/* <Jumbotron title={`${community.communityNo}번 글 수정`} /> */}

            <div className="kjhrow">
                <div className="kjhcol">
                    <label>제목</label>
                    <input type="text" name="communityTitle" className="kjhinput"
                        value={community.communityTitle} onChange={changeCommunity} />
                </div>
            </div>
            {/* <div className="row mt-4">
                <div className="col">
                    <label>상태</label>
                    <select name="communityState" className="form-control"
                        value={community.communityState} onChange={changeCommunity} >
                        <option value="public">공개</option>
                        <option value="private">비공개</option>
                    </select>
                </div>
            </div> */}
            <div className="kjhrow">
                <div className="kjhcol">
                    <label>카테고리</label>
                    <select name="communityCategory" className="kjhinput"
                        value={community.communityCategory} onChange={changeCommunity} >
                        <option value="자유">자유</option>
                        <option value="질문">질문</option>
                        <option value="공략">공략</option>
                        <option value="스포">스포</option>
                    </select>
                </div>
            </div>
            <div className="kjhrow">
                <div className="kjhcol">
                    <label>내용</label>
                    <textarea name="communityContent" className="kjhtextarea" style={{resize:"none" ,minHeight:"200px"}}
                        value={community.communityContent} onChange={changeCommunity} />
                </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
                <div className="kjhrow">
                    <div className="kjhcol">
                        <label>기존 첨부 이미지</label>
                        <div className="kjhexisting-images">
                            {existingImages.map(image => (
                                 <div key={image.attachmentNo} className="kjhimage-container">
                                 <img src={`http://localhost:8080/community/download/${image.attachmentNo}`} alt={`Attachment ${image.attachmentNo}`} className="kjhimage-preview" />
                                 <button type="button" className="kjhbtn kjhbtn-danger" onClick={() => handleExistingImageDelete(image.attachmentNo)}>
                                        삭제
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* New File Upload */}
            <div className="kjhrow ">
                <div className="kjhcol">
                    <label>새 파일 첨부</label>
                    <input type="file" className="kjhinput" onChange={handleFileChange} multiple />
                    <div className="mt-2">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="kjhimage-container">
                                <img src={url} alt="미리보기" className="kjhimage-preview"/>
                                <button type="button" className="kjhbtn kjhbtn-danger" onClick={() => removeImage(index)}>
                                    삭제
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="kjhrow">
                <div className="kjhcol text-danger text-center">
                    {message}
                </div>
            </div>

            <div className="kjhrow">
                <div className="kjhcol text-center">
                    <button type="button" className="kjhbtn kjhbtn-register" onClick={updateCommunity}>수정</button>
                    <button type="button" className="kjhbtn kjhbtn-list ms-2" onClick={() => navigate("/community/list")}>목록</button>
                </div>
            </div>
        </>
    ) : (<></>));
};

export default CommunityEdit;
