import { useEffect, useState } from "react";
import TestGame from "./TestGame";
import { useRecoilValue } from "recoil";
import { memberIdState, memberLoadingState } from "../utils/recoil";
import axios from "axios";

const KHSurvival = () => {
    //state
    const [gameData, setGameData] = useState(null);
    
    const memberId = useRecoilValue(memberIdState);
    const memberLoading = useRecoilValue(memberLoadingState);



    useEffect(()=>{
        if(memberLoading === false) return;
        console.log(memberId);
    }, [memberLoading, memberId]);

    useEffect(() => {
        if (gameData) {
            // 백엔드로 데이터 전송
            const token = localStorage.getItem('token');
            axios.post('http://localhost:8080/play', {
                enemyKilled: gameData.enemyKilled,
                level: gameData.level,
                memberId: memberId // 추가로 memberId도 전송
            })
                .then(response => {
                    console.log('데이터 전송 성공:', response.data);
                })
                .catch(error => {
                    console.error('데이터 전송 실패:', error);
                });
        }
    }, [gameData, memberId]);

    const handleGameOver = (data) => {
        setGameData(data);
    };


    return (<>
        <div className="row mt-4">
      <div className="col d-flex justify-content-center">
        <div>
          <h2>KH Survival</h2>
          <TestGame onGameOver={handleGameOver}/>
          <h1>{memberId}</h1>
        </div>
      </div>
    </div>
    </>);
};

export default KHSurvival;