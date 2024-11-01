import React from 'react';
import { NavLink } from "react-router-dom";
import styles from './Footer.module.css';
import { useTranslation } from 'react-i18next';
import { memberIdState, memberLevelState } from '../../utils/recoil';
import { useRecoilValue } from 'recoil';

const Footer = () => {
  const { t } = useTranslation();
  const memberLevel = useRecoilValue(memberLevelState);
  const memberId = useRecoilValue(memberIdState);

  return (
    <footer className={styles.footerContainer}>
      <div className={styles.footerContent}>
        <div className={styles.footerCopyright}>
          <p>© 2024 Valve Corporation. {t('footer.allRightsReserved')}<br/>
          {t('footer.vatIncluded')} | <NavLink to="/privacy-policy" className={styles.footerLink}>{t('footer.privacyPolicy')}</NavLink> | 
          <NavLink to="/terms-of-use" className={styles.footerLink}>{t('footer.termsOfUse')}</NavLink> | 
          <NavLink to="/steam-agreement" className={styles.footerLink}>{t('footer.steamAgreement')}</NavLink> | 
          <NavLink to="/refund-policy" className={styles.footerLink}>{t('footer.refundPolicy')}</NavLink> | 
           {/* 일반회원인 경우에만 개발자 요청 링크 표시 */}
           {memberLevel === "일반회원" && (
              <NavLink 
                to={`/developer-request/${memberId}`} 
                className={`${styles.footerLink} ${styles.developerRequest}`}
              >
                authority request
              </NavLink>
            )}
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;
