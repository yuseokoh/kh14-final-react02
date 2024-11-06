import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { memberIdState } from "../../utils/recoil";
import styles from './PaymentListPage.module.css';
import { useTranslation } from 'react-i18next';
import { FaGamepad } from 'react-icons/fa'; // FaGamepad 아이콘 가져오기
const PaymentListPage = () => {
    const { i18n } = useTranslation(); // i18n 객체 가져오기
    const [payments, setPayments] = useState([]);
    const navigate = useNavigate();
    const memberId = useRecoilValue(memberIdState);

    useEffect(() => {
        const token = sessionStorage.getItem('refreshToken');
        if (memberId && token) {
            axios.get('/kakaopay/paymentList', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                params: { memberId }
            })
            .then(response => setPayments(response.data))
            .catch(error => console.error("결제 정보를 가져오는 중 오류가 발생했습니다."));
        }
    }, [memberId]);

   
    
    // paymentNo를 매개변수로 받도록 수정
    const handleViewDetails = (paymentNo) => {
        navigate(`/cancel-payment/${paymentNo}`);
    };
    // 날짜를 현재 로케일에 맞게 포맷팅하는 헬퍼 함수
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(i18n.language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        }).format(date);
    };

    return (
        <div className={styles.paymentListPage}>
             <h1>{memberId}님의 결제 내역</h1> {/* memberId 포함 */}
            {payments.length > 0 ? (
                <div className={styles.paymentGrid}>
                    {payments.map((payment, index) => (
                        <div key={index} className={styles.paymentCard}>
                            <div className={styles.paymentCardHeader}>
                            <h4><FaGamepad /> {payment.paymentName}</h4> {/* 아이콘 추가 */}
                            </div>
                            <div className={styles.paymentDetails}>
                                <span><strong>총액:</strong> 
                                    {payment.paymentTotal !== undefined 
                                        ? payment.paymentTotal.toLocaleString('ko-KR') 
                                        : '정보 없음'
                                    }원
                                </span>
                                <span><strong>회원 ID:</strong> {payment.paymentMemberId}</span>
                                <span><strong>결제 시간:</strong> {formatDate(payment.paymentTime)}</span>
                            </div>
                            <button onClick={() => handleViewDetails(payment.paymentNo)} className={styles.detailButton}>
                                상세보기
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>결제 내역이 없습니다.</p>
            )}
        </div>
    );
};

export default PaymentListPage;