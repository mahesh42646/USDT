'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import { PLATFORM_NAME, CONTACT_EMAIL, CONTACT_PHONE } from '@/utils/constants';
import styles from './page.module.css';

export default function RiskDisclosurePage() {
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
    <div className={styles.riskDisclosurePage}>
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
                  <i className="bi bi-shield-exclamation"></i>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={styles.heroTitle}
                >
                  Risk Disclosure
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={styles.heroSubtitle}
                >
                  Important information about the risks associated with cryptocurrency investments
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

      {/* Risk Disclosure Content */}
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

                {/* Important Notice */}
                <motion.div
                  {...fadeIn}
                  className={styles.warningBox}
                >
                  <h3 className={styles.warningTitle}>
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    Important Notice
                  </h3>
                  <p>
                    <strong>Please read this Risk Disclosure carefully before making any investment decisions.</strong> 
                    Investing in cryptocurrencies, including USDT (TRC20), involves substantial risk of loss. 
                    You should only invest funds that you can afford to lose completely.
                  </p>
                </motion.div>

                {/* General Risk Warning */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-exclamation-circle me-2"></i>
                    General Risk Warning
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      All investments carry risk, and cryptocurrency investments are among the highest risk investment 
                      categories. The value of cryptocurrencies can be extremely volatile and may fluctuate dramatically 
                      in short periods. You may lose some or all of your invested capital.
                    </p>
                    <p>
                      <strong>No Guarantee of Returns:</strong> There is no guarantee that you will receive any 
                      returns on your investment. Past performance does not guarantee future results. The interest 
                      rates, referral bonuses, and other returns mentioned on {PLATFORM_NAME} are estimates and may 
                      vary or not be achieved.
                    </p>
                    <p>
                      <strong>Possibility of Total Loss:</strong> You should be prepared to lose your entire investment. 
                      Do not invest more than you can afford to lose.
                    </p>
                  </div>
                </motion.div>

                {/* Cryptocurrency-Specific Risks */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-currency-bitcoin me-2"></i>
                    Cryptocurrency-Specific Risks
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      Investing in USDT (TRC20) and other cryptocurrencies involves unique risks:
                    </p>
                    <ul className={styles.list}>
                      <li>
                        <strong>Market Volatility:</strong> Cryptocurrency markets are highly volatile. Prices can 
                        experience rapid and significant fluctuations, potentially resulting in substantial losses.
                      </li>
                      <li>
                        <strong>Liquidity Risk:</strong> Cryptocurrency markets may experience periods of low liquidity, 
                        making it difficult to buy or sell assets at desired prices or times.
                      </li>
                      <li>
                        <strong>Regulatory Risk:</strong> Cryptocurrency regulations vary by jurisdiction and may change 
                        unexpectedly. Regulatory actions could affect the value, availability, or legality of 
                        cryptocurrencies.
                      </li>
                      <li>
                        <strong>Technology Risk:</strong> Cryptocurrencies rely on blockchain technology, which may 
                        experience technical issues, bugs, or vulnerabilities that could result in loss of funds.
                      </li>
                      <li>
                        <strong>Network Risk:</strong> Blockchain networks may experience congestion, delays, or 
                        transaction failures, potentially affecting your ability to deposit, withdraw, or transact.
                      </li>
                      <li>
                        <strong>Security Risk:</strong> Cryptocurrency wallets, exchanges, and platforms may be 
                        subject to hacking, theft, or security breaches, potentially resulting in loss of funds.
                      </li>
                    </ul>
                  </div>
                </motion.div>

                {/* Platform-Specific Risks */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-building me-2"></i>
                    Platform-Specific Risks
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      Using {PLATFORM_NAME} involves additional risks specific to our platform:
                    </p>
                    <ul className={styles.list}>
                      <li>
                        <strong>Operational Risk:</strong> The Platform may experience technical difficulties, 
                        maintenance, or downtime that could affect your ability to access your account or make 
                        transactions.
                      </li>
                      <li>
                        <strong>Business Risk:</strong> The Platform's business model, operations, or financial 
                        condition may change, potentially affecting returns, withdrawal availability, or Platform 
                        availability.
                      </li>
                      <li>
                        <strong>Withdrawal Restrictions:</strong> Withdrawals are subject to minimum thresholds 
                        (500 USDT total investment), monthly limits (30% of monthly interest), and processing times 
                        (up to 24 hours). Large withdrawals may require manual approval.
                      </li>
                      <li>
                        <strong>Interest Rate Variability:</strong> Daily interest rates (0.50% to 2.00%) are variable 
                        and subject to change based on referral count, Platform performance, and other factors. Rates 
                        are not guaranteed.
                      </li>
                      <li>
                        <strong>Referral Income Risk:</strong> Referral income depends on the investment activity 
                        of your referrals and is not guaranteed. Referral percentages may change, and you must maintain 
                        a minimum 500 USDT investment to be eligible.
                      </li>
                      <li>
                        <strong>Account Restrictions:</strong> Accounts may be suspended, restricted, or terminated 
                        for violations of terms, suspicious activity, or other reasons, potentially affecting access 
                        to funds.
                      </li>
                      <li>
                        <strong>Inactivity Penalties:</strong> Accounts inactive for 60 days will have interest 
                        calculations paused until reactivated.
                      </li>
                    </ul>
                  </div>
                </motion.div>

                {/* Investment Strategy Risks */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-graph-up-arrow me-2"></i>
                    Investment Strategy Risks
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      <strong>No Diversification:</strong> Investing solely in {PLATFORM_NAME} means you are not 
                      diversifying your investment portfolio. Lack of diversification increases risk.
                    </p>
                    <p>
                      <strong>No Compounding:</strong> Interest is not compounded on this Platform. Your interest 
                      earnings are calculated daily but do not automatically reinvest, which may affect long-term 
                      returns compared to compounding strategies.
                    </p>
                    <p>
                      <strong>Dependency on Platform:</strong> Your investment returns depend entirely on the 
                      Platform's continued operation and performance. If the Platform ceases operations or experiences 
                      financial difficulties, you may lose your investment.
                    </p>
                    <p>
                      <strong>No Insurance:</strong> Investments on {PLATFORM_NAME} are not insured by any government 
                      deposit insurance scheme, bank insurance, or similar protection. You have no recourse to insurance 
                      in case of loss.
                    </p>
                  </div>
                </motion.div>

                {/* Regulatory and Legal Risks */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-gavel me-2"></i>
                    Regulatory and Legal Risks
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      <strong>Changing Regulations:</strong> Cryptocurrency and investment regulations are evolving 
                      and may change in ways that affect the Platform's operations, your ability to invest, or the 
                      tax treatment of your investments.
                    </p>
                    <p>
                      <strong>Jurisdictional Issues:</strong> The Platform may be subject to laws and regulations 
                      in multiple jurisdictions. Changes in laws or enforcement actions could affect Platform 
                      operations or your investments.
                    </p>
                    <p>
                      <strong>Tax Obligations:</strong> You are responsible for understanding and fulfilling your 
                      tax obligations related to investments, interest earnings, referral income, and withdrawals. 
                      Tax laws vary by jurisdiction and may change.
                    </p>
                    <p>
                      <strong>Legal Action:</strong> The Platform or its operations may become subject to legal 
                      action, regulatory investigation, or enforcement proceedings that could affect operations or 
                      your investments.
                    </p>
                  </div>
                </motion.div>

                {/* Technology and Security Risks */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-shield-lock me-2"></i>
                    Technology and Security Risks
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      <strong>Cybersecurity Threats:</strong> The Platform, your account, and cryptocurrency 
                      networks may be subject to hacking, phishing, malware, or other cybersecurity threats that 
                      could result in loss of funds or personal information.
                    </p>
                    <p>
                      <strong>Account Security:</strong> You are responsible for maintaining the security of your 
                      account credentials. Unauthorized access to your account could result in loss of funds.
                    </p>
                    <p>
                      <strong>Transaction Errors:</strong> Errors in transaction addresses, amounts, or network 
                      selection could result in permanent loss of funds. Cryptocurrency transactions are generally 
                      irreversible.
                    </p>
                    <p>
                      <strong>Network Fees:</strong> Blockchain network fees (gas fees) are paid by users and may 
                      vary significantly. High network fees could reduce your net returns or make transactions 
                      uneconomical.
                    </p>
                  </div>
                </motion.div>

                {/* Liquidity and Withdrawal Risks */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-cash-stack me-2"></i>
                    Liquidity and Withdrawal Risks
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      <strong>Withdrawal Restrictions:</strong> Withdrawals are subject to various restrictions:
                    </p>
                    <ul className={styles.list}>
                      <li>Minimum total investment of 500 USDT required before withdrawals are unlocked</li>
                      <li>Minimum withdrawal amount of 20 USDT per transaction</li>
                      <li>Maximum withdrawal of 30% of monthly interest earnings</li>
                      <li>One withdrawal per month only</li>
                      <li>Processing time of up to 24 hours (may be longer for large withdrawals requiring approval)</li>
                    </ul>
                    <p>
                      <strong>Limited Liquidity:</strong> Your investment may not be immediately liquid. Withdrawal 
                      restrictions and processing times mean you may not be able to access your funds when desired.
                    </p>
                    <p>
                      <strong>Platform Solvency:</strong> The Platform's ability to process withdrawals depends on 
                      its financial condition and liquidity. There is no guarantee that the Platform will always be 
                      able to process withdrawals.
                    </p>
                  </div>
                </motion.div>

                {/* Risk Assessment */}
                <motion.div
                  {...fadeIn}
                  className={styles.section}
                >
                  <h2 className={styles.sectionTitle}>
                    <i className="bi bi-clipboard-check me-2"></i>
                    Risk Assessment
                  </h2>
                  <div className={styles.sectionContent}>
                    <p>
                      Before investing, you should assess whether this investment is suitable for you based on:
                    </p>
                    <ul className={styles.list}>
                      <li>Your financial situation and ability to bear losses</li>
                      <li>Your investment experience and knowledge of cryptocurrencies</li>
                      <li>Your risk tolerance and investment objectives</li>
                      <li>Your understanding of the Platform's business model and risks</li>
                      <li>Your need for liquidity and ability to accept withdrawal restrictions</li>
                    </ul>
                    <p>
                      <strong>If you are unsure about any aspect of this investment, you should consult with a 
                      qualified financial advisor before investing.</strong>
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
                    Acknowledgment of Risks
                  </h3>
                  <p>
                    By using {PLATFORM_NAME} and making investments, you acknowledge that:
                  </p>
                  <ul className={styles.list}>
                    <li>You have read and understood this Risk Disclosure</li>
                    <li>You understand that investing involves substantial risk of loss</li>
                    <li>You are aware that you may lose some or all of your invested capital</li>
                    <li>You have assessed your financial situation and risk tolerance</li>
                    <li>You are investing funds that you can afford to lose</li>
                    <li>You accept all risks associated with cryptocurrency investments and this Platform</li>
                    <li>You will not hold {PLATFORM_NAME} liable for any losses resulting from your investment decisions</li>
                  </ul>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                  {...fadeIn}
                  className={styles.contactBox}
                >
                  <h3 className={styles.contactTitle}>
                    <i className="bi bi-envelope me-2"></i>
                    Questions About Risks?
                  </h3>
                  <p>
                    If you have questions about the risks associated with investing on {PLATFORM_NAME}, please 
                    contact us before making any investment decisions:
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

