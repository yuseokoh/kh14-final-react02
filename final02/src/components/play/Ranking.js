import { useCallback, useEffect, useMemo, useState } from "react";
import { useRecoilValue } from "recoil";
import { memberIdState, memberLoadingState } from "../../utils/recoil";
import axios from "axios";

const Ranking = () => {
  //state
  const [scoreRanking, setScoreRanking] = useState([]); //점수 랭킹
  const [levelRanking, setLevelRanking] = useState([]); //레벨 랭킹
  const [keyword, setKeyword] = useState("");
  const [searchList, setSearchList] = useState([]);//검색 결과
  const [showScoreRanking, setShowScoreRanking] = useState(true); // 점수 랭킹 표시 여부
  const [showLevelRanking, setShowLevelRanking] = useState(false); // 레벨 랭킹 표시 여부
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지
  const [pageSize] = useState(10); // 페이지당 항목 수

  //recoil
  const memberId = useRecoilValue(memberIdState);
  const memberLoading = useRecoilValue(memberLoadingState);

  useEffect(() => {
    loadScoreRanking();
    loadLevelRanking();
    checkScoreRanking();
  }, []);

  //callback
  const loadScoreRanking = useCallback(async () => {
    const resp = await axios.get("http://localhost:8080/play/score");
    setScoreRanking(resp.data);
  }, [scoreRanking]);

  const loadLevelRanking = useCallback(async () => {
    const resp = await axios.get("http://localhost:8080/play/level");
    setLevelRanking(resp.data);
  }, [levelRanking]);

  const searchById = useCallback(async ()=> {
    if(keyword.length === 0) return;
    const resp = await axios.get("http://localhost:8080/play/"+keyword);
    setSearchList(resp.data);
    setKeyword("");
  }, [keyword, searchList]);

  const changeKeyword = useCallback(
    (e) => {
      setKeyword(e.target.value);
    },
    [keyword]
  );

  const checkScoreRanking = useCallback(()=>{
    setShowScoreRanking(true);
  }, [showScoreRanking])
  const toggleScoreRanking = useCallback(() => {
    setShowScoreRanking(true);
    setShowLevelRanking(false);
    setCurrentPage(1);
  }, []);

  const toggleLevelRanking = useCallback(() => {
    setShowLevelRanking(true);
    setShowScoreRanking(false);
    setCurrentPage(1);
  }, []);

  const nextPage = useCallback(()=>{
    setCurrentPage((prev)=> prev+1);
  }, []);
  const prevPage = useCallback(()=> {
    if(currentPage > 1){
      setCurrentPage((prev)=> prev -1);
    }
  }, []);

  const paginatedData = useCallback((data)=>{
    const startRank = (currentPage - 1) * pageSize;
    const endRank = startRank + pageSize;
    return data.slice(startRank, endRank);
  }, [])
  //memo
  const searchResult = useMemo(()=>{
    if(keyword.length === 0) return [];
    return 
  }, []);
  const paginatedScoreData = useMemo(() => paginatedData(scoreRanking), [scoreRanking, paginatedData]);
  const paginatedLevelData = useMemo(() => paginatedData(levelRanking), [levelRanking, paginatedData]);

  return (
    <>
    <div className="row mt-4 d-flex justify-content-center">
        <div className="col-6">
            <label>
           <input type="checkbox" checked={showScoreRanking} onChange={toggleScoreRanking}/>
           Score Ranking
            </label>
            <label>
           <input type="checkbox" className="ms-3" checked={showLevelRanking} onChange={toggleLevelRanking}/>
           Level Ranking
            </label>
        </div>
    </div>
    {showScoreRanking && (
      <div className="row mt-4 d-flex justify-content-center">
        <div className="col-6">
          <h2>Score Ranking</h2>
          <div className="row mt-2">
            <div className="col">
              <div className="table-responsive">
                <table className="table text-nowrap">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>ID</th>
                      <th>Score</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedScoreData.map((score, index) => (
                      <tr key={score.playNo}>
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>{score.memberId}</td>
                        <td>{score.playScore}</td>
                        <td>{score.playLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* <button
                    className="btn btn-secondary"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    이전 페이지
                  </button>
                  <button
                    className="btn btn-secondary ms-2"
                    onClick={nextPage}
                    disabled={currentPage * pageSize >= scoreRanking.length}
                  >
                    다음 페이지
                  </button> */}
              </div>
            </div>
          </div>
        </div>
        </div>
    )}
    {showLevelRanking && (
        <div className="row mt-4 d-flex justify-content-center">
        <div className="col-6">
          <h2>Level Ranking</h2>
          <div className="row mt-2">
            <div className="col">
              <div className="table-responsive">
                <table className="table text-nowrap">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>ID</th>
                      <th>Score</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLevelData.map((level, index) => (
                      <tr key={level.playNo}>
                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                        <td>{level.memberId}</td>
                        <td>{level.playScore}</td>
                        <td>{level.playLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* <button
                    className="btn btn-secondary"
                    onClick={prevPage}
                    disabled={currentPage === 1}
                  >
                    이전 페이지
                  </button>
                  <button
                    className="btn btn-secondary ms-2"
                    onClick={nextPage}
                    disabled={currentPage * pageSize >= scoreRanking.length}
                  >
                    다음 페이지
                  </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
      <div className="row mt-4 d-flex justify-content-center">
        <div className="col-6">
          <h2>Search Result</h2>
          <div className="row mt-2">
            <div className="col">
              <div className="table-responsive">
                <table className="table text-nowrap">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>ID</th>
                      <th>Score</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchList.map((search, index) => (
                      <tr key={search.playNo}>
                        <td>{index + 1}</td>
                        <td>{search.memberId}</td>
                        <td>{search.playScore}</td>
                        <td>{search.playLevel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row mt-4 d-flex justify-content-center">
        <div className="col-6">
            <h3>아이디로 검색</h3>
        </div>
      </div>
      <div className="row mt-2 d-flex justify-content-center">
        <div className="col-6 d-flex">
            <input type="text" className="form-control me-2" placeholder="ID" value={keyword} onChange={changeKeyword}/>
            <button className="btn btn-success" onClick={searchById}>Search</button>
        </div>
      </div>
    </>
  );
};

export default Ranking;