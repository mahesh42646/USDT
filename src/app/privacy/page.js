'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import { PLATFORM_NAME, CONTACT_EMAIL, CONTACT_PHONE } from '@/utils/constants';
import styles from './page.module.css';

export default function PrivacyPage() {
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
    <div className={styles.privacyPage}>
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
                  <i className="bi bi-shield-lock"></i>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={styles.heroTitle}
                >
                  Privacy Policy
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

      {/* Privacy Policy Content */}
      <section className={`py-5 ${styles.contentSection}`}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12 mx-auto">
              <motion.div
                {...fadeInUp}
                className={styles.policyCard}
              >
                <div className="text-center mb-5">
                  <p className="text-muted mb-0">
                    <i className="bi bi-calendar3 me-2"></i>
                    Last Updated: {lastUpdated}
                  </p>
                </div>

                <div className={styles.policyContent}>
                  {/* Introduction */}
                  <motion.section {...fadeInUp} className={styles.policySection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-file-text me-2"></i>
                      1. Introduction
                    </h2>
                    <p className={styles.sectionText}>
                      Welcome to {PLATFORM_NAME}. We are committed to protecting your privacy and ensuring 
                      the security of your personal information. This Privacy Policy explains how we collect, 
                      use, disclose, and safeguard your information when you use our platform.
                    </p>
                    <p className={styles.sectionText}>
                      By using our services, you agree to the collection and use of information in accordance 
                      with this policy. If you do not agree with our policies and practices, please do not use 
                      our services.
                    </p>
                  </motion.section>

                  {/* Information We Collect */}
                  <motion.section {...fadeInUp} className={styles.policySection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-database me-2"></i>
                      2. Information We Collect
                    </h2>
                    <h3 className={styles.subsectionTitle}>2.1 Personal Information</h3>
                    <p className={styles.sectionText}>
                      We collect information that you provide directly to us, including:
                    </p>
                    <ul className={styles.list}>
                      <li>Mobile phone number (for account registration and OTP verification)</li>
                      <li>Transaction information (USDT wallet addresses, transaction hashes)</li>
                      <li>Investment details (amount, dates, referral codes)</li>
                      <li>Account activity and usage data</li>
                      <li>Communication preferences</li>
                    </ul>

                    <h3 className={styles.subsectionTitle}>2.2 Automatically Collected Information</h3>
                    <p className={styles.sectionText}>
                      When you access our platform, we automatically collect certain information, including:
                    </p>
                    <ul className={styles.list}>
                      <li>Device information (IP address, browser type, operating system)</li>
                      <li>Usage data (pages visited, time spent, click patterns)</li>
                      <li>Cookies and similar tracking technologies</li>
                      <li>Log files and analytics data</li>
                    </ul>
                  </motion.section>

                  {/* How We Use Your Information */}
                  <motion.section {...fadeInUp} className={styles.policySection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-gear me-2"></i>
                      3. How We Use Your Information
                    </h2>
                    <p className={styles.sectionText}>
                      We use the collected information for various purposes, including:
                    </p>
                    <ul className={styles.list}>
                      <li>To create and manage your account</li>
                      <li>To process and track your investments and withdrawals</li>
                      <li>To calculate and distribute interest and referral rewards</li>
                      <li>To verify your identity and prevent fraud</li>
                      <li>To send you important updates and notifications</li>
                      <li>To provide customer support and respond to inquiries</li>
                      <li>To improve our services and user experience</li>
                      <li>To comply with legal obligations and regulatory requirements</li>
                      <li>To detect and prevent security threats and unauthorized access</li>
                    </ul>
                  </motion.section>

                  {/* Information Sharing and Disclosure */}
                  <motion.section {...fadeInUp} className={styles.policySection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-share me-2"></i>
                      4. Information Sharing and Disclosure
                    </h2>
                    <p className={styles.sectionText}>
                      We do not sell, trade, or rent your personal information to third parties. We may share 
                      your information only in the following circumstances:
                    </p>
                    <ul className={styles.list}>
                      <li><strong>Service Providers:</strong> With trusted third-party service providers who assist 
                        us in operating our platform, conducting business, or serving our users</li>
                      <li><strong>Legal Requirements:</strong> When required by law, court order, or government 
                        regulation</li>
                      <li><strong>Protection of Rights:</strong> To protect our rights, property, or safety, or 
                        that of our users or others</li>
                      <li><strong>Business Transfers:</strong> In connection with any merger, sale, or transfer 
                        of assets</li>
                      <li><strong>With Your Consent:</strong> When you have given us explicit permission to 
                        share your information</li>
                    </ul>
                  </motion.section>

                  {/* Data Security */}
                  <motion.section {...fadeInUp} className={styles.policySection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-shield-check me-2"></i>
                      5. Data Security
                    </h2>
                    <p className={styles.sectionText}>
                      We implement appropriate technical and organizational security measures to protect your 
                      personal information against unauthorized access, alteration, disclosure, or destruction. 
                      These measures include:
                    </p>
                    <ul className={styles.list}>
                      <li>Encryption of sensitive data in transit and at rest</li>
                      <li>Secure authentication and authorization protocols</li>
                      <li>Regular security assessments and updates</li>
                      <li>Access controls and monitoring systems</li>
                      <li>Blockchain-based transaction security (USDT TRC20)</li>
                    </ul>
                    <p className={styles.sectionText}>
                      However, no method of transmission over the Internet or electronic storage is 100% secure. 
                      While we strive to use commercially acceptable means to protect your information, we cannot 
                      guarantee absolute security.
                    </p>
                  </motion.section>

                  {/* Your Rights and Choices */}
                  <motion.section {...fadeInUp} className={styles.policySection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-person-check me-2"></i>
                      6. Your Rights and Choices
                    </h2>
                    <p className={styles.sectionText}>
                      You have certain rights regarding your personal information, including:
                    </p>
                    <ul className={styles.list}>
                      <li><strong>Access:</strong> Request access to your personal information</li>
                      <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                      <li><strong>Deletion:</strong> Request deletion of your personal information (subject to 
                        legal and contractual obligations)</li>
                      <li><strong>Objection:</strong> Object to processing of your personal information</li>
                      <li><strong>Data Portability:</strong> Request transfer of your data to another service</li>
                      <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing where applicable</li>
                    </ul>
                    <p className={styles.sectionText}>
                      To exercise these rights, please contact us using the contact information provided at the 
                      end of this policy.
                    </p>
                  </motion.section>

                  {/* Cookies and Tracking Technologies */}
                  <motion.section {...fadeInUp} className={styles.policySection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-cookie me-2"></i>
                      7. Cookies and Tracking Technologies
                    </h2>
                    <p className={styles.sectionText}>
                      We use cookies and similar tracking technologies to track activity on our platform and 
                      store certain information. Cookies are files with a small amount of data that are stored 
                      on your device. You can instruct your browser to refuse all cookies or to indicate when a 
                      cookie is being sent.
                    </p>
                    <p className={styles.sectionText}>
                      Types of cookies we use:
                    </p>
                    <ul className={styles.list}>
                      <li><strong>Essential Cookies:</strong> Required for the platform to function properly</li>
                      <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform</li>
                      <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                    </ul>
                  </motion.section>

                  {/* Data Retention */}
                  <motion.section {...fadeInUp} className={styles.policySection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-clock-history me-2"></i>
                      8. Data Retention
                    </h2>
                    <p className={styles.sectionText}>
                      We retain your personal information for as long as necessary to fulfill the purposes 
                      outlined in this Privacy Policy, unless a longer retention period is required or permitted 
                      by law. When we no longer need your information, we will securely delete or anonymize it.
                    </p>
                    <p className={styles.sectionText}>
                      Transaction records and financial data may be retained for longer periods to comply with 
                      legal, accounting, and regulatory requirements.
                    </p>
                  </motion.section>

                  {/* Children's Privacy */}
                  <motion.section {...fadeInUp} className={styles.policySection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-people me-2"></i>
                      9. Children's Privacy
                    </h2>
                    <p className={styles.sectionText}>
                      Our services are not intended for individuals under the age of 18. We do not knowingly 
                      collect personal information from children. If you are a parent or guardian and believe 
                      that your child has provided us with personal information, please contact us immediately.
                    </p>
                  </motion.section>

                  {/* Changes to This Privacy Policy */}
                  <motion.section {...fadeInUp} className={styles.policySection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-arrow-repeat me-2"></i>
                      10. Changes to This Privacy Policy
                    </h2>
                    <p className={styles.sectionText}>
                      We may update this Privacy Policy from time to time. We will notify you of any changes by 
                      posting the new Privacy Policy on this page and updating the "Last Updated" date. You are 
                      advised to review this Privacy Policy periodically for any changes.
                    </p>
                    <p className={styles.sectionText}>
                      Changes to this Privacy Policy are effective when they are posted on this page.
                    </p>
                  </motion.section>

                  {/* Contact Us */}
                  <motion.section {...fadeInUp} className={styles.policySection}>
                    <h2 className={styles.sectionTitle}>
                      <i className="bi bi-envelope me-2"></i>
                      11. Contact Us
                    </h2>
                    <p className={styles.sectionText}>
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our 
                      data practices, please contact us:
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

