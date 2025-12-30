'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import { PLATFORM_NAME, PLATFORM_DESCRIPTION } from '@/utils/constants';
import styles from './page.module.css';

export default function AboutPage() {
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

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.2 }
  };

  const staggerItem = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
  };

  return (
    <div className={styles.aboutPage}>
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
                  <i className="bi bi-info-circle"></i>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={styles.heroTitle}
                >
                  About Us
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

      {/* Mission Section */}
      <section className={`py-5 ${styles.missionSection}`}>
        <div className="container">
          <div className="row align-items-center">
            <motion.div
              {...fadeInUp}
              className="col-lg-6"
            >
              <h2 className="display-5 fw-bold mb-4">Our Mission</h2>
              <p className="lead mb-4">
                To democratize investment opportunities by providing a secure, 
                transparent, and accessible platform for individuals to grow 
                their wealth through USDT-based investments.
              </p>
              <p className="text-muted mb-4">
                We believe in creating value for our community through innovative 
                investment solutions, fair reward systems, and exceptional service. 
                Our platform is designed to empower investors with the tools and 
                opportunities they need to achieve their financial goals.
              </p>
              <Link href="/auth/register" className="btn btn-primary btn-lg">
                <i className="bi bi-rocket-takeoff me-2"></i>
                Get Started
              </Link>
            </motion.div>
            <motion.div
              {...fadeIn}
              className="col-lg-6"
            >
              <div className={styles.missionImage}>
                <div className={styles.missionCard}>
                  <i className="bi bi-bullseye" style={{ fontSize: '4rem', color: 'var(--accent)' }}></i>
                  <h4 className="fw-bold mt-4 mb-3">Our Vision</h4>
                  <p className="text-muted mb-0">
                    To become the most trusted and innovative USDT investment 
                    platform, empowering millions of investors worldwide.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={`py-5 ${styles.valuesSection}`}>
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Our Core Values</h2>
            <p className="lead text-muted">The principles that guide everything we do</p>
          </motion.div>

          <motion.div 
            {...staggerContainer}
            className="row g-4"
          >
            {[
              { 
                icon: 'bi-shield-check', 
                title: 'Security First', 
                desc: 'We prioritize the security of your investments with advanced blockchain technology and robust security measures.' 
              },
              { 
                icon: 'bi-eye', 
                title: 'Transparency', 
                desc: 'Complete transparency in all operations, fees, and processes. No hidden charges or surprises.' 
              },
              { 
                icon: 'bi-people', 
                title: 'Community Focus', 
                desc: 'Building a strong community where everyone can grow together through our referral system.' 
              },
              { 
                icon: 'bi-award', 
                title: 'Excellence', 
                desc: 'Committed to delivering exceptional service and innovative solutions for our investors.' 
              },
              { 
                icon: 'bi-graph-up-arrow', 
                title: 'Growth', 
                desc: 'Helping our investors achieve sustainable growth through smart investment strategies.' 
              },
              { 
                icon: 'bi-heart', 
                title: 'Integrity', 
                desc: 'Operating with the highest standards of honesty, ethics, and accountability.' 
              },
            ].map((value, index) => (
              <motion.div 
                key={index}
                {...staggerItem}
                className="col-md-4"
              >
                <div className={`card h-100 border-0 shadow-sm ${styles.valueCard}`}>
                  <div className="card-body text-center p-4">
                    <div className={`${styles.valueIcon} mb-3`}>
                      <i className={`bi ${value.icon}`}></i>
                    </div>
                    <h5 className="fw-bold mb-3">{value.title}</h5>
                    <p className="text-muted mb-0">{value.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-5 ${styles.featuresSection}`}>
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Why Choose Us?</h2>
            <p className="lead text-muted">What makes {PLATFORM_NAME} different</p>
          </motion.div>

          <div className="row g-4">
            <motion.div
              {...fadeInUp}
              className="col-lg-6"
            >
              <div className={styles.featureList}>
                {[
                  'USDT (TRC20) based secure transactions',
                  'Daily interest rewards starting from 0.50%',
                  'Transparent referral system with fair rewards',
                  'Monthly withdrawal system after 500 USDT threshold',
                  '24-hour withdrawal processing',
                  'Special Investor Plan for high-value investments',
                  'Cumulative investment system',
                  'No compounding - simple and transparent',
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="d-flex align-items-start mb-3"
                  >
                    <i className="bi bi-check-circle-fill text-success me-3 mt-1" style={{ fontSize: '1.5rem' }}></i>
                    <p className="mb-0 lead">{feature}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              {...fadeIn}
              className="col-lg-6"
            >
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <h3 className={`display-4 fw-bold ${styles.statNumber}`}>0.50%</h3>
                  <p className="text-muted mb-0">Base Daily Interest</p>
                </div>
                <div className={styles.statBox}>
                  <h3 className={`display-4 fw-bold ${styles.statNumber}`}>2.00%</h3>
                  <p className="text-muted mb-0">Maximum Daily Interest</p>
                </div>
                <div className={styles.statBox}>
                  <h3 className={`display-4 fw-bold ${styles.statNumber}`}>10 USDT</h3>
                  <p className="text-muted mb-0">Minimum Investment</p>
                </div>
                <div className={styles.statBox}>
                  <h3 className={`display-4 fw-bold ${styles.statNumber}`}>500 USDT</h3>
                  <p className="text-muted mb-0">Withdrawal Unlock</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`py-5 ${styles.howItWorksSection}`}>
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">How We Operate</h2>
            <p className="lead text-muted">Simple, transparent, and secure</p>
          </motion.div>

          <motion.div 
            {...staggerContainer}
            className="row g-4"
          >
            {[
              { 
                step: '01', 
                title: 'Secure Platform', 
                desc: 'Built on blockchain technology with USDT (TRC20) for secure transactions', 
                icon: 'bi-shield-lock' 
              },
              { 
                step: '02', 
                title: 'Daily Rewards', 
                desc: 'Earn daily interest automatically calculated and added to your balance', 
                icon: 'bi-cash-stack' 
              },
              { 
                step: '03', 
                title: 'Referral System', 
                desc: 'Build your network and earn referral income on every investment made', 
                icon: 'bi-people-fill' 
              },
              { 
                step: '04', 
                title: 'Easy Withdrawal', 
                desc: 'Monthly withdrawal system with processing within 24 hours', 
                icon: 'bi-bank' 
              },
            ].map((item, index) => (
              <motion.div 
                key={index}
                {...staggerItem}
                className="col-md-6 col-lg-3"
              >
                <div className={`text-center ${styles.stepCard}`}>
                  <div className={styles.stepNumber}>{item.step}</div>
                  <div className={styles.stepIcon}>
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <h6 className="fw-bold mt-3 mb-2">{item.title}</h6>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-5 ${styles.ctaSection}`}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="display-4 fw-bold text-white mb-4">Ready to Start Your Investment Journey?</h2>
            <p className="lead text-white mb-5">
              Join thousands of investors who trust {PLATFORM_NAME} for their investment needs
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link href="/auth/register" className="btn btn-light btn-lg px-5">
                <i className="bi bi-rocket-takeoff me-2"></i>
                Get Started Now
              </Link>
              <Link href="/auth/login" className="btn btn-outline-light btn-lg px-5">
                <i className="bi bi-box-arrow-in-right me-2"></i>
                Login
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
}

