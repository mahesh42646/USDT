'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTACT_EMAIL, CONTACT_PHONE } from '@/utils/constants';
import styles from './HelpModal.module.css';

export default function HelpModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

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
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => {
        setSubmitStatus(null);
        onClose();
      }, 2000);
    }, 1500);
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', message: '' });
    setSubmitStatus(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className={styles.modal}
            style={{
              x: '-50%',
              y: '-50%'
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <i className="bi bi-question-circle me-2"></i>
                How Can We Help You?
              </h3>
              <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className={styles.modalBody}>
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
                <>
                  <p className={styles.modalDescription}>
                    Have a question or need assistance? Fill out the form below and we'll get back to you as soon as possible.
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label htmlFor="help-name" className="form-label">
                        <i className="bi bi-person me-2"></i>Your Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="help-name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your name"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="help-email" className="form-label">
                        <i className="bi bi-envelope me-2"></i>Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="help-email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="help-message" className="form-label">
                        <i className="bi bi-chat-left-text me-2"></i>How Can We Help?
                      </label>
                      <textarea
                        className="form-control"
                        id="help-message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Tell us what you need help with..."
                      ></textarea>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary flex-fill"
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
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleClose}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>

                  <div className={styles.contactInfo}>
                    <p className="text-muted small mb-2">Or contact us directly:</p>
                    <div className="d-flex flex-column gap-2">
                      <a href={`mailto:${CONTACT_EMAIL}`} className={styles.contactLink}>
                        <i className="bi bi-envelope-fill me-2"></i>
                        {CONTACT_EMAIL}
                      </a>
                      <a href={`tel:${CONTACT_PHONE}`} className={styles.contactLink}>
                        <i className="bi bi-telephone-fill me-2"></i>
                        {CONTACT_PHONE}
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

