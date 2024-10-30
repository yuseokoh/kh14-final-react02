import { Navigate, useNavigate, useParams } from "react-router";
import Jumbotron from "../Jumbotron";
import { useEffect } from 'react';
import { useCallback } from 'react';
import axios from "axios";
import { useState } from 'react';
import { useMemo } from 'react';

const CommunityDetail = ()=>{
    //파라미터를 읽는 명령
    const {communityNo} = useParams();

    //이동 도구
    const navigate = useNavigate();

    //state
    const [community, setCommunity] = useState(null);
    const [load, setLoad] = useState(false);//통신이 완료되면 true

    //댓글코드
    const [replyInput, setReplyInput] = useState("");  //작성용
    const [replyList, setReplyList] = useState([]) //댓글목록
    const [replyEdit, setReplyEdit] = useState(""); //댓글 수정

    const insertReply = useCallback (async (e) => {
        e.preventDefault();
        if (!replyInput) return; // 답글이 비어 있으면 무시
        // try {
            await axios.post(`/reply/${communityNo}`, { replyContent: replyInput }); // 답글 추가 API
            setReplyInput(""); // 입력창 비우기
            // loadReply(); // 답글 목록 새로 고침 이놈이 악의 근원
            // toast.success("답글이 작성되었습니다!"); // 성공 알림
        // } catch (e) {
        //     console.error("Error adding reply", e);
        // }
    },[replyInput]);

    //댓글목록 무한스크로롤로로로로로로로로로로로로로로로로로로로로로로로ㅗ로로로로로ㅗ로로
    const loadReply = useCallback (async()=>{
       const response = await axios.get(`/reply/${communityNo}`);
        setReplyList(response.data);
        console.log(response.data);
    },[replyInput]);




    //effect
    useEffect(() => {
        console.log("communityNo:", communityNo); // 로그로 확인
        loadCommunity();
        loadReply();
      }, [communityNo]);

    //callback
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

    //화면의 상태가 총 3가지로 존재할 수 있다.
    //1. 로딩 전
    //2. 로딩 후
    //  (1) 데이터 있음
    //  (2) 데이터 없음
    if(load === false) {//1. 로딩 완료 전이면
        return (<>
            <Jumbotron title={"?번 글상세정보"}/>

            <div className="row mt-4">
                <div className="col-sm-3">
                    제목
                </div>
                <div className="col-sm-9">
                    <span className="placeholder col-6"></span>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-3">
                    상태
                </div>
                <div className="col-sm-9">
                <span className="placeholder col-4"></span>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-3">
                    카테고리
                </div>
                <div className="col-sm-9">
                <span className="placeholder col-4"></span>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-3">
                    내용
                </div>
                <div className="col-sm-9">
                    <span className="placeholder col-3"></span>
                </div>
            </div>

            <div className="row mt-4">
                <div className="col-sm-3">
                    파일첨부(미정)
                </div>
                <div className="col-sm-9">
                    <span className="placeholder col-2"></span>
                </div>
            </div>


            {/* 각종 버튼들 */}
            <div className="row mt-4">
                <div className="col text-end">
                    <button className="btn btn-secondary placeholder col-2 ms-2">목록보기</button>
                    <button className="btn btn-warning placeholder col-2 ms-2">수정하기</button>
                    <button className="btn btn-danger placeholder col-2 ms-2">삭제하기</button>
                </div>
            </div>




        </>);
    }

    if(community === null) {//2-(2). 데이터가 없으면
        return <Navigate to="/notFound"/>
    }

    //view. 2-(1)
    return (<>
        <Jumbotron title={communityNo +"번 글 상세정보"}/>

        <div className="row mt-4">
            <div className="col-sm-3">
                제목
            </div>
            <div className="col-sm-9">
                {community.communityTitle}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col-sm-3">
                상태
            </div>
            <div className="col-sm-9">
                {community.communityState}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col-sm-3">
                카테고리
            </div>
            <div className="col-sm-9">
                {community.communityCategory}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col-sm-3">
                내용
            </div>
            <div className="col-sm-9">
                {community.communityContent}
            </div>
        </div>

        <div className="row mt-4">
            <div className="col-sm-3">
                파일첨부(미정)
            </div>
        </div>

        {/* 각종 버튼들 */}
        <div className="row mt-4">
            <div className="col text-end">
                <button className="btn btn-secondary ms-2"
                    onClick={e=>navigate("/community/list")}>목록</button>
                <button className="btn btn-warning ms-2"
                    onClick={e=>navigate("/community/edit/"+communityNo)}>수정하기</button>
                <button className="btn btn-danger ms-2"
                    onClick={deleteCommunity}>삭제하기</button>
            </div>
        </div>

                    {/* 댓글작성버튼 */}
                    <div className="row mt-4">
                <div className="col">
                <input type="text" name="replyContent" className="form-control"
                    value={replyInput} onChange={e=>setReplyInput (e.target.value)} />
                    <button className="btn btn-success placeholder col-2 ms-2" onClick={insertReply}>작성하기</button>
                    <button className="btn btn-warning placeholder col-2 ms-2">수정하기</button>
                    <button className="btn btn-danger placeholder col-2 ms-2">삭제하기</button>
                </div>
            </div>

    </>);
};

export default CommunityDetail;