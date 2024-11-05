import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { memberIdState, loginState } from '../../utils/recoil';
import axios from 'axios';
import styles from './MemberLevelRequest.module.css';

const MemberLevelRequest = () => {
    const { memberId } = useParams();
    const navigate = useNavigate();
    const isLoggedIn = useRecoilValue(loginState);
    const currentMemberId = useRecoilValue(memberIdState);
    
    const [requestData, setRequestData] = useState({
        requestReason: ''
    });
    
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 접근 권한 확인
    useEffect(() => {
        if (!isLoggedIn || currentMemberId !== memberId) {
            navigate('/');
            return;
        }
    }, [isLoggedIn, currentMemberId, memberId, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRequestData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
    
        try {
            const token = sessionStorage.getItem('refreshToken');
            await axios.post(
                `http://localhost:8080/member/developer-request`, 
                {
                    memberId: memberId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
    
            alert('개발자 권한 요청이 성공적으로 제출되었습니다.');
            navigate('/');
        } catch (error) {
            if (error.response?.status === 409) {
                setError('이미 개발자 권한 요청이 진행 중입니다.');
            } else {
                setError('요청 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={styles.requestContainer}>
            <h2>개발자 권한 요청</h2>
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.buttonGroup}>
                <button 
                    onClick={handleSubmit} 
                    className={styles.submitButton}
                    disabled={loading}
                >
                    {loading ? '요청 중...' : '개발자 권한 요청'}
                </button>
                <button
                    onClick={() => navigate('/')}
                    className={styles.cancelButton}
                >
                    취소
                </button>
            </div>
        </div>
    );
};

export default MemberLevelRequest;