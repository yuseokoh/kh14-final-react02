import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle } from 'react-icons/fi';
import styles from './CancelPaymentPage.module.css';
import LoginImage from './Login.jpg';
import { useTranslation } from 'react-i18next';

const CancelPaymentPage = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCentralAlert, setShowCentralAlert] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    // 쿼리 파라미터에서 paymentNo 가져오기
    const { paymentNo } = useParams();

   //(paymentNo);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000);

        if (!paymentNo || isNaN(Number(paymentNo))) {
            setError(t('cancelPayment.invalidPaymentNo'));
            setLoading(false);
            return;
        }

        loadPaymentInfo(Number(paymentNo));

        return () => clearTimeout(timer);
    }, [paymentNo, t]);

    const loadPaymentInfo = useCallback(async (paymentNo) => {
        try {
            const token = sessionStorage.getItem('refreshToken');
            if (!token) {
                throw new Error(t('cancelPayment.noAuthToken'));
            }

            const response = await axios.get(
                `/kakaopay/detail/${paymentNo}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (response.status === 200) {
                setPaymentInfo(response.data);
            } else if (response.status === 404) {
                setError(t('cancelPayment.paymentNotFound'));
            } else {
                setError(t('cancelPayment.unableToFetch'));
            }
        } catch (e) {
            setError(t('cancelPayment.unableToFetch'));
        }
    }, [t]);

    const handleCancelAllPayment = useCallback(async () => {
        try {
            setLoading(true);

            if (!paymentNo || isNaN(Number(paymentNo))) {
                throw new Error(t('cancelPayment.invalidPaymentNo'));
            }

            const token = sessionStorage.getItem('refreshToken');
            const response = await axios.delete(
                `/kakaopay/cancelAll/${paymentNo}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    data: { reason: cancelReason }
                }
            );

            if (response.status === 200) {
                setShowCentralAlert(true);
                loadPaymentInfo(Number(paymentNo));
                setCancelReason('');
                setTimeout(() => {
                    setShowCentralAlert(false);
                }, 3000);
            } else {
                throw new Error(t('cancelPayment.cancelRequestFailed'));
            }
        } catch (e) {
            setError(t('cancelPayment.errorWhileCanceling'));
        } finally {
            setLoading(false);
        }
    }, [paymentNo, loadPaymentInfo, cancelReason, t]);

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

    if (loading) {
        return (
            <div className="loading-container"
                style={{
                    backgroundImage: `url(${LoginImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    width: '100vw',
                    height: '100vh'
                }}
            >
                <div>Loading...</div>
            </div>
        );
    }

    if (error) {
        return <h1>{error}</h1>;
    }

    if (!paymentInfo) {
        return <h1>{t('cancelPayment.loadingError')}</h1>;
    }
    const handleGoToStore = () => navigate("/");


    return (
      <div className="mainContent" style={{ backgroundColor: '#1b2838', color: '#fff' }}>
        <div className={styles.paymentSummaryContainer}>
          <div className={styles.summaryItem} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
            <span className={styles.summaryLabel}>{t('cancelPayment.productName')}:</span>
            <span className={styles.summaryValue}>{paymentInfo.paymentDto.paymentName}</span>
          </div>
          {/* 나머지 요약 정보 항목들 */}
          <div className={styles.summaryItem} style={{ marginBottom: '20px' }}>
            <span className={styles.summaryLabel}>{t('cancelPayment.totalAmount')}:</span>
            <span className={styles.summaryValue}>{paymentInfo.paymentDto.paymentTotal}{t('cancelPayment.currency')}</span>
          </div>
          <div className={styles.summaryItem} style={{ marginBottom: '20px' }}>
            <span className={styles.summaryLabel}>{t('cancelPayment.buyerId')}:</span>
            <span className={styles.summaryValue}>{paymentInfo.responseVO.partner_user_id}</span>
          </div>
          <div className={styles.summaryItem} style={{ marginBottom: '20px' }}>
            <span className={styles.summaryLabel}>{t('cancelPayment.purchaseAmount')}:</span>
            <span className={styles.summaryValue}>{paymentInfo.responseVO.amount.total}{t('cancelPayment.currency')} ({t('cancelPayment.vatIncluded')}, {t('cancelPayment.vat')} {paymentInfo.responseVO.amount.vat}{t('cancelPayment.currency')})</span>
          </div>
          <div className={styles.summaryItem} style={{ marginBottom: '20px' }}>
            <span className={styles.summaryLabel}>{t('cancelPayment.canceledAmount')}:</span>
            <span className={styles.summaryValue}>{paymentInfo.responseVO.canceled_amount.total}{t('cancelPayment.currency')}</span>
          </div>
          <div className={styles.summaryItem} style={{ marginBottom: '20px' }}>
            <span className={styles.summaryLabel}>{t('cancelPayment.cancelAvailableAmount')}:</span>
            <span className={styles.summaryValue}>{paymentInfo.responseVO.cancel_available_amount.total}{t('cancelPayment.currency')}</span>
          </div>
          <div className={styles.summaryItem} style={{ marginBottom: '20px' }}>
            <span className={styles.summaryLabel}>{t('cancelPayment.paymentStartDate')}:</span>
            <span className={styles.summaryValue}>{formatDate(paymentInfo.responseVO.created_at)}</span>
          </div>
          <div className={styles.summaryItem} style={{ marginBottom: '20px' }}>
            <span className={styles.summaryLabel}>{t('cancelPayment.paymentEndDate')}:</span>
            <span className={styles.summaryValue}>{formatDate(paymentInfo.responseVO.approved_at)}</span>
          </div>
          {paymentInfo.responseVO.canceled_at !== null && (
            <div className={styles.summaryItem} style={{ marginBottom: '20px' }}>
              <span className={styles.summaryLabel}>{t('cancelPayment.canceledAt')}:</span>
              <span className={styles.summaryValue}>{formatDate(paymentInfo.responseVO.canceled_at)}</span>
            </div>
          )}
          {/* 취소사유 입력란 및 결제 취소 버튼을 결제취소일시가 null인 경우에만 표시 */}
          {paymentInfo.responseVO.canceled_at === null ? (
            <>
              <div className={styles.summaryItem}>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className={styles.summaryValue}
                  style={{
                    color: '#000',
                    backgroundColor: '#fff',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    width: '100%',
                    height: '50px',
                    resize: 'none'
                  }}
                  placeholder={t('cancelPayment.enterCancelReason')}
                  disabled={showCentralAlert}
                />
              </div>
              <button
                className={styles.cancelButton}
                disabled={cancelReason.trim() === '' || showCentralAlert}
                style={{
                  backgroundColor: cancelReason.trim() && !showCentralAlert ? '#c0392b' : '#555',
                  cursor: cancelReason.trim() && !showCentralAlert ? 'pointer' : 'not-allowed'
                }}
                onClick={handleCancelAllPayment}
              >
                {t('cancelPayment.cancelAll')}
              </button>
            </>
          ) : (
            <div className={styles.summaryItem}>
              <textarea
                className={styles.summaryValue}
                style={{
                  color: '#000',
                  backgroundColor: '#ccc',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #999',
                  width: '100%',
                  height: '50px',
                  resize: 'none'
                }}
                value={t('cancelPayment.canceledProduct')}
                disabled
              />
            </div>
            
          )}
            <button onClick={handleGoToStore} className={styles.mainButton}>
    {t('paymentSuccess.goToMainPage')}
  </button>
        </div>
     
  
        {showCentralAlert && (
          <div className={styles.centralAlert}>
            <div className={styles.iconContainer}>
              <FiCheckCircle size={50} color="#4caf50" />
            </div>
            <h2 className={styles.alertTitle}>{t('cancelPayment.cancelSuccess')}</h2>
            <p className={styles.alertMessage}>{t('cancelPayment.cancelSuccessMessage')}</p>
          </div>
        )}
      </div>
    );
  };
  
  export default CancelPaymentPage;