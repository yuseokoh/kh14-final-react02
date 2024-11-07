import React, { useEffect, useState, useCallback } from 'react'; 
import axios from 'axios';
import styles from './AdminPaymentPage.module.css';
import { useTranslation } from 'react-i18next';
import { FaGamepad, FaReceipt } from 'react-icons/fa';

const AdminPaymentPage = () => {
  const { t } = useTranslation();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberId, setMemberId] = useState('');
  const [totalSales, setTotalSales] = useState(0); // 총 매출 상태 추가

  // 총 매출을 가져오는 함수
  const loadTotalSales = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('refreshToken');
      if (!token) {
        throw new Error(t('adminPayment.noAuthToken'));
      }

      const response = await axios.get('/admin/total-sales', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTotalSales(response.data);
    } catch (e) {
      console.error(t('adminPayment.unableToFetchSales'), e);
      setError(t('adminPayment.unableToFetchSales'));
    }
  }, [t]);

  // 결제 내역을 가져오는 함수
  const loadPayments = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('refreshToken');
      if (!token) {
        throw new Error(t('adminPayment.noAuthToken'));
      }

      const response = await axios.get('/admin/payments', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          memberId,
        },
      });

      // 결제 상태가 '승인'인 경우만 필터링하여 설정
      const approvedPayments = response.data.filter(payment => payment.paymentStatus === '승인');
      
      setPayments(approvedPayments);
      setPayments(response.data);
    } catch (e) {
      setError(t('adminPayment.unableToFetch'));
    } finally {
      setLoading(false);
    }
  }, [t, memberId]);

  useEffect(() => {
    loadPayments();
    loadTotalSales();
  }, [loadPayments, loadTotalSales]);

  const handleSearch = () => {
    setLoading(true);
    loadPayments();
    loadTotalSales();
  };

  if (loading) {
    return <div>{t('loading')}</div>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  return (
    <div className={styles.adminPaymentPage}>
      <div className={styles.headerSection}>
        
      </div>
   

      {/* 총 매출을 표시하는 부분 */}
      <div className={styles.totalSalesSection}>
        <h3><FaReceipt /> {t('adminPayment.totalSales')}: {totalSales.toLocaleString('ko-KR')}원</h3>
      </div>

      <div className={styles.paymentListSection}>
        {payments.length > 0 ? (
          <div className={styles.paymentGrid}>
            {payments.map((payment, index) => (
              <div key={index} className={styles.paymentCard}>
                <div className={styles.paymentCardHeader}>
                  <h4><FaGamepad /> {payment.paymentName}</h4>
                </div>
                <div className={styles.paymentDetails}>
                  <span><strong>{t('adminPayment.totalAmount')}:</strong> {payment.paymentTotal.toLocaleString('ko-KR')}원</span>
                  <span><strong>{t('adminPayment.buyerId')}:</strong> {payment.paymentMemberId}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <h1>{t('adminPayment.noPaymentInfo')}</h1>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentPage;