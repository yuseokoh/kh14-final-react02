import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";

const CommunityEdit = () => {
    const { communityNo } = useParams();
    const navigate = useNavigate();

    const [community, setCommunity] = useState(null);
    const [message, setMessage] = useState("");
    const [selectedFiles, setSelectedFiles] = useState([]); // State for selected files
    const [existingImages, setExistingImages] = useState([]); // State to store existing images

    useEffect(() => {
        loadCommunity();
        loadCommunityImages();
    }, []);

    const loadCommunity = useCallback(async () => {
        try {
            const resp = await axios.get(`/community/${communityNo}`);
            setCommunity(resp.data);
        } catch (e) {
            setCommunity(null);
        }
    }, [communityNo]);

    const loadCommunityImages = useCallback(async () => {
        try {
            const resp = await axios.get(`/community/image/${communityNo}`);
            setExistingImages(resp.data); // Set existing images
        } catch (e) {
            console.error("Failed to load images:", e);
        }
    }, [communityNo]);

    const changeCommunity = useCallback(e => {
        setCommunity({
            ...community,
            [e.target.name]: e.target.value
        });
    }, [community]);

    const handleFileChange = (e) => {
        setSelectedFiles(e.target.files); // Set selected files
    };

    const updateCommunity = useCallback(async () => {
        if (!community.communityTitle || !community.communityContent) {
            setMessage("제목과 내용은 필수입니다.");
            return;
        }

        const formData = new FormData();
        formData.append("community", new Blob([JSON.stringify({ ...community, communityNo })], { type: 'application/json' }));
        
        // Append new files
        Array.from(selectedFiles).forEach(file => {
            formData.append("files", file);
        });

        try {
            await axios.put(`/community/${communityNo}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            navigate(`/community/detail/${communityNo}`);
        } catch (error) {
            console.error("Update failed:", error);
            setMessage("수정 중 오류가 발생했습니다.");
        }
    }, [community, communityNo, selectedFiles, navigate]);

    const deleteExistingImage = async (attachmentNo) => {
        try {
            await axios.delete(`/community/image/${attachmentNo}`);
            setExistingImages(existingImages.filter(img => img.attachmentNo !== attachmentNo));
        } catch (error) {
            console.error("Failed to delete image:", error);
            setMessage("이미지 삭제 중 오류가 발생했습니다.");
        }
    };

    return (community !== null ? (
        <>
            <Jumbotron title={`${community.communityNo}번 글 수정`} />

            <div className="row mt-4">
                <div className="col">
                    <label>제목</label>
                    <input type="text" name="communityTitle" className="form-control"
                        value={community.communityTitle} onChange={changeCommunity} />
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <label>상태</label>
                    <select name="communityState" className="form-control"
                        value={community.communityState} onChange={changeCommunity} >
                        <option value="public">공개</option>
                        <option value="private">비공개</option>
                    </select>
                </div>
            </div>
            <div className="row mt-4">
                <div className="col">
                    <label>카테고리</label>
                    <select name="communityCategory" className="form-control"
                        value={community.communityCategory} onChange={changeCommunity} >
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
                    <input type="text" name="communityContent" className="form-control"
                        value={community.communityContent} onChange={changeCommunity} />
                </div>
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
                <div className="row mt-4">
                    <div className="col">
                        <label>기존 첨부 이미지</label>
                        <div>
                            {existingImages.map(image => (
                                <div key={image.attachmentNo} style={{ position: 'relative', display: 'inline-block', margin: '5px' }}>
                                    <img
                                        src={`http://localhost:8080/community/download/${image.attachmentNo}`}
                                        alt={`Attachment ${image.attachmentNo}`}
                                        style={{ maxWidth: "100px", maxHeight: "100px" }}
                                    />
                                    <button 
                                        type="button" 
                                        className="btn btn-sm btn-danger" 
                                        onClick={() => deleteExistingImage(image.attachmentNo)}
                                        style={{ position: 'absolute', top: '0', right: '0' }}
                                    >
                                        삭제
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* New File Upload */}
            <div className="row mt-4">
                <div className="col">
                    <label>새 파일 첨부</label>
                    <input type="file" className="form-control" onChange={handleFileChange} multiple />
                </div>
            </div>

            <div className="row">
                <div className="col text-danger text-center">
                    {message}
                </div>
            </div>

            <div className="row mt-4">
                <div className="col text-center">
                    <button type="button" className="btn btn-lg btn-success" onClick={updateCommunity}>수정</button>
                    <button type="button" className="btn btn-lg btn-secondary ms-2" onClick={() => navigate("/community/list")}>목록</button>
                </div>
            </div>
        </>
    ) : (<></>));
};

export default CommunityEdit;
