'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import { CONTACT_EMAIL, CONTACT_PHONE, SOCIAL_LINKS } from '@/utils/constants';
import styles from './page.module.css';

export default function ContactPage() {
  const heroRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }, 1500);
  };

  return (
    <div className={styles.contactPage}>
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
                  <i className="bi bi-envelope"></i>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={styles.heroTitle}
                >
                  Contact Us
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

      {/* Contact Section */}
      <section className={`py-5 ${styles.contactSection}`}>
        <div className="container">
          <div className="row g-4">
            {/* Contact Form */}
            <motion.div
              {...fadeInUp}
              className="col-lg-7"
            >
              <div className={styles.contactFormCard}>
                <h2 className="display-6 fw-bold mb-4">Send us a Message</h2>
                <p className="text-muted mb-4">
                  Have a question or need assistance? Fill out the form below and we'll get back to you as soon as possible.
                </p>
                
                {submitStatus === 'success' && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    Thank you! Your message has been sent successfully. We'll get back to you soon.
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setSubmitStatus(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                      <i className="bi bi-person me-2"></i>Full Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      <i className="bi bi-envelope me-2"></i>Email Address
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">
                      <i className="bi bi-tag me-2"></i>Subject
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="What is this regarding?"
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="message" className="form-label">
                      <i className="bi bi-chat-left-text me-2"></i>Message
                    </label>
                    <textarea
                      className="form-control"
                      id="message"
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className={`btn btn-primary btn-lg ${styles.submitBtn}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              {...fadeIn}
              className="col-lg-5"
            >
              <div className={styles.contactInfo}>
                <h2 className="display-6 fw-bold mb-4">Get in Touch</h2>
                <p className="text-muted mb-4">
                  We're here to help! Reach out to us through any of the following channels.
                </p>

                <motion.div
                  {...staggerContainer}
                >
                  <motion.div {...staggerItem}>
                    <div className={styles.contactMethodCard}>
                      <div className={styles.contactMethodIcon} style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-light))' }}>
                        <i className="bi bi-envelope-fill"></i>
                      </div>
                      <div className={styles.contactMethodContent}>
                        <h5 className="fw-bold mb-2">Email Us</h5>
                        <p className="text-muted mb-2">Send us an email anytime</p>
                        <a href={`mailto:${CONTACT_EMAIL}`} className={styles.contactLink}>
                          {CONTACT_EMAIL}
                        </a>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div {...staggerItem}>
                    <div className={styles.contactMethodCard}>
                      <div className={styles.contactMethodIcon} style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
                        <i className="bi bi-telephone-fill"></i>
                      </div>
                      <div className={styles.contactMethodContent}>
                        <h5 className="fw-bold mb-2">Call Us</h5>
                        <p className="text-muted mb-2">Mon - Fri, 9:00 AM - 6:00 PM</p>
                        <a href={`tel:${CONTACT_PHONE}`} className={styles.contactLink}>
                          {CONTACT_PHONE}
                        </a>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div {...staggerItem}>
                    <div className={styles.contactMethodCard}>
                      <div className={styles.contactMethodIcon} style={{ background: 'linear-gradient(135deg, var(--success), #059669)' }}>
                        <i className="bi bi-clock-fill"></i>
                      </div>
                      <div className={styles.contactMethodContent}>
                        <h5 className="fw-bold mb-2">Response Time</h5>
                        <p className="text-muted mb-2">We typically respond within</p>
                        <p className="fw-bold text-primary mb-0">24 hours</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Social Media */}
                <div className={styles.socialSection}>
                  <h5 className="fw-bold mb-3">Follow Us</h5>
                  <div className="d-flex gap-3">
                    <a 
                      href={SOCIAL_LINKS.facebook} 
                      className={styles.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Facebook"
                    >
                      <i className="bi bi-facebook"></i>
                    </a>
                    <a 
                      href={SOCIAL_LINKS.twitter} 
                      className={styles.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Twitter"
                    >
                      <i className="bi bi-twitter-x"></i>
                    </a>
                    <a 
                      href={SOCIAL_LINKS.linkedin} 
                      className={styles.socialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                    >
                      <i className="bi bi-linkedin"></i>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-5 ${styles.faqSection}`}>
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Frequently Asked Questions</h2>
            <p className="lead text-muted">Quick answers to common questions</p>
          </motion.div>

          <motion.div 
            {...staggerContainer}
            className="row g-4"
          >
            {[
              {
                question: 'How do I get started with investing?',
                answer: 'Simply register an account, verify your mobile number with OTP, and make your first investment starting from 10 USDT.'
              },
              {
                question: 'What is the minimum investment amount?',
                answer: 'The minimum investment is 10 USDT. You can add multiple investments to reach higher thresholds.'
              },
              {
                question: 'When can I withdraw my earnings?',
                answer: 'Withdrawals are unlocked once your total investment reaches 500 USDT. You can withdraw up to 30% of monthly interest once per month.'
              },
              {
                question: 'How does the referral system work?',
                answer: 'When someone invests using your referral code, you earn referral income that is added directly to your investment balance. You need at least 500 USDT investment to earn referral income.'
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                {...staggerItem}
                className="col-md-6"
              >
                <div className={`card h-100 border-0 shadow-sm ${styles.faqCard}`}>
                  <div className="card-body p-4">
                    <h5 className="fw-bold mb-3">
                      <i className="bi bi-question-circle text-primary me-2"></i>
                      {faq.question}
                    </h5>
                    <p className="text-muted mb-0">{faq.answer}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
}

