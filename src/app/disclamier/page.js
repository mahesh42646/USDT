'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import { PLATFORM_NAME, CONTACT_EMAIL, CONTACT_PHONE } from '@/utils/constants';
import styles from './page.module.css';

export default function DisclaimerPage() {
  const heroRef = useRef(null);
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

  const fadeIn = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className={styles.disclaimerPage}>
      <UserHeader />
      
      {/* Hero Section */}
      <section 
        ref={heroRef} 
        className={styles.heroSection}
        style={{ 
          backgroundImage: `linear-gradient(rgba(74, 85, 104, 0.8), rgba(70, 35, 154, 0.7)), url('/herobg.jpg')`, 
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
                  className={styles.heroIcon}
                >
                  <i className="bi bi-exclamation-triangle"></i>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={styles.heroTitle}
                >
                  Disclaimer
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={styles.heroUnderline}
                ></motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Disclaimer Content */}
      <section className={`py-5 ${styles.contentSection}`}>
        <div className="container">
          <div className="row">
            <div className="col-12">
              <motion.div
                {...fadeInUp}
                className={styles.contentWrapper}
              >
                {/* Last Updated */}
                <div className={styles.lastUpdated}>
                  <i className="bi bi-calendar3 me-2"></i>
                  Last Updated: {lastUpdated}
                </div>

                {/* Introduction */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-info-circle me-2"></i>
                    General Disclaimer
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      This disclaimer applies to your use of {PLATFORM_NAME} ("the Platform", "we", "us", or "our"). 
                      By accessing and using this Platform, you acknowledge that you have read, understood, and agree 
                      to be bound by this disclaimer and all applicable terms and conditions.
                    </p>
                    <p>
                      The information provided on this Platform is for general informational purposes only and should not 
                      be construed as financial, investment, legal, or tax advice. You should consult with qualified 
                      professionals before making any investment decisions.
                    </p>
                  </div>
                </motion.div>

                {/* Investment Disclaimer */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-wallet2 me-2"></i>
                    Investment Disclaimer
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      <strong>No Guaranteed Returns:</strong> All investments carry inherent risks, and past performance 
                      does not guarantee future results. The returns mentioned on this Platform are variable and not 
                      guaranteed. Your investment may lose value, and you may lose some or all of your invested capital.
                    </p>
                    <p>
                      <strong>Variable Returns:</strong> Interest rates, referral bonuses, and other returns are subject 
                      to change based on market conditions, platform performance, and other factors beyond our control. 
                      The daily interest rates (0.50% to 2.00%) and referral income percentages are estimates and may 
                      vary.
                    </p>
                    <p>
                      <strong>Not Financial Advice:</strong> The Platform does not provide personalized investment 
                      advice. All investment decisions are made at your own discretion and risk. We recommend that you 
                      only invest funds that you can afford to lose.
                    </p>
                  </div>
                </motion.div>

                {/* Risk Disclosure */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-shield-exclamation me-2"></i>
                    Risk Disclosure
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      <strong>High Risk Investment:</strong> Cryptocurrency investments, including USDT (TRC20) investments, 
                      are highly speculative and involve substantial risk of loss. The value of cryptocurrencies can be 
                      extremely volatile and may fluctuate significantly.
                    </p>
                    <ul className={styles.list}>
                      <li>Market volatility may result in significant losses</li>
                      <li>Cryptocurrency markets are unregulated in many jurisdictions</li>
                      <li>Technical issues, hacking, or security breaches may result in loss of funds</li>
                      <li>Regulatory changes may affect the Platform's operations</li>
                      <li>Network fees and transaction costs may impact returns</li>
                      <li>Withdrawal restrictions and processing times may apply</li>
                    </ul>
                    <p>
                      <strong>Platform Risks:</strong> The Platform operates as a digital participation model. There is 
                      no guarantee that the Platform will continue to operate indefinitely, and operational issues, 
                      regulatory actions, or other factors may affect Platform availability.
                    </p>
                  </div>
                </motion.div>

                {/* No Warranty */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-x-circle me-2"></i>
                    No Warranties
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      The Platform is provided "as is" and "as available" without any warranties, express or implied. 
                      We do not warrant that:
                    </p>
                    <ul className={styles.list}>
                      <li>The Platform will be uninterrupted, secure, or error-free</li>
                      <li>Any defects or errors will be corrected</li>
                      <li>The Platform is free of viruses or other harmful components</li>
                      <li>The information provided is accurate, complete, or current</li>
                      <li>Your investments will generate returns or preserve capital</li>
                    </ul>
                    <p>
                      We disclaim all warranties, including but not limited to warranties of merchantability, fitness 
                      for a particular purpose, and non-infringement.
                    </p>
                  </div>
                </motion.div>

                {/* Limitation of Liability */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-shield-x me-2"></i>
                    Limitation of Liability
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      To the maximum extent permitted by law, {PLATFORM_NAME}, its affiliates, officers, directors, 
                      employees, and agents shall not be liable for any direct, indirect, incidental, special, 
                      consequential, or punitive damages, including but not limited to:
                    </p>
                    <ul className={styles.list}>
                      <li>Loss of profits, revenue, or investment capital</li>
                      <li>Loss of data or information</li>
                      <li>Business interruption</li>
                      <li>Loss of goodwill or reputation</li>
                      <li>Damages resulting from unauthorized access or use</li>
                      <li>Damages resulting from technical failures or errors</li>
                    </ul>
                    <p>
                      This limitation applies regardless of the theory of liability, whether in contract, tort, 
                      negligence, strict liability, or otherwise, even if we have been advised of the possibility 
                      of such damages.
                    </p>
                  </div>
                </motion.div>

                {/* Regulatory Disclaimer */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-bank me-2"></i>
                    Regulatory Disclaimer
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      <strong>Not a Bank or Financial Institution:</strong> {PLATFORM_NAME} is not a bank, credit union, 
                      or licensed financial institution. Your investments are not insured by any government deposit 
                      insurance scheme or similar protection.
                    </p>
                    <p>
                      <strong>Regulatory Compliance:</strong> The Platform operates in compliance with applicable laws 
                      and regulations. However, cryptocurrency regulations vary by jurisdiction and may change. 
                      You are responsible for ensuring that your use of the Platform complies with all applicable 
                      laws in your jurisdiction.
                    </p>
                    <p>
                      <strong>Tax Obligations:</strong> You are solely responsible for determining and fulfilling 
                      your tax obligations related to investments, interest earnings, referral income, and withdrawals. 
                      We do not provide tax advice and recommend consulting with a qualified tax professional.
                    </p>
                  </div>
                </motion.div>

                {/* Third-Party Services */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-link-45deg me-2"></i>
                    Third-Party Services
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      The Platform may use third-party services, including but not limited to blockchain networks, 
                      payment processors, and authentication providers. We are not responsible for:
                    </p>
                    <ul className={styles.list}>
                      <li>The availability, accuracy, or reliability of third-party services</li>
                      <li>Losses resulting from third-party service failures or errors</li>
                      <li>Network congestion or delays on blockchain networks</li>
                      <li>Changes to third-party service terms or fees</li>
                    </ul>
                    <p>
                      Your use of third-party services is subject to their respective terms and conditions.
                    </p>
                  </div>
                </motion.div>

                {/* User Responsibility */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-person-check me-2"></i>
                    User Responsibility
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      You acknowledge and agree that:
                    </p>
                    <ul className={styles.list}>
                      <li>You are solely responsible for maintaining the security of your account credentials</li>
                      <li>You will not create multiple accounts or engage in fraudulent activities</li>
                      <li>You will provide accurate and truthful information</li>
                      <li>You will comply with all applicable laws and regulations</li>
                      <li>You understand the risks associated with cryptocurrency investments</li>
                      <li>You will not use the Platform for illegal or unauthorized purposes</li>
                    </ul>
                    <p>
                      Violation of these responsibilities may result in account suspension, termination, or legal action.
                    </p>
                  </div>
                </motion.div>

                {/* Changes to Disclaimer */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-arrow-repeat me-2"></i>
                    Changes to Disclaimer
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      We reserve the right to modify, update, or change this disclaimer at any time without prior 
                      notice. Your continued use of the Platform after any changes constitutes your acceptance of 
                      the updated disclaimer. It is your responsibility to review this disclaimer periodically.
                    </p>
                    <p>
                      Material changes to this disclaimer will be communicated through the Platform or via email to 
                      registered users, but we are not obligated to provide individual notice of every change.
                    </p>
                  </div>
                </motion.div>

                {/* Jurisdiction */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-globe me-2"></i>
                    Jurisdiction and Governing Law
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      This disclaimer is governed by and construed in accordance with applicable laws. Any disputes 
                      arising from or relating to this disclaimer or your use of the Platform shall be resolved 
                      through the dispute resolution mechanisms outlined in our Terms of Service.
                    </p>
                    <p>
                      If any provision of this disclaimer is found to be unenforceable or invalid, the remaining 
                      provisions shall continue in full force and effect.
                    </p>
                  </div>
                </motion.div>

                {/* Acknowledgment */}
                <motion.div
                  {...fadeIn}
                  className={styles.acknowledgmentBox}
                >
                  <h3 className={styles.acknowledgmentTitle}>
                    <i className="bi bi-check-circle me-2"></i>
                    Acknowledgment
                  </h3>
                  <p>
                    By using {PLATFORM_NAME}, you acknowledge that you have read, understood, and agree to this 
                    disclaimer. You understand that investing in cryptocurrencies involves substantial risk, and you 
                    are solely responsible for your investment decisions.
                  </p>
                  <p>
                    If you do not agree with any part of this disclaimer, you must not use the Platform.
                  </p>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  {...fadeIn}
                  className={styles.contactBox}
                >
                  <h3 className={styles.contactTitle}>
                    <i className="bi bi-envelope me-2"></i>
                    Questions About This Disclaimer?
                  </h3>
                  <p>
                    If you have any questions or concerns about this disclaimer, please contact us:
                  </p>
                  <div className={styles.contactInfo}>
                    <p>
                      <i className="bi bi-envelope-fill me-2"></i>
                      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                    </p>
                    <p>
                      <i className="bi bi-telephone-fill me-2"></i>
                      <a href={`tel:${CONTACT_PHONE}`}>{CONTACT_PHONE}</a>
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

