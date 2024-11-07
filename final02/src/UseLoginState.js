import { useEffect } from "react";
import { useRecoilState } from "recoil";
import { memberIdState, memberLevelState } from "./utils/recoil";
import axios from "axios";

const UseLoginState = () => {
  // Recoil 상태
  const [memberId, setMemberId] = useRecoilState(memberIdState);
  const [memberLevel, setMemberLevel] = useRecoilState(memberLevelState);

  useEffect(() => {
    const refreshLogin = async () => {
      const sessionToken = sessionStorage.getItem("refreshToken");
      const localToken = localStorage.getItem("refreshToken");

      if (!sessionToken && !localToken) return;

      const refreshToken = sessionToken || localToken;
      try {
        const response = await axios.post("/member/refresh", {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });

        const { memberId, memberLevel, accessToken, refreshToken: newRefreshToken } = response.data;
        setMemberId(memberId);
        setMemberLevel(memberLevel);

        axios.defaults.headers.common["Authorization"] = "Bearer " + accessToken;
        if (localStorage.getItem("refreshToken")) {
          localStorage.setItem("refreshToken", newRefreshToken);
        } else {
          sessionStorage.setItem("refreshToken", newRefreshToken);
        }
      } catch (error) {
        console.error("로그인 상태 복원 실패: ", error);
        setMemberId("");
        setMemberLevel("");
        delete axios.defaults.headers.common["Authorization"];
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("refreshToken");
      }
    };

    refreshLogin();
  }, [setMemberId, setMemberLevel]);
};

export default UseLoginState;
