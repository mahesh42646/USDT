'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import { CONTACT_EMAIL, CONTACT_PHONE, PLATFORM_NAME } from '@/utils/constants';
import styles from './page.module.css';

export default function SupportPage() {
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
    <div className={styles.supportPage}>
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
                  <i className="bi bi-headset"></i>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={styles.heroTitle}
                >
                  Support Center
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={styles.heroSubtitle}
                >
                  We're here to help you 24/7. Get in touch with our support team
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

      {/* Contact Form Section */}
      <section className={`py-5 ${styles.contactFormSection}`}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <motion.div
                {...fadeInUp}
                className="text-center mb-5"
              >
                <h2 className={styles.sectionTitle}>Send Us a Message</h2>
                <p className={styles.sectionSubtitle}>
                  Fill out the form below and we'll get back to you as soon as possible
                </p>
              </motion.div>

              <motion.div
                {...fadeIn}
                className={styles.formCard}
              >
                {submitStatus === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={styles.successMessage}
                  >
                    <i className="bi bi-check-circle-fill"></i>
                    <h4>Thank You!</h4>
                    <p>We've received your message and will get back to you soon.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label htmlFor="support-name" className="form-label">
                        <i className="bi bi-person me-2"></i>Your Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="support-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="support-email" className="form-label">
                        <i className="bi bi-envelope me-2"></i>Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="support-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email address"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="support-subject" className="form-label">
                        <i className="bi bi-tag me-2"></i>Subject
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="support-subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="What is this regarding?"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="support-message" className="form-label">
                        <i className="bi bi-chat-left-text me-2"></i>Message
                      </label>
                      <textarea
                        className="form-control"
                        id="support-message"
                        name="message"
                        rows="6"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us how we can help you..."
                      ></textarea>
                    </div>

                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
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
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className={`py-5 ${styles.contactInfoSection}`}>
        <div className="container">
          <motion.div
            {...fadeInUp}
            className="text-center mb-5"
          >
            <h2 className={styles.sectionTitle}>Other Ways to Reach Us</h2>
            <p className={styles.sectionSubtitle}>Choose the method that works best for you</p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="row g-4"
          >
            <motion.div
              {...staggerItem}
              className="col-md-6 col-lg-4"
            >
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <h4 className={styles.contactTitle}>Email Us</h4>
                <p className={styles.contactDescription}>
                  Send us an email and we'll respond within 24 hours
                </p>
                <a href={`mailto:${CONTACT_EMAIL}`} className={styles.contactLink}>
                  {CONTACT_EMAIL}
                  <i className="bi bi-arrow-right ms-2"></i>
                </a>
              </div>
            </motion.div>

            <motion.div
              {...staggerItem}
              className="col-md-6 col-lg-4"
            >
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <i className="bi bi-telephone-fill"></i>
                </div>
                <h4 className={styles.contactTitle}>Call Us</h4>
                <p className={styles.contactDescription}>
                  Speak directly with our support team
                </p>
                <a href={`tel:${CONTACT_PHONE}`} className={styles.contactLink}>
                  {CONTACT_PHONE}
                  <i className="bi bi-arrow-right ms-2"></i>
                </a>
              </div>
            </motion.div>

            <motion.div
              {...staggerItem}
              className="col-md-6 col-lg-4"
            >
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>
                  <i className="bi bi-clock-fill"></i>
                </div>
                <h4 className={styles.contactTitle}>Support Hours</h4>
                <p className={styles.contactDescription}>
                  We're available 24/7 to assist you
                </p>
                <p className={styles.contactInfo}>
                  <strong>24/7 Support</strong><br />
                  Always here to help
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className={`py-5 ${styles.faqSection}`}>
        <div className="container">
          <motion.div
            {...fadeInUp}
            className="text-center mb-5"
          >
            <h2 className={styles.sectionTitle}>Common Questions</h2>
            <p className={styles.sectionSubtitle}>Quick answers to frequently asked questions</p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="row g-4"
          >
            {[
              {
                question: 'How quickly will I receive a response?',
                answer: 'We aim to respond to all inquiries within 24 hours. For urgent matters, please call us directly.'
              },
              {
                question: 'What information should I include in my support request?',
                answer: 'Please include your account details (if applicable), a clear description of the issue, and any relevant screenshots or transaction hashes.'
              },
              {
                question: 'Can I track my support ticket?',
                answer: 'Yes, once you submit a support request, you\'ll receive a confirmation email with a ticket number that you can use to track your request.'
              },
              {
                question: 'Is support available in multiple languages?',
                answer: 'Currently, we provide support in English. We\'re working on adding more languages in the future.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                {...staggerItem}
                className="col-md-6"
              >
                <div className={styles.faqCard}>
                  <h5 className={styles.faqQuestion}>
                    <i className="bi bi-question-circle me-2"></i>
                    {faq.question}
                  </h5>
                  <p className={styles.faqAnswer}>{faq.answer}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            {...fadeIn}
            className="text-center mt-5"
          >
            <a href="/helpcenter" className="btn btn-outline-primary btn-lg">
              <i className="bi bi-book me-2"></i>
              Visit Help Center
            </a>
          </motion.div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
}

