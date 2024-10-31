import { useEffect, useState } from "react";
import TestGame from "./TestGame";
import { useRecoilValue } from "recoil";
import { memberIdState, memberLoadingState } from "../utils/recoil";
import axios from "axios";
import Ranking from "../components/play/Ranking";

const KHSurvival = () => {
  //state

  const memberId = useRecoilValue(memberIdState);

  return (
    <>
      <div className="row pt-4 pb-4"  style={{ backgroundColor: "#141d29", minHeight: "100vh" }}>
        <div className="col d-flex justify-content-center">
          <div>
            <h2>KH Survival</h2>
            <TestGame memberId={memberId} />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <Ranking />
          </div>
        </div>
      </div>
      {/* <div className="row pt-4" style={{ backgroundColor: "#141d29" }}>
      </div> */}
    </>
  );
};

export default KHSurvival;
