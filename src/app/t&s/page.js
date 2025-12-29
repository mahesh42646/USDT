'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import { PLATFORM_NAME, CONTACT_EMAIL, CONTACT_PHONE } from '@/utils/constants';
import styles from './page.module.css';

export default function TermsPage() {
  const heroRef = useRef(null);
  const [activeSection, setActiveSection] = useState('acceptance');
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-100px' },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.1 }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms', icon: 'bi-file-text' },
    { id: 'account', title: 'Account Registration', icon: 'bi-person-plus' },
    { id: 'investment', title: 'Investment Terms', icon: 'bi-wallet2' },
    { id: 'interest', title: 'Interest & Rewards', icon: 'bi-graph-up' },
    { id: 'withdrawal', title: 'Withdrawal Terms', icon: 'bi-cash-coin' },
    { id: 'obligations', title: 'User Obligations', icon: 'bi-shield-check' },
    { id: 'rights', title: 'Platform Rights', icon: 'bi-gear' },
    { id: 'risk', title: 'Risk Disclosure', icon: 'bi-exclamation-triangle' },
    { id: 'liability', title: 'Limitation of Liability', icon: 'bi-shield-x' },
    { id: 'termination', title: 'Account Termination', icon: 'bi-x-circle' },
    { id: 'dispute', title: 'Dispute Resolution', icon: 'bi-gavel' },
    { id: 'changes', title: 'Changes to Terms', icon: 'bi-arrow-repeat' },
    { id: 'contact', title: 'Contact Information', icon: 'bi-envelope' },
  ];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  return (
    <div className={styles.termsPage}>
      <UserHeader />
      
      {/* Hero Section */}
      <section 
        ref={heroRef} 
        className={styles.heroSection}
        style={{ 
          backgroundImage: `linear-gradient(135deg, rgba(70, 35, 154, 0.9), rgba(74, 85, 104, 0.85)), url('/herobg.jpg')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <motion.div 
          style={{ y, opacity }}
          className="container"
        >
          <div className="row align-items-center justify-content-center">
            <div className="col-12 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={styles.heroContent}
              >
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={styles.heroBadge}
                >
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Legal Document
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={styles.heroTitle}
                >
                  Terms of Service
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={styles.heroSubtitle}
                >
                  Please read these terms carefully before using our platform
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className={styles.heroUnderline}
                ></motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Terms Content */}
      <section className={`py-5 ${styles.contentSection}`}>
        <div className="container-fluid">
          <div className="row">
            {/* Sidebar Navigation */}
            <div className="col-lg-3">
              <div className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                  <h5 className="fw-bold mb-3">
                    <i className="bi bi-list-ul me-2"></i>
                    Quick Navigation
                  </h5>
                  <p className="text-muted small mb-0">
                    <i className="bi bi-calendar3 me-2"></i>
                    Updated: {lastUpdated}
                  </p>
                </div>
                <nav className={styles.sidebarNav}>
                  {sections.map((section, index) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`${styles.navItem} ${activeSection === section.id ? styles.active : ''}`}
                    >
                      <span className={styles.navNumber}>{String(index + 1).padStart(2, '0')}</span>
                      <div className={styles.navContent}>
                        <i className={`bi ${section.icon} ${styles.navIcon}`}></i>
                        <span>{section.title}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="col-lg-9">
              <motion.div
                {...staggerContainer}
                className={styles.contentGrid}
              >
                {/* Section 1 */}
                <motion.div {...staggerItem} id="acceptance" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>01</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-file-text me-2"></i>
                      Acceptance of Terms
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <p>
                      By accessing and using {PLATFORM_NAME} ("the Platform", "we", "us", or "our"), you accept 
                      and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these 
                      Terms, you must not use our services.
                    </p>
                    <p>
                      These Terms constitute a legally binding agreement between you and {PLATFORM_NAME}. 
                      We reserve the right to modify these Terms at any time, and such modifications shall be 
                      effective immediately upon posting on the Platform.
                    </p>
                  </div>
                </motion.div>

                {/* Section 2 */}
                <motion.div {...staggerItem} id="account" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>02</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-person-plus me-2"></i>
                      Account Registration and Requirements
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.subsectionTitle}>Account Creation</h3>
                    <p>To use our services, you must:</p>
                    <ul className={styles.featureList}>
                      <li><i className="bi bi-check-circle-fill"></i> Register with a valid mobile phone number</li>
                      <li><i className="bi bi-check-circle-fill"></i> Complete OTP verification</li>
                      <li><i className="bi bi-check-circle-fill"></i> Provide accurate information</li>
                      <li><i className="bi bi-check-circle-fill"></i> Be at least 18 years of age</li>
                    </ul>
                    <h3 className={styles.subsectionTitle}>One Account Per User</h3>
                    <p>Each user is permitted to maintain only one account. Creating multiple accounts is strictly prohibited and will result in permanent account suspension.</p>
                    <h3 className={styles.subsectionTitle}>Account Security</h3>
                    <p>You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.</p>
                  </div>
                </motion.div>

                {/* Section 3 */}
                <motion.div {...staggerItem} id="investment" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>03</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-wallet2 me-2"></i>
                      Investment Terms and Conditions
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.highlightBox}>
                      <h4><i className="bi bi-info-circle me-2"></i>Minimum Investment</h4>
                      <p className="mb-0">The minimum investment amount is <strong>10 USDT</strong>. All investments are cumulative.</p>
                    </div>
                    <h3 className={styles.subsectionTitle}>Investment Methods</h3>
                    <p>All investments must be made using USDT (TRC20) cryptocurrency. You are responsible for ensuring valid transactions and paying network fees.</p>
                    <h3 className={styles.subsectionTitle}>Special Investor Plan</h3>
                    <p>Users investing <strong>10,000 USDT or more</strong> qualify for a fixed <strong>1% daily interest rate</strong>.</p>
                  </div>
                </motion.div>

                {/* Section 4 */}
                <motion.div {...staggerItem} id="interest" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>04</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-graph-up me-2"></i>
                      Interest Calculation and Rewards
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <div className="row g-3 mb-4">
                      <div className="col-md-4">
                        <div className={styles.statCard}>
                          <h3>0.50%</h3>
                          <p>Base Daily Rate</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className={styles.statCard}>
                          <h3>2.00%</h3>
                          <p>Maximum Rate</p>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className={styles.statCard}>
                          <h3>1.00%</h3>
                          <p>Special Investor</p>
                        </div>
                      </div>
                    </div>
                    <p><strong>Important:</strong> Interest is <strong>NOT compounded</strong> - calculated only on principal investment.</p>
                    <h3 className={styles.subsectionTitle}>Referral Income</h3>
                    <p>Referral income is directly added to investment balance only, not paid in cash. Percentage slabs: 10-49 (0.5%), 50-90 (1.0%), 91-120 (1.5%), 121-150 (2.0%), 151+ (3.0%).</p>
                  </div>
                </motion.div>

                {/* Section 5 */}
                <motion.div {...staggerItem} id="withdrawal" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>05</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-cash-coin me-2"></i>
                      Withdrawal Terms and Conditions
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.warningBox}>
                      <h4><i className="bi bi-lock-fill me-2"></i>Withdrawal Lock</h4>
                      <p className="mb-0">Withdrawals are locked until total investment reaches <strong>500 USDT</strong>.</p>
                    </div>
                    <ul className={styles.featureList}>
                      <li><i className="bi bi-check-circle-fill"></i> Minimum: 20 USDT</li>
                      <li><i className="bi bi-check-circle-fill"></i> Maximum: 30% of monthly interest</li>
                      <li><i className="bi bi-check-circle-fill"></i> Frequency: One per month</li>
                      <li><i className="bi bi-check-circle-fill"></i> Processing: Within 24 hours</li>
                    </ul>
                    <p>All network/gas fees are paid by the user.</p>
                  </div>
                </motion.div>

                {/* Section 6 */}
                <motion.div {...staggerItem} id="obligations" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>06</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-shield-check me-2"></i>
                      User Obligations and Prohibited Activities
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.subsectionTitle}>Prohibited Activities</h3>
                    <p>You agree NOT to:</p>
                    <ul className={styles.featureList}>
                      <li><i className="bi bi-x-circle-fill"></i> Create multiple accounts</li>
                      <li><i className="bi bi-x-circle-fill"></i> Engage in fraudulent activities</li>
                      <li><i className="bi bi-x-circle-fill"></i> Manipulate referral system</li>
                      <li><i className="bi bi-x-circle-fill"></i> Use automated systems or bots</li>
                    </ul>
                    <h3 className={styles.subsectionTitle}>Account Inactivity</h3>
                    <p>Accounts inactive for <strong>60 days</strong> will have interest calculations paused.</p>
                  </div>
                </motion.div>

                {/* Section 7 */}
                <motion.div {...staggerItem} id="rights" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>07</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-gear me-2"></i>
                      Platform Rights and Modifications
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <p>We reserve the right to:</p>
                    <ul className={styles.featureList}>
                      <li><i className="bi bi-arrow-right-circle-fill"></i> Modify or suspend platform features</li>
                      <li><i className="bi bi-arrow-right-circle-fill"></i> Update terms with prior notice</li>
                      <li><i className="bi bi-arrow-right-circle-fill"></i> Freeze accounts violating Terms</li>
                      <li><i className="bi bi-arrow-right-circle-fill"></i> Review large withdrawals manually</li>
                    </ul>
                  </div>
                </motion.div>

                {/* Section 8 */}
                <motion.div {...staggerItem} id="risk" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>08</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      Risk Disclosure and Disclaimer
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.alertBox}>
                      <h4><i className="bi bi-exclamation-triangle-fill me-2"></i>Important Notice</h4>
                      <p>Investment in cryptocurrency involves substantial risk. Returns are variable and not guaranteed. You may lose part or all of your investment.</p>
                    </div>
                    <p>You should only invest funds that you can afford to lose. This is a digital reward and participation model.</p>
                  </div>
                </motion.div>

                {/* Section 9 */}
                <motion.div {...staggerItem} id="liability" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>09</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-shield-x me-2"></i>
                      Limitation of Liability
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <p>To the maximum extent permitted by law, {PLATFORM_NAME} shall not be liable for indirect, incidental, or consequential damages. Our total liability shall not exceed the amount you have invested.</p>
                  </div>
                </motion.div>

                {/* Section 10 */}
                <motion.div {...staggerItem} id="termination" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>10</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-x-circle me-2"></i>
                      Account Termination
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <p>You may terminate your account at any time. We reserve the right to suspend or terminate accounts that violate these Terms.</p>
                  </div>
                </motion.div>

                {/* Section 11 */}
                <motion.div {...staggerItem} id="dispute" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>11</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-gavel me-2"></i>
                      Dispute Resolution
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <p>Disputes shall be resolved through initial contact with support, mediation if needed, and binding arbitration if required.</p>
                  </div>
                </motion.div>

                {/* Section 12 */}
                <motion.div {...staggerItem} id="changes" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>12</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-arrow-repeat me-2"></i>
                      Changes to Terms of Service
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <p>We reserve the right to modify these Terms at any time. Material changes will be communicated via email or platform notifications. Continued use constitutes acceptance.</p>
                  </div>
                </motion.div>

                {/* Section 13 */}
                <motion.div {...staggerItem} id="contact" className={styles.termCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardNumber}>13</span>
                    <h2 className={styles.cardTitle}>
                      <i className="bi bi-envelope me-2"></i>
                      Contact Information
                    </h2>
                  </div>
                  <div className={styles.cardBody}>
                    <p>For questions regarding these Terms, please contact us:</p>
                    <div className={styles.contactBox}>
                      <p className="mb-2">
                        <i className="bi bi-envelope-fill me-2"></i>
                        <strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} className={styles.contactLink}>{CONTACT_EMAIL}</a>
                      </p>
                      <p className="mb-0">
                        <i className="bi bi-telephone-fill me-2"></i>
                        <strong>Phone:</strong> <a href={`tel:${CONTACT_PHONE}`} className={styles.contactLink}>{CONTACT_PHONE}</a>
                      </p>
                    </div>
                    <p className="mt-4">
                      By using {PLATFORM_NAME}, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
}
