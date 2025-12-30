'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import { PLATFORM_NAME } from '@/utils/constants';
import styles from './page.module.css';

export default function HowItWorksPage() {
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

  const steps = [
    {
      number: '01',
      title: 'Register',
      description: 'Sign up with your mobile number and verify with OTP',
      icon: 'bi-person-plus-fill'
    },
    {
      number: '02',
      title: 'Invest',
      description: 'Start investing from 10 USDT minimum. Add investments multiple times',
      icon: 'bi-wallet2'
    },
    {
      number: '03',
      title: 'Earn Daily',
      description: 'Get daily interest rewards starting from 0.50% per day',
      icon: 'bi-cash-stack'
    },
    {
      number: '04',
      title: 'Refer & Grow',
      description: 'Invite friends and increase your daily interest up to 2.00%',
      icon: 'bi-people-fill'
    },
    {
      number: '05',
      title: 'Withdraw',
      description: 'Once you reach 500 USDT, unlock monthly withdrawals',
      icon: 'bi-bank'
    }
  ];

  return (
    <div className={styles.howItWorksPage}>
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
                  <i className="bi bi-diagram-3"></i>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={styles.heroTitle}
                >
                  How It Works
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={styles.heroSubtitle}
                >
                  Simple steps to start earning
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

      {/* Steps Section */}
      <section className={`py-5 ${styles.stepsSection}`}>
        <div className="container">
          <motion.div
            {...staggerContainer}
            className="row g-4 justify-content-center"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                {...staggerItem}
                className="col-lg-2 col-md-4 col-sm-6 col-12"
              >
                <div className={styles.stepCard}>
                  <div className={styles.stepIconWrapper}>
                    <div className={styles.stepIcon}>
                      <i className={`bi ${step.icon}`}></i>
                    </div>
                  </div>
                  <h4 className={styles.stepTitle}>{step.title}</h4>
                  <p className={styles.stepDescription}>{step.description}</p>
                  <div className={styles.stepNumber}>{step.number}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Detailed Information Section */}
      <section className={`py-5 ${styles.detailsSection}`}>
        <div className="container">
          <motion.div
            {...fadeInUp}
            className="text-center mb-5"
          >
            <h2 className="display-5 fw-bold mb-3">Get Started Today</h2>
            <p className="lead text-muted">Join thousands of investors earning daily rewards</p>
          </motion.div>

          <div className="row g-4">
            {[
              {
                icon: 'bi-shield-check',
                title: 'Secure & Safe',
                description: 'Your investments are secured with blockchain technology and USDT (TRC20)',
                color: 'var(--success)'
              },
              {
                icon: 'bi-graph-up-arrow',
                title: 'Daily Returns',
                description: 'Earn daily interest starting from 0.50% and up to 2.00% based on referrals',
                color: 'var(--accent)'
              },
              {
                icon: 'bi-people',
                title: 'Referral Income',
                description: 'Build your network and earn referral income on every investment made',
                color: 'var(--info)'
              },
              {
                icon: 'bi-clock-history',
                title: 'Quick Processing',
                description: 'Fast withdrawal processing within 24 hours after reaching 500 USDT',
                color: 'var(--warning)'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                {...staggerItem}
                className="col-md-6 col-lg-3"
              >
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon} style={{ background: feature.color }}>
                    <i className={`bi ${feature.icon}`}></i>
                  </div>
                  <h5 className={styles.featureTitle}>{feature.title}</h5>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`py-5 ${styles.ctaSection}`}>
        <div className="container">
          <motion.div
            {...fadeIn}
            className="text-center"
          >
            <h2 className="display-5 fw-bold text-white mb-4">Ready to Start Earning?</h2>
            <p className="lead text-white mb-5 opacity-90">
              Join {PLATFORM_NAME} today and start your investment journey
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link href="/auth/register" className="btn btn-light btn-lg px-5">
                <i className="bi bi-person-plus me-2"></i>
                Get Started
              </Link>
              <Link href="/about" className="btn btn-outline-light btn-lg px-5">
                <i className="bi bi-info-circle me-2"></i>
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
}

