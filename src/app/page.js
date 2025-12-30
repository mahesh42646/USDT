'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import { PLATFORM_NAME, PLATFORM_DESCRIPTION } from '@/utils/constants';
import styles from './page.module.css';

export default function Home() {
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
    <div className={styles.homePage}>
      <UserHeader />
      
      {/* Hero Section */}
      <section ref={heroRef} className={styles.heroSection}
        style={{ 
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.46), rgba(90, 90, 90, 0.16)), url('/herobg.jpg')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center'
        }}>
        <motion.div 
          style={{ y, opacity }}
        
          className="container"
        >
          <div className="row align-items-center min-vh-75 pb-5"

          >
            <div className="col-lg-6">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className={`display-4 fw-bold mb-4 ${styles.heroTitle}`}>
                  Invest in USDT
                  <span className={`d-block text-white`}>Earn Daily Rewards</span>
                </h1>
                <p className="lead mb-4 text-white">
                  Join our secure USDT-based investment platform with a transparent referral system. 
                  Start with just 10 USDT and unlock your earning potential.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Link href="/auth/register" className="btn btn-primary btn-lg px-4">
                    <i className="bi bi-rocket-takeoff me-2"></i>
                    Get Started
                  </Link>
                  <Link href="/about" className="btn btn-outline-primary text-white  btn-lg px-4">
                    <i className="bi bi-info-circle me-2"></i>
                    Learn More
                  </Link>
                </div>
                <div className="mt-5 d-flex gap-5">
                  <div>
                    <h3 className={`fw-bold mb-0 text-white `}>0.50%</h3>
                    <p className="text-white small mb-0">Base Daily Interest</p>
                  </div>
                  <div>
                    <h3 className={`fw-bold mb-0 text-white `}>2.00%</h3>
                    <p className="text-white small mb-0">Max Daily Interest</p>
                  </div>
                  <div>
                    <h3 className={`fw-bold mb-0 text-white `}>10 USDT</h3>
                    <p className="text-white small mb-0">Minimum Investment</p>
                  </div>
                </div>
              </motion.div>
            </div>
        
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className={`py-5 ${styles.featuresSection}`}>
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Why Choose {PLATFORM_NAME}?</h2>
            <p className="lead text-muted">Secure, transparent, and designed for long-term growth</p>
          </motion.div>

          <motion.div 
            {...staggerContainer}
            className="row g-4"
          >
            {[
              { icon: 'bi-shield-check', title: 'Secure Platform', desc: 'USDT (TRC20) based secure transactions with blockchain technology' },
              { icon: 'bi-graph-up', title: 'Daily Rewards', desc: 'Earn daily interest starting from 0.50% up to 2.00% based on referrals' },
              { icon: 'bi-people', title: 'Referral System', desc: 'Build your network and earn referral income on every investment' },
              { icon: 'bi-clock-history', title: '24/7 Support', desc: 'Round-the-clock customer support for all your queries' },
              { icon: 'bi-wallet2', title: 'Easy Withdrawal', desc: 'Monthly withdrawal system with processing within 24 hours' },
              { icon: 'bi-award', title: 'Special Plans', desc: 'Special Investor Plan for investments above 10,000 USDT' },
            ].map((feature, index) => (
              <motion.div 
                key={index}
                {...staggerItem}
                className="col-md-4"
              >
                <div className={`card h-100 border-0 shadow-sm ${styles.featureCard}`}>
                  <div className="card-body text-center p-4">
                    <div className={`${styles.featureIcon} mb-3`}>
                      <i className={`bi ${feature.icon}`}></i>
                    </div>
                    <h5 className="fw-bold mb-3">{feature.title}</h5>
                    <p className="text-muted mb-0">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`py-5 ${styles.howItWorksSection}`}>
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">How It Works</h2>
            <p className="lead text-muted">Simple steps to start earning</p>
          </motion.div>

          <motion.div 
            {...staggerContainer}
            className="row g-4 justify-content-center"
          >
            {[
              { step: '01', title: 'Register', desc: 'Sign up with your mobile number and verify with OTP', icon: 'bi-person-plus' },
              { step: '02', title: 'Invest', desc: 'Start investing from 10 USDT minimum. Add investments multiple times', icon: 'bi-wallet2' },
              { step: '03', title: 'Earn Daily', desc: 'Get daily interest rewards starting from 0.50% per day', icon: 'bi-cash-coin' },
              { step: '04', title: 'Refer & Grow', desc: 'Invite friends and increase your daily interest up to 2.00%', icon: 'bi-people' },
              { step: '05', title: 'Withdraw', desc: 'Once you reach 500 USDT, unlock monthly withdrawals', icon: 'bi-bank' },
            ].map((item, index) => (
              <motion.div 
                key={index}
                {...staggerItem}
                className="col-lg-2 col-md-4 col-sm-6 col-12"
              >
                <div className={styles.stepCard}>
                  <div className={styles.stepNumber}>{item.step}</div>
                  <div className={styles.stepIcon}>
                    <i className={`bi ${item.icon}`}></i>
                  </div>
                  <h6 className="fw-bold">{item.title}</h6>
                  <p className="text-muted small">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Investment Plans Section */}
      <section className={`py-5 ${styles.plansSection}`}>
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-5">
            <h2 className={styles.plansTitle}>Investment Plans</h2>
            <p className={styles.plansSubtitle}>Choose the plan that suits you</p>
          </motion.div>

          <div className="row g-4 justify-content-center">
            <motion.div
              {...fadeInUp}
              className="col-lg-5 col-md-6"
            >
              <div className={`${styles.planCard} ${styles.standardCard}`}>
                <div className={styles.planHeader}>
                  <h4 className={styles.planName}>Standard Plan</h4>
                  <span className={styles.popularBadge}>Popular</span>
                </div>
                <div className={styles.planRate}>
                  <h2 className={styles.interestRate}>0.50%</h2>
                  <p className={styles.rateDescription}>Base Daily Interest</p>
                </div>
                <ul className={styles.planFeatures}>
                  <li>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Minimum: 10 USDT</span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Interest increases with referrals</span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Max interest: 2.00% per day</span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Withdrawal unlock at 500 USDT</span>
                  </li>
                </ul>
                <Link href="/auth/register" className={styles.planButton}>
                  Get Started
                </Link>
              </div>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="col-lg-5 col-md-6"
            >
              <div className={`${styles.planCard} ${styles.premiumCard}`}>
                <div className={styles.planHeader}>
                  <h4 className={styles.planName}>Special Investor</h4>
                  <span className={styles.premiumBadge}>Premium</span>
                </div>
                <div className={styles.planRate}>
                  <h2 className={styles.interestRate}>1.00%</h2>
                  <p className={styles.rateDescription}>Fixed Daily Interest</p>
                </div>
                <ul className={styles.planFeatures}>
                  <li>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Minimum: 10,000 USDT</span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Fixed 1% daily interest</span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>No referral requirements</span>
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill"></i>
                    <span>Monthly withdrawal available</span>
                  </li>
                </ul>
                <Link href="/auth/register" className={styles.planButton}>
                  Get Started
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={`py-5 ${styles.benefitsSection}`}>
        <div className="container">
          <div className="row align-items-center">
            <motion.div
              {...fadeInUp}
              className="col-lg-6"
            >
              <h2 className="display-5 fw-bold mb-4">Key Benefits</h2>
              <div className={styles.benefitList}>
                {[
                  'Cumulative investment system - add multiple times',
                  'Daily interest calculation - no compounding',
                  'Referral income added to investment balance',
                  'Monthly withdrawal system after 500 USDT',
                  'Transparent and secure platform',
                  '24-hour withdrawal processing',
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="d-flex align-items-start mb-3"
                  >
                    <i className="bi bi-check2-circle text-success me-3 mt-1" style={{ fontSize: '1.5rem' }}></i>
                    <p className="mb-0 lead">{benefit}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              {...fadeIn}
              className="col-lg-6"
            >
              <div className={styles.benefitsImage}>
                <div className={styles.statCard}>
                  <h3 className={`display-3 fw-bold ${styles.statNumber}`}>500 USDT</h3>
                  <p className="text-muted">Withdrawal Unlock Threshold</p>
                </div>
              </div>
            </motion.div>
          </div>
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
            <h2 className="display-4 fw-bold text-white mb-4">Ready to Start Earning?</h2>
            <p className="lead text-white mb-5">Join thousands of investors earning daily rewards</p>
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
