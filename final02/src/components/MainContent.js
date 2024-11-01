import { Routes, Route } from "react-router";
import Home from './Home';
import { useRecoilValue } from "recoil";
import { loginState } from "../utils/recoil";
import MemberLogin from "./member/MemberLogin";


import PaymentSuccessPage from "./payment/PaymentSuccessPage";
import CancelPaymentPage from "./payment/CancelPaymentPage";
import PrivateRoute from "../router/PrivateRoute";

import WishList from "./wishlist/WishList";
import ShoppingCart from "./shoppingcart/ShoppingCart";  // ShoppingCart 사용

import FriendRequest from "./friend/FriendRequest";
import FriendList from "./friend/FriendList";

import SingUp from './member/SingUp';
import SignupPage from './member/SignupPage';
import SignupForm from './member/SignupForm';
import KakaoLoginPage from './member/KakaoLoginPage';
import KakaoEmail from './member/KakaoEmail';
import { useTranslation } from 'react-i18next';
import CommunityList from "./community/CommunityList";
import CommunityAdd from "./community/CommunityAdd";
import CommunityEdit from "./community/CommunityEdit";
import CommunityDetail from "./community/CommunityDetail";
import CommunitySearch from "./community/CommunitySearch";


import PrivacyPolicy from "../components/footer/PrivacyPolicy";
import TermsOfUse from "../components/footer/TermsOfUse";
import SteamAgreement from "../components/footer/SteamAgreement";
import RefundPolicy from "../components/footer/RefundPolicy";
import GameAdd from "./game/GameAdd";
import GameDetail from "./game/GameDetail";
import GameEdit from "./game/GameEdit";

import ActionGame from "./game/gamecategory/ActionGame";
import AdventureGame from "./game/gamecategory/AdventureGame";
import IndieGame from "./game/gamecategory/IndieGame";
import MultiPlayerGame from "./game/gamecategory/MultiPlayerGame";
import OpenWorldGame from "./game/gamecategory/OpenWorldGame";
import RpgGame from "./game/gamecategory/RpgGame";
import SimulationGame from "./game/gamecategory/SimulationGame";
import StrategyGame from "./game/gamecategory/StrategyGame";
import BaseBuilding from "./game/gamecategory/BaseBuilding";
import Fantasy from "./game/gamecategory/Fantasy";
import PixelGraphics from "./game/gamecategory/PixelGraphics";
import Roguelike from "./game/gamecategory/Roguelike";
import Survival from "./game/gamecategory/Survival";
import SandBox from "./game/gamecategory/Sandbox";
import Library from "../components/library/Library";
import TestGame from "../gameComponents/TestGame";
import KHSurvival from "../gameComponents/KHSurvival";
import MyPage from "./member/MyPage";
import MyPageEdit from "./member/MyPageEdit";
import Ranking from "./play/Ranking";
import Chat from "./chat/Chat";
import WebsocketClient from "./websocket/WebsocketClient";
import Chatroom from "./chat/Chatroom";





const MainContent = () => {
    const { t } = useTranslation(); // 번역 훅 사용
    const login = useRecoilValue(loginState); //recoil에서 login 상태를 불러온다

    return (<>
        <div className="container-fluid">
            <div className="row my-5 pt-4">
                <Routes>
                    <Route exact path="/" element={<Home />} />

                     {/* 로그인이 필요한 페이지라면 element에 PrivateRoute를 적어서 대상을 명시하면 된다 */}
                    {/* 게임 처리 */}
                    <Route path="/game/add" element={<GameAdd />} />
                    <Route path="/game/detail/:gameNo" element={<GameDetail />} />
                    <Route path="/game/edit/:gameNo" element={<GameEdit />} />


                     {/* 게임카테고리 */}
                    <Route path="/game/category/action" element={<ActionGame />} />
                    <Route path="/game/category/adventure" element={<AdventureGame />} />
                    <Route path="/game/category/indie" element={<IndieGame />} />
                    <Route path="/game/category/multiplayer" element={<MultiPlayerGame />} />
                    <Route path="/game/category/openworld" element={<OpenWorldGame />} />
                    <Route path="/game/category/rpg" element={<RpgGame />} />
                    <Route path="/game/category/simulation" element={<SimulationGame />} />
                    <Route path="/game/category/basebuilding" element={<BaseBuilding />} />
                    <Route path="/game/category/fantasy" element={<Fantasy />} />
                    <Route path="/game/category/pixelgraphics" element={<PixelGraphics />} />
                    <Route path="/game/category/roguelike" element={<Roguelike />} />
                    <Route path="/game/category/sandbox" element={<SandBox />} />
                    <Route path="/game/category/survival" element={<Survival />} />
                    <Route path="/game/category/strategy" element={<StrategyGame />} />



                    {/* 게임 테마 */}


                    {/* 경로변수를 사용할 경우 콜론과 이름을 합쳐 변수명으로 지정 */}

                    {/* 기존 : 일반 라우팅 */}
                    {/* <Route path="/search/autocomplete" element={<AutoComplete/>}/> */}
                    {/* <Route path="/search/autocomplete2" element={<AutoComplete2/>}/> */}
                    {/* <Route path="/search/member" element={<MemberComplexSearch/>}/> */}

                    {/* 변경 : 중첩 라우팅 */}

                    {/* 회원 로그인 */}
                    <Route path="/member/MemberLogin" element={<MemberLogin />} />
                    {/* 회원가입 이메일 입력 */}
                    <Route path="/member/signupPage" element={<SignupPage />} />
                    {/* 회원가입 아이디 비밀번호입력 */}
                    <Route path="/member/signupForm" element={<SignupForm />} />
                    {/* 마이페이지 */}
                    <Route path="/member/mypage/:memberId" element={<MyPage />} />
                    <Route path="/member/mypageedit/:memberId" element={<MyPageEdit />} />

                    {/* 결제 */}

                    <Route path="/cancel-payment/detail/:paymentNo" element={<CancelPaymentPage />} />
                    <Route path="/cart/success/:partnerOrderId" element={<PaymentSuccessPage />} />


                    {/* 친구목록 */}
                    <Route path="/friend/list" element={<FriendList />} />
                    <Route path="/friend/request" element={<FriendRequest />} />


                    {/* 커뮤니티(게시판) */}
                    <Route path="/community/list" element={<CommunityList />} />
                    <Route path="/community/add" element={<CommunityAdd />} />
                    <Route path="/community/edit/:communityNo" element={<CommunityEdit />} />
                    <Route path="/community/detail/:communityNo" element={<CommunityDetail />} />
                    <Route path="/community/search/title/:keyword" element={<CommunitySearch />} />

                    {/* 회원가입 */}
                    <Route path="/member/signup" element={<SingUp />} />
                    {/* 카카오로그인 테스트 */}
                    <Route path="/member/KakaoLoginPage" element={<KakaoLoginPage />} />
                    <Route path="/member/KakaoEmail" element={<KakaoEmail/>}/>
                    {/* 찜 */}
                    <Route path="/wishlist" element={<WishList />} />

                    {/* 장바구니 */}
                    <Route path="/cart" element={<ShoppingCart />} />  {/* ShoppingCart로 통일 */}

                    {/* 라이브러리 */}
                    <Route path="/library" element={<Library />} />  {/* ShoppingCart로 통일 */}

                    {/* 테스트 게임 */}
                    <Route path="/testgame" element={<TestGame />} />  
                    <Route path="/testgame2" element={<KHSurvival />} />  
                    <Route path="/play" element={<Ranking />} />  

                    {/* 웹소켓 */}
                    <Route path="/websocket" element={<WebsocketClient />} />  
                    <Route path="/room" element={<Chatroom />} />  
                    <Route path="/room-chat/:roomNo" element={<Chat />} />  

                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-use" element={<TermsOfUse />} />
                    <Route path="/steam-agreement" element={<SteamAgreement />} />
                    <Route path="/refund-policy" element={<RefundPolicy />} />


                    {/* 나머지 경로(*) 패턴을 지정해서 미 지정된 페이지를 모두 연결 */}
                </Routes>
            </div>
        </div>
    </>);
};

export default MainContent;