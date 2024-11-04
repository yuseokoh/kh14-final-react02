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
import PageNotFound from "./PageNotFound";
import AdminPaymentPage from "./payment/AdminPaymentPage";

const MainContent = () => {
    const { t } = useTranslation(); // 번역 훅 사용
    const login = useRecoilValue(loginState); //recoil에서 login 상태를 불러온다

    return (
        <>
            <div className="container-fluid">
                <div className="row my-5 pt-4">
                    <Routes>
                        <Route exact path="/" element={<Home />} />

                        {/* 프라이빗 라우터 적용 */}
                        <Route path="/game/add" element={<PrivateRoute element={<GameAdd />} />} />
                        <Route path="/game/edit/:gameNo" element={<PrivateRoute element={<GameEdit />} />} />
                        <Route path="/member/mypage/:memberId" element={<PrivateRoute element={<MyPage />} />} />
                        <Route path="/member/mypageedit/:memberId" element={<PrivateRoute element={<MyPageEdit />} />} />
                        <Route path="/cancel-payment/detail/:paymentNo" element={<PrivateRoute element={<CancelPaymentPage />} />} />
                        <Route path="/cart/success/:partnerOrderId" element={<PrivateRoute element={<PaymentSuccessPage />} />} />
                        <Route path="/friend/list" element={<PrivateRoute element={<FriendList />} />} />
                        <Route path="/friend/request" element={<PrivateRoute element={<FriendRequest />} />} />
                        <Route path="/community/add" element={<PrivateRoute element={<CommunityAdd />} />} />
                        <Route path="/community/edit/:communityNo" element={<PrivateRoute element={<CommunityEdit />} />} />
                        <Route path="/wishlist" element={<PrivateRoute element={<WishList />} />} />
                        <Route path="/cart" element={<PrivateRoute element={<ShoppingCart />} />} />
                        <Route path="/library" element={<PrivateRoute element={<Library />} />} />
                        <Route path="/testgame" element={<PrivateRoute element={<TestGame />} />} />
                        <Route path="/testgame2" element={<PrivateRoute element={<KHSurvival />} />} />
                        <Route path="/play" element={<PrivateRoute element={<Ranking />} />} />
                        <Route path="/websocket" element={<PrivateRoute element={<WebsocketClient />} />} />
                        <Route path="/room" element={<PrivateRoute element={<Chatroom />} />} />
                        <Route path="/room-chat/:roomNo" element={<PrivateRoute element={<Chat />} />} />
                        <Route path="/admin/payment" element={<PrivateRoute element={<AdminPaymentPage />} />} />

                        {/* 프라이빗 라우터가 필요 없는 공개 페이지들 */}
                        <Route path="/game/detail/:gameNo" element={<GameDetail />} />
                        <Route path="/game/category/action" element={<ActionGame />} />
                        <Route path="/game/category/adventure" element={<AdventureGame />} />
                        <Route path="/game/category/indie" element={<IndieGame />} />
                        <Route path="/game/category/multiplayer" element={<MultiPlayerGame />} />
                        <Route path="/game/category/openworld" element={<OpenWorldGame />} />
                        <Route path="/game/category/rpg" element={<RpgGame />} />
                        <Route path="/game/category/simulation" element={<SimulationGame />} />
                        <Route path="/game/category/fantasy" element={<Fantasy />} />
                        <Route path="/game/category/pixelgraphics" element={<PixelGraphics />} />
                        <Route path="/game/category/roguelike" element={<Roguelike />} />
                        <Route path="/game/category/sandbox" element={<SandBox />} />
                        <Route path="/game/category/survival" element={<Survival />} />
                        <Route path="/game/category/strategy" element={<StrategyGame />} />

                        <Route path="/member/MemberLogin" element={<MemberLogin />} />
                        <Route path="/member/signupPage" element={<SignupPage />} />
                        <Route path="/member/signupForm" element={<SignupForm />} />
                        <Route path="/community/list" element={<CommunityList />} />
                        <Route path="/community/detail/:communityNo" element={<CommunityDetail />} />
                        <Route path="/member/signup" element={<SingUp />} />
                        <Route path="/member/KakaoLoginPage" element={<KakaoLoginPage />} />
                        <Route path="/member/KakaoEmail" element={<KakaoEmail />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                        <Route path="/terms-of-use" element={<TermsOfUse />} />
                        <Route path="/steam-agreement" element={<SteamAgreement />} />
                        <Route path="/refund-policy" element={<RefundPolicy />} />

                        {/* 나머지 경로(*) 패턴을 지정해서 미 지정된 페이지를 모두 연결 */}
                        <Route path="*" element={<PageNotFound />} />
                    </Routes>
                </div>
            </div>
        </>
    );
};

export default MainContent;