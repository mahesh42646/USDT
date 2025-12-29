'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import { PLATFORM_NAME, CONTACT_EMAIL, CONTACT_PHONE } from '@/utils/constants';
import styles from './page.module.css';

export default function TermsPage() {
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

  const lastUpdated = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className={styles.termsPage}>
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
                  <i className="bi bi-file-earmark-text"></i>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={styles.heroTitle}
                >
                  Terms of Service
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

      {/* Terms Content */}
      <section className={`py-5 ${styles.contentSection}`}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 ">
              <motion.div
                {...fadeInUp}
                className={styles.termsCard}
              >
                <div className="text-center mb-5">
                  <p className="text-muted mb-0">
                    <i className="bi bi-calendar3 me-2"></i>
                    Last Updated: {lastUpdated}
                  </p>
                </div>

                <div className={styles.termsContent}>
                  {/* Introduction */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-file-text me-2"></i>
                      1. Acceptance of Terms
                    </h2>
                    <p className={styles.sectionText}>
                      By accessing and using {PLATFORM_NAME} ("the Platform", "we", "us", or "our"), you accept 
                      and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these 
                      Terms, you must not use our services.
                    </p>
                    <p className={styles.sectionText}>
                      These Terms constitute a legally binding agreement between you and {PLATFORM_NAME}. 
                      We reserve the right to modify these Terms at any time, and such modifications shall be 
                      effective immediately upon posting on the Platform.
                    </p>
                  </motion.section>

                  {/* Account Registration */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-person-plus me-2"></i>
                      2. Account Registration and Requirements
                    </h2>
                    <h3 className={styles.subsectionTitle}>2.1 Account Creation</h3>
                    <p className={styles.sectionText}>
                      To use our services, you must:
                    </p>
                    <ul className={styles.list}>
                      <li>Register an account using a valid mobile phone number</li>
                      <li>Complete OTP (One-Time Password) verification</li>
                      <li>Provide accurate and complete information</li>
                      <li>Maintain the security of your account credentials</li>
                      <li>Be at least 18 years of age</li>
                    </ul>

                    <h3 className={styles.subsectionTitle}>2.2 One Account Per User</h3>
                    <p className={styles.sectionText}>
                      Each user is permitted to maintain only one account. Creating multiple accounts using 
                      different mobile numbers or identities is strictly prohibited and will result in 
                      permanent account suspension and freezing of all associated accounts.
                    </p>

                    <h3 className={styles.subsectionTitle}>2.3 Account Security</h3>
                    <p className={styles.sectionText}>
                      You are responsible for maintaining the confidentiality of your account information 
                      and for all activities that occur under your account. You must immediately notify us 
                      of any unauthorized use of your account.
                    </p>
                  </motion.section>

                  {/* Investment Terms */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-wallet2 me-2"></i>
                      3. Investment Terms and Conditions
                    </h2>
                    <h3 className={styles.subsectionTitle}>3.1 Minimum Investment</h3>
                    <p className={styles.sectionText}>
                      The minimum investment amount is <strong>10 USDT</strong>. You may make multiple 
                      investments, and all investments are cumulative toward your total investment balance.
                    </p>

                    <h3 className={styles.subsectionTitle}>3.2 Investment Methods</h3>
                    <p className={styles.sectionText}>
                      All investments must be made using USDT (TRC20) cryptocurrency. You are responsible for:
                    </p>
                    <ul className={styles.list}>
                      <li>Ensuring you send USDT from a valid TRC20 wallet address</li>
                      <li>Including the correct transaction hash for verification</li>
                      <li>Paying all network/gas fees associated with transactions</li>
                      <li>Verifying transaction completion before contacting support</li>
                    </ul>

                    <h3 className={styles.subsectionTitle}>3.3 Investment Processing</h3>
                    <p className={styles.sectionText}>
                      Investments are processed after blockchain confirmation. Processing times may vary 
                      depending on network congestion. We are not responsible for delays in blockchain 
                      confirmation.
                    </p>

                    <h3 className={styles.subsectionTitle}>3.4 Special Investor Plan</h3>
                    <p className={styles.sectionText}>
                      Users investing <strong>10,000 USDT or more</strong> qualify for the Special Investor 
                      Plan, which provides a fixed <strong>1% daily interest rate</strong> regardless of 
                      referral count.
                    </p>
                  </motion.section>

                  {/* Interest and Rewards */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-graph-up me-2"></i>
                      4. Interest Calculation and Rewards
                    </h2>
                    <h3 className={styles.subsectionTitle}>4.1 Daily Interest Rates</h3>
                    <p className={styles.sectionText}>
                      Interest is calculated and credited daily based on your total investment balance:
                    </p>
                    <ul className={styles.list}>
                      <li><strong>Base Rate:</strong> 0.50% per day</li>
                      <li><strong>Maximum Rate:</strong> 2.00% per day (with referrals)</li>
                      <li><strong>Special Investor:</strong> 1.00% per day (fixed, for 10,000+ USDT investments)</li>
                    </ul>

                    <h3 className={styles.subsectionTitle}>4.2 Interest Calculation</h3>
                    <p className={styles.sectionText}>
                      Interest is calculated daily on your total cumulative investment balance. Interest 
                      is <strong>NOT compounded</strong> - it is calculated only on your principal investment 
                      amount, not on previously earned interest.
                    </p>

                    <h3 className={styles.subsectionTitle}>4.3 Referral Bonus</h3>
                    <p className={styles.sectionText}>
                      Your daily interest rate increases by <strong>0.05%</strong> for every 10 direct 
                      active referrals, up to a maximum of 2.00% per day. Referral bonuses require a 
                      minimum total investment of <strong>500 USDT</strong> to be eligible.
                    </p>

                    <h3 className={styles.subsectionTitle}>4.4 Referral Income</h3>
                    <p className={styles.sectionText}>
                      Referral income is <strong>NOT paid in cash</strong> and <strong>NOT added to your 
                      interest balance</strong>. Referral income is directly added to your investment 
                      balance only, subject to the following percentage slabs:
                    </p>
                    <ul className={styles.list}>
                      <li>10-49 referrals: 0.5% of referred user's investment</li>
                      <li>50-90 referrals: 1.0% of referred user's investment</li>
                      <li>91-120 referrals: 1.5% of referred user's investment</li>
                      <li>121-150 referrals: 2.0% of referred user's investment</li>
                      <li>151+ referrals: 3.0% of referred user's investment</li>
                    </ul>
                  </motion.section>

                  {/* Withdrawal Terms */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-cash-coin me-2"></i>
                      5. Withdrawal Terms and Conditions
                    </h2>
                    <h3 className={styles.subsectionTitle}>5.1 Withdrawal Eligibility</h3>
                    <p className={styles.sectionText}>
                      Withdrawals are <strong>locked</strong> until your total investment reaches 
                      <strong> 500 USDT</strong>. Once this threshold is reached, interest withdrawals 
                      are unlocked and a monthly withdrawal cycle begins.
                    </p>

                    <h3 className={styles.subsectionTitle}>5.2 Withdrawal Limits</h3>
                    <p className={styles.sectionText}>
                      Withdrawal terms include:
                    </p>
                    <ul className={styles.list}>
                      <li><strong>Minimum Withdrawal:</strong> 20 USDT</li>
                      <li><strong>Maximum Withdrawal:</strong> 30% of your monthly interest earnings</li>
                      <li><strong>Frequency:</strong> One withdrawal per month only</li>
                      <li><strong>Processing Time:</strong> Within 24 hours of request</li>
                    </ul>

                    <h3 className={styles.subsectionTitle}>5.3 Withdrawal Fees</h3>
                    <p className={styles.sectionText}>
                      All network/gas fees for withdrawals are paid by the user. The Platform does not 
                      charge additional withdrawal fees, but blockchain transaction fees apply.
                    </p>

                    <h3 className={styles.subsectionTitle}>5.4 Withdrawal Processing</h3>
                    <p className={styles.sectionText}>
                      Withdrawal requests are processed within 24 hours. Large withdrawals may require 
                      manual admin approval for security purposes. We reserve the right to review and 
                      hold suspicious withdrawal requests.
                    </p>
                  </motion.section>

                  {/* User Obligations */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-shield-check me-2"></i>
                      6. User Obligations and Prohibited Activities
                    </h2>
                    <h3 className={styles.subsectionTitle}>6.1 Prohibited Activities</h3>
                    <p className={styles.sectionText}>
                      You agree NOT to:
                    </p>
                    <ul className={styles.list}>
                      <li>Create multiple accounts using different identities or mobile numbers</li>
                      <li>Engage in fraudulent, illegal, or unauthorized activities</li>
                      <li>Attempt to manipulate the referral system or interest calculations</li>
                      <li>Use automated systems, bots, or scripts to interact with the Platform</li>
                      <li>Share your account credentials with third parties</li>
                      <li>Violate any applicable laws or regulations</li>
                      <li>Interfere with or disrupt the Platform's operations</li>
                    </ul>

                    <h3 className={styles.subsectionTitle}>6.2 Account Inactivity</h3>
                    <p className={styles.sectionText}>
                      Accounts inactive for <strong>60 days</strong> will have interest calculations 
                      paused until the account becomes active again. You must log in at least once 
                      every 60 days to maintain active status.
                    </p>
                  </motion.section>

                  {/* Platform Rights */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-gear me-2"></i>
                      7. Platform Rights and Modifications
                    </h2>
                    <p className={styles.sectionText}>
                      We reserve the right to:
                    </p>
                    <ul className={styles.list}>
                      <li>Modify, suspend, or discontinue any aspect of the Platform at any time</li>
                      <li>Update interest rates, terms, and conditions with prior notice</li>
                      <li>Freeze or suspend accounts that violate these Terms</li>
                      <li>Review and approve large withdrawals manually</li>
                      <li>Investigate suspicious activities and take appropriate action</li>
                      <li>Require additional verification for security purposes</li>
                    </ul>
                  </motion.section>

                  {/* Risk Disclosure */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      8. Risk Disclosure and Disclaimer
                    </h2>
                    <p className={styles.sectionText}>
                      <strong>Important:</strong> Investment in cryptocurrency and digital assets involves 
                      substantial risk. You acknowledge and agree that:
                    </p>
                    <ul className={styles.list}>
                      <li>Returns are variable and not guaranteed</li>
                      <li>Past performance does not guarantee future results</li>
                      <li>You may lose part or all of your investment</li>
                      <li>Cryptocurrency markets are highly volatile</li>
                      <li>Regulatory changes may affect the Platform's operations</li>
                      <li>Blockchain network issues may cause delays or transaction failures</li>
                    </ul>
                    <p className={styles.sectionText}>
                      You should only invest funds that you can afford to lose. This is a digital reward 
                      and participation model, and returns are subject to market conditions and platform 
                      performance.
                    </p>
                  </motion.section>

                  {/* Limitation of Liability */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-shield-x me-2"></i>
                      9. Limitation of Liability
                    </h2>
                    <p className={styles.sectionText}>
                      To the maximum extent permitted by law, {PLATFORM_NAME} and its affiliates shall 
                      not be liable for:
                    </p>
                    <ul className={styles.list}>
                      <li>Any indirect, incidental, special, or consequential damages</li>
                      <li>Loss of profits, data, or business opportunities</li>
                      <li>Delays or failures in blockchain network operations</li>
                      <li>Unauthorized access to your account due to your negligence</li>
                      <li>Changes in cryptocurrency market conditions</li>
                      <li>Regulatory actions or legal changes affecting the Platform</li>
                    </ul>
                    <p className={styles.sectionText}>
                      Our total liability shall not exceed the amount you have invested in the Platform.
                    </p>
                  </motion.section>

                  {/* Termination */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-x-circle me-2"></i>
                      10. Account Termination
                    </h2>
                    <h3 className={styles.subsectionTitle}>10.1 Termination by User</h3>
                    <p className={styles.sectionText}>
                      You may terminate your account at any time by contacting our support team. 
                      Outstanding balances will be processed according to our withdrawal policies.
                    </p>

                    <h3 className={styles.subsectionTitle}>10.2 Termination by Platform</h3>
                    <p className={styles.sectionText}>
                      We reserve the right to suspend or terminate your account immediately if you:
                    </p>
                    <ul className={styles.list}>
                      <li>Violate these Terms of Service</li>
                      <li>Create multiple accounts</li>
                      <li>Engage in fraudulent or illegal activities</li>
                      <li>Provide false or misleading information</li>
                      <li>Attempt to manipulate the Platform's systems</li>
                    </ul>
                  </motion.section>

                  {/* Dispute Resolution */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-gavel me-2"></i>
                      11. Dispute Resolution
                    </h2>
                    <p className={styles.sectionText}>
                      Any disputes arising from these Terms or your use of the Platform shall be resolved 
                      through:
                    </p>
                    <ul className={styles.list}>
                      <li><strong>Initial Contact:</strong> Contact our support team first to resolve the issue</li>
                      <li><strong>Mediation:</strong> If unresolved, parties agree to attempt mediation</li>
                      <li><strong>Arbitration:</strong> Disputes may be resolved through binding arbitration</li>
                      <li><strong>Governing Law:</strong> These Terms are governed by applicable laws</li>
                    </ul>
                  </motion.section>

                  {/* Changes to Terms */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-arrow-repeat me-2"></i>
                      12. Changes to Terms of Service
                    </h2>
                    <p className={styles.sectionText}>
                      We reserve the right to modify these Terms at any time. Material changes will be 
                      communicated to users via email or platform notifications. Continued use of the 
                      Platform after changes constitutes acceptance of the modified Terms.
                    </p>
                    <p className={styles.sectionText}>
                      It is your responsibility to review these Terms periodically. The "Last Updated" 
                      date at the top of this page indicates when these Terms were last revised.
                    </p>
                  </motion.section>

                  {/* Contact Information */}
                  <motion.section {...fadeInUp} className={styles.termsSection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-envelope me-2"></i>
                      13. Contact Information
                    </h2>
                    <p className={styles.sectionText}>
                      If you have any questions, concerns, or need clarification regarding these Terms 
                      of Service, please contact us:
                    </p>
                    <div className={styles.contactBox}>
                      <p className="mb-2">
                        <i className="bi bi-envelope-fill me-2 text-primary"></i>
                        <strong>Email:</strong> <a href={`mailto:${CONTACT_EMAIL}`} className={styles.contactLink}>{CONTACT_EMAIL}</a>
                      </p>
                      <p className="mb-0">
                        <i className="bi bi-telephone-fill me-2 text-primary"></i>
                        <strong>Phone:</strong> <a href={`tel:${CONTACT_PHONE}`} className={styles.contactLink}>{CONTACT_PHONE}</a>
                      </p>
                    </div>
                    <p className={styles.sectionText}>
                      By using {PLATFORM_NAME}, you acknowledge that you have read, understood, and agree 
                      to be bound by these Terms of Service.
                    </p>
                  </motion.section>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
}

