import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle } from 'react-icons/fi';
import styles from './CancelPaymentPage.module.css';
import LoginImage from './Login.jpg';
import { useTranslation } from 'react-i18next';

const CancelPaymentPage = () => {
  const { t, i18n } = useTranslation();
  const { paymentNo: paramPaymentNo } = useParams();
  const navigate = useNavigate();

  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCentralAlert, setShowCentralAlert] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    let paymentNo = window.sessionStorage.getItem('paymentNo');
    if (paymentNo && !isNaN(Number(paymentNo))) {
      paymentNo = Number(paymentNo);
    } else {
      setError(t('cancelPayment.invalidPaymentNo'));
      setLoading(false);
      return;
    }

    loadPaymentInfo(paymentNo);

    return () => clearTimeout(timer);
  }, [paramPaymentNo, t]);

  const loadPaymentInfo = useCallback(async (paymentNo) => {
    try {
      const token = sessionStorage.getItem('refreshToken');
      if (!token) {
        throw new Error(t('cancelPayment.noAuthToken'));
      }

      const response = await axios.get(
        `http://localhost:8080/kakaopay/detail/${paymentNo}`,
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

      const paymentNo = Number(paramPaymentNo);
      if (isNaN(paymentNo)) {
        throw new Error(t('cancelPayment.invalidPaymentNo'));
      }

      const response = await axios.delete(
        `http://localhost:8080/kakaopay/cancelAll/${paymentNo}`,
        {
          data: { reason: cancelReason }
        }
      );

      if (response.status === 200) {
        setTimeout(() => {
          setShowCentralAlert(true);
          loadPaymentInfo(paymentNo);
          setCancelReason('');
          setTimeout(() => {
            setShowCentralAlert(false);
          }, 3000);
        }, 3000);
      } else {
        throw new Error(t('cancelPayment.cancelRequestFailed'));
      }
    } catch (e) {
      console.error(t('cancelPayment.errorWhileCanceling'), e);
      setError(t('cancelPayment.errorWhileCanceling'));
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  }, [paramPaymentNo, loadPaymentInfo, cancelReason, t]);

  // Helper function to format date based on current locale
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
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="loader">
        <g className="dash">
                        <path style={{ "--sped": "4s" }} pathLength="360" d="M 31.9463 1 C 15.6331 1 2.2692 13.6936 1 29.8237 L 17.644 36.7682 C 19.0539 35.794 20.7587 35.2264 22.5909 35.2264 C 22.7563 35.2264 22.9194 35.231 23.0803 35.2399 L 30.4828 24.412 L 30.4828 24.2601 C 30.4828 17.7446 35.7359 12.4423 42.1933 12.4423 C 48.6507 12.4423 53.9038 17.7446 53.9038 24.2601 C 53.9038 30.7756 48.6507 36.08 42.1933 36.08 C 42.104 36.08 42.0168 36.0778 41.9275 36.0755 L 31.3699 43.6747 C 31.3766 43.8155 31.3811 43.9562 31.3811 44.0947 C 31.3811 48.9881 27.4374 52.9675 22.5909 52.9675 C 18.3367 52.9675 14.7773 49.902 13.9729 45.8443 L 2.068 40.8772 C 5.7548 54.0311 17.7312 63.6748 31.9463 63.6748 C 49.0976 63.6748 63 49.6428 63 32.3374 C 63 15.0297 49.0976 1 31.9463 1 Z" className="big"></path>
                    </g>
                    <path pathLength="360" d="M 31.9463 1 C 15.6331 1 2.2692 13.6936 1 29.8237 L 17.644 36.7682 C 19.0539 35.794 20.7587 35.2264 22.5909 35.2264 C 22.7563 35.2264 22.9194 35.231 23.0803 35.2399 L 30.4828 24.412 L 30.4828 24.2601 C 30.4828 17.7446 35.7359 12.4423 42.1933 12.4423 C 48.6507 12.4423 53.9038 17.7446 53.9038 24.2601 C 53.9038 30.7756 48.6507 36.08 42.1933 36.08 C 42.104 36.08 42.0168 36.0778 41.9275 36.0755 L 31.3699 43.6747 C 31.3766 43.8155 31.3811 43.9562 31.3811 44.0947 C 31.3811 48.9881 27.4374 52.9675 22.5909 52.9675 C 18.3367 52.9675 14.7773 49.902 13.9729 45.8443 L 2.068 40.8772 C 5.7548 54.0311 17.7312 63.6748 31.9463 63.6748 C 49.0976 63.6748 63 49.6428 63 32.3374 C 63 15.0297 49.0976 1 31.9463 1 Z" fill="#212121"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  if (!paymentInfo) {
    return <h1>{t('cancelPayment.loadingError')}</h1>;
  }

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
