/*
    (주의)
    React는 한 페이지이므로 a태그로 이동 설정하지 않는다
    대신, rect-router-dom에 있는 <NavLink to=주소>를 사용
    NavLink는 Router의 상황에 맞는 주소를 생성하며, a태그로 변환된다
*/

import { NavLink, useNavigate } from "react-router-dom";
import { loginState, memberIdState, memberLevelState, kakaoIdState, kakaoAccessTokenState } from "../utils/recoil";
import { useRecoilState, useRecoilValue } from "recoil";
import { useCallback, useState, useEffect } from 'react';
import axios from "axios";
import steamLogo from './steamlogo.svg';
import styles from './Menu.module.css';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';

// NotificationMenu 컴포넌트를 Menu 컴포넌트 외부로 이동
const NotificationMenu = () => {
    // 관리자 알림 관련 상태 추가
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasNewNotifications, setHasNewNotifications] = useState(false);
    const memberLevel = useRecoilValue(memberLevelState);
    const navigate = useNavigate();

    // 관리자인 경우 개발자 권한 요청 목록 조회
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get("http://localhost:8080/member/admin/developer-requests", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                });
                setNotifications(response.data);
                setHasNewNotifications(response.data.some(notif => !notif.isRead));
            } catch (error) {
                console.error("알림 조회 실패:", error);
            }
        };

        if (memberLevel === "관리자") {
            fetchNotifications();
            const intervalId = setInterval(fetchNotifications, 60000);
            return () => clearInterval(intervalId);
        }
    }, [memberLevel]);

    if (memberLevel !== "관리자") return null;

    return (
        <div className={styles.notificationContainer}>
            <button
                className={styles.notificationButton}
                onClick={() => setShowNotifications(!showNotifications)}
                title="개발자 권한 요청 알림"
            >
                <FontAwesomeIcon 
                    icon={faEnvelope} 
                    className={hasNewNotifications ? styles.hasNewNotifications : ''}
                />
                {hasNewNotifications && (
                    <span className={styles.notificationBadge}></span>
                )}
            </button>

            {showNotifications && (
                <div className={styles.notificationDropdown}>
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.memberId}
                                className={`${styles.notificationItem} ${!notification.isRead ? styles.unread : ''}`}
                                onClick={() => navigate(`/member/admin/edit/${notification.memberId}`)}
                            >
                                <p>{notification.memberId}님의 개발자 권한 요청</p>
                                <small>{new Date(notification.requestDate).toLocaleDateString()}</small>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noNotifications}>새로운 알림이 없습니다</p>
                    )}
                </div>
            )}
        </div>
    );
};

const Menu = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    //recoil state
    const [memberId, setMemberId] = useRecoilState(memberIdState);
    const [memberLevel, setMemberLevel] = useRecoilState(memberLevelState);
    const [kakaoId, setKakaoId] = useRecoilState(kakaoIdState);
    const [kakaoAccessToken, setKakaoAccessToken] = useRecoilState(kakaoAccessTokenState);
    const login = useRecoilValue(loginState);

    // 로그아웃 기능 수정
    const logout = useCallback((e) => {
        // recoil에 저장된 memberId와 memberLevel을 제거
        setMemberId("");
        setMemberLevel("");
        setKakaoId("");
        setKakaoAccessToken("");

        // axios에 설정된 Authorization 헤더도 제거
        delete axios.defaults.headers.common["Authorization"];

        // localStorage, sessionStorage의 refreshToken 및 jwtToken 제거
        window.localStorage.removeItem("refreshToken");
        window.sessionStorage.removeItem("refreshToken");
        window.localStorage.removeItem("jwtToken");
        window.localStorage.removeItem("kakaoAccessToken");
        window.localStorage.removeItem("kakaoId");

        // 카카오 로그인 관련 토큰 제거
        const kakaoAccessToken = window.localStorage.getItem("kakaoAccessToken");
        if (kakaoAccessToken) {
            // 카카오 로그아웃 요청 부분 수정
            axios.get("https://kapi.kakao.com/v1/user/logout", {
                headers: {
                    Authorization: `Bearer ${kakaoAccessToken}`
                }
            })
                .then(response => {
                    console.log("카카오 로그아웃 성공", response);
                    window.localStorage.removeItem("kakaoAccessToken");
                    window.localStorage.removeItem("kakaoId");
                })
                .catch(error => {
                    console.error("카카오 로그아웃 실패", error);
                });
        } else {
            console.warn("카카오 액세스 토큰이 없습니다.");
        }

        // 페이지 이동
        navigate("/");
    }, [setMemberId, setMemberLevel, setKakaoId, setKakaoAccessToken, kakaoAccessToken, navigate]);

    return (
        <>
            <nav className={`navbar navbar-expand-lg fixed-top ${styles.navbar}`} data-bs-theme="dark">
                <div className={`container ${styles.container}`}>
                    <NavLink className="navbar-brand" to="/">
                        <img src={steamLogo} alt="Steam" height={"50px"} />
                    </NavLink>

                    <button className="navbar-toggler" type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#top-menu"
                        aria-controls="top-menu"
                        aria-expanded="false"
                        aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="top-menu">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown" href="#" role="button"
                                    aria-haspopup="true" aria-expanded="false">{t('menu.shop')}</a>
                                <div className="dropdown-menu">
                                    <NavLink className="dropdown-item" to="/game/add">{t('add')}</NavLink>
                                    <NavLink className="dropdown-item" to="/game/detail/:gameNo">{t('detail')}</NavLink>
                                    <NavLink className="dropdown-item" to="/game/edit/:gameNo">{t('edit')}</NavLink>
                                </div>
                            </li>

                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle"
                                    data-bs-toggle="dropdown" href="#" role="button"
                                    aria-haspopup="true" aria-expanded="false">{t('menu.community')}</a>
                                <div className="dropdown-menu">
                                    <NavLink className="dropdown-item" to="/community/list">{t('menu.community')}</NavLink>
                                </div>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link"
                                    data-bs-toggle="dropdown" to="/" role="button"
                                    aria-haspopup="true" aria-expanded="false">{t('menu.info')}</a>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link"
                                    data-bs-toggle="dropdown" to="/" role="button"
                                    aria-haspopup="true" aria-expanded="false">{t('menu.support')}</a>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/member/KakaoLoginPage">카카오로그인 테스트</NavLink>
                            </li>

                            {login ? (<>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/member/mypage/:memberId">
                                    {memberId} ({memberLevel})
                                </NavLink>
                            </li>
                            
                            {/* 관리자 알림 메뉴를 여기로 이동하고 스타일 통일 */}
                            {memberLevel === "관리자" && (
                                <li className="nav-item">
                                    <div className={`nav-link ${styles.notificationWrapper}`}>
                                        <NotificationMenu />
                                    </div>
                                </li>
                            )}
                            
                            <li className="nav-item">
                                <NavLink className="nav-link" to="#" onClick={logout}>
                                    {t('menu.logout')}
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/wishlist">
                                    {t('menu.wishlist')}
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/cart">
                                    {t('menu.cart')}
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/library">
                                    {t('menu.library')}
                                </NavLink>
                            </li>
                        </>) : (<>
                                <li className="nav-item">
                                    <NavLink className="nav-link" to="/member/MemberLogin">
                                        <i className="fa-solid fa-right-to-bracket"></i>
                                        {t('menu.login')}
                                    </NavLink>
                                </li>
                            </>)}
                        </ul>
                        <LanguageSelector />
                    </div>
                </div>
            </nav>
        </>
    );
};

export default Menu;