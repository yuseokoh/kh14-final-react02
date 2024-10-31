/*
    Recoil을 이용한 통합 저장소
    - 전체 컴포넌트에 영향을 미칠 수 있는 데이터를 이곳에 저장
    - 대표적으로, 기존 레거시 웹에서의 HttpSession을 여기에 구현
    - 그렇다고 HttpSession은 아니며, 보안수준도 높지 않다
    - atom, selector라는 명령을 이용해서 필요한 구조를 구현
    - atom은 state처럼 사용할 데이터를 생성할 때 사용
    - selector는 atom으로 만들어내는 연관계산항목을 생성할 때 사용
    - 한줄요약 - atom(=state), selector(=memo)
*/

import {atom, selector} from "recoil";

const countState = atom({
    key: "countState", //식별자(ID)
    default: 0,//초기값
});
export {countState};

//로그인 상태 - 회원ID, 회원 등급
const memberIdState = atom({
    key:"memberIdState",
    default: ""
});
const memberLevelState = atom({
    key:"memberLevelState",
    default:""
});

const kakaoIdState = atom({
    key: "kakaoIdState",
    default: "",
});
const kakaoAccessTokenState = atom({
    key: "kakaoAccessTokenState",
    default: "",
});

// 로그인 상태 계산 - get: (state)를 유지한 형태
const loginState = selector({
    key: "loginState",
    get: ({ get }) => {
        // memberId, memberLevel, kakaoId 값을 가져옴
        const memberId = get(memberIdState);
        const memberLevel = get(memberLevelState);
        const kakaoId = get(kakaoIdState);

        // 조건: memberId, memberLevel, kakaoId 중 하나라도 값이 있으면 로그인 상태
        return (memberId.length > 0 && memberLevel.length > 0) || kakaoId.length > 0;
    }
});

export {
    memberIdState,
    memberLevelState,
    kakaoIdState,
    kakaoAccessTokenState,
    loginState
};

//로그인 처리 완료 여부
const memberLoadingState = atom({
    key:"memberLoadingState",
    default:false
});
export {memberLoadingState};