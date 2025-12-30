'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import UserHeader from '@/components/shared/UserHeader';
import UserFooter from '@/components/shared/UserFooter';
import { CONTACT_EMAIL, CONTACT_PHONE, PLATFORM_NAME } from '@/utils/constants';
import styles from './page.module.css';

export default function HelpCenterPage() {
  const heroRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

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

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: 'bi-rocket-takeoff',
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'To create an account, click on "Register" in the header, enter your mobile number, and verify it with the OTP sent to your phone. Once verified, your account will be created.'
        },
        {
          question: 'What is the minimum investment amount?',
          answer: 'The minimum investment is 10 USDT. You can make multiple investments, and all investments are cumulative toward your total investment balance.'
        },
        {
          question: 'How do I make my first investment?',
          answer: 'After logging in, go to the Investment page, enter the amount (minimum 10 USDT), provide your USDT wallet address and transaction hash, then submit. Your investment will be processed after blockchain confirmation.'
        },
        {
          question: 'Do I need to verify my identity?',
          answer: 'Currently, we only require mobile number verification via OTP. No additional identity verification is needed for basic account creation.'
        }
      ]
    },
    {
      title: 'Investments & Interest',
      icon: 'bi-wallet2',
      faqs: [
        {
          question: 'How is daily interest calculated?',
          answer: 'Interest is calculated daily on your total cumulative investment balance. Base rate is 0.50% per day, which increases by 0.05% for every 10 direct active referrals, up to a maximum of 2.00% per day. Interest is NOT compounded.'
        },
        {
          question: 'What is the Special Investor Plan?',
          answer: 'Users investing 10,000 USDT or more qualify for the Special Investor Plan, which provides a fixed 1% daily interest rate regardless of referral count.'
        },
        {
          question: 'Can I add multiple investments?',
          answer: 'Yes! You can make multiple investments at any time. All investments are cumulative and added to your total investment balance for interest calculation.'
        },
        {
          question: 'When is interest credited to my account?',
          answer: 'Interest is calculated and credited daily to your interest balance. You can view your daily interest earnings in your dashboard.'
        }
      ]
    },
    {
      title: 'Referrals',
      icon: 'bi-people',
      faqs: [
        {
          question: 'How does the referral system work?',
          answer: 'When someone uses your referral code to register and invest, you earn referral income. Your daily interest rate also increases by 0.05% for every 10 direct active referrals, up to 2.00% maximum.'
        },
        {
          question: 'What are the referral income percentage slabs?',
          answer: 'Referral income percentages: 10-49 referrals (0.5%), 50-90 referrals (1.0%), 91-120 referrals (1.5%), 121-150 referrals (2.0%), 151+ referrals (3.0%).'
        },
        {
          question: 'Do I need to invest to earn referral income?',
          answer: 'Yes, you need a minimum total investment of 500 USDT to be eligible to earn referral income. Referral income is added directly to your investment balance, not paid in cash.'
        },
        {
          question: 'Where can I find my referral code?',
          answer: 'You can find your unique referral code in the Referrals section of your dashboard. Share this code with others to earn referral income.'
        }
      ]
    },
    {
      title: 'Withdrawals',
      icon: 'bi-cash-coin',
      faqs: [
        {
          question: 'When can I withdraw my earnings?',
          answer: 'Withdrawals are locked until your total investment reaches 500 USDT. Once this threshold is reached, interest withdrawals are unlocked and a monthly withdrawal cycle begins.'
        },
        {
          question: 'What are the withdrawal limits?',
          answer: 'Minimum withdrawal: 20 USDT. Maximum withdrawal: 30% of your monthly interest earnings. You can withdraw once per month only.'
        },
        {
          question: 'How long does withdrawal processing take?',
          answer: 'Withdrawal requests are processed within 24 hours. Large withdrawals may require manual admin approval for security purposes.'
        },
        {
          question: 'Who pays the network fees for withdrawals?',
          answer: 'All network/gas fees for withdrawals are paid by the user. The platform does not charge additional withdrawal fees.'
        }
      ]
    },
    {
      title: 'Account & Security',
      icon: 'bi-shield-check',
      faqs: [
        {
          question: 'Can I have multiple accounts?',
          answer: 'No. Each user is permitted to maintain only one account. Creating multiple accounts using different mobile numbers is strictly prohibited and will result in permanent account suspension.'
        },
        {
          question: 'What happens if my account is inactive?',
          answer: 'Accounts inactive for 60 days will have interest calculations paused until the account becomes active again. You must log in at least once every 60 days to maintain active status.'
        },
        {
          question: 'How do I secure my account?',
          answer: 'Keep your account credentials confidential. Never share your login information with anyone. If you suspect unauthorized access, contact support immediately.'
        },
        {
          question: 'What payment methods are accepted?',
          answer: 'We only accept USDT (TRC20) cryptocurrency for investments. You need a TRC20-compatible wallet to send USDT.'
        }
      ]
    },
    {
      title: 'Technical Support',
      icon: 'bi-gear',
      faqs: [
        {
          question: 'How do I contact support?',
          answer: 'You can contact our support team via email at ' + CONTACT_EMAIL + ' or call us at ' + CONTACT_PHONE + '. We typically respond within 24 hours.'
        },
        {
          question: 'What should I do if my transaction is pending?',
          answer: 'Blockchain transactions may take time to confirm. Wait for network confirmation. If your transaction is still pending after 24 hours, contact support with your transaction hash.'
        },
        {
          question: 'I forgot my password. How do I reset it?',
          answer: 'We use Firebase phone authentication, so you can log in using your registered mobile number and OTP verification. No password is required.'
        },
        {
          question: 'The website is not loading properly. What should I do?',
          answer: 'Try clearing your browser cache, disabling browser extensions, or using a different browser. If the issue persists, contact our technical support team.'
        }
      ]
    }
  ];

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className={styles.helpCenterPage}>
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
                  <i className="bi bi-question-circle"></i>
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={styles.heroTitle}
                >
                  Help Center
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={styles.heroSubtitle}
                >
                  Find answers to common questions and get the support you need
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

      {/* Search Section */}
      <section className={`py-5 ${styles.searchSection}`}>
        <div className="container">
          <motion.div
            {...fadeInUp}
            className="row justify-content-center"
          >
            <div className="col-lg-8">
              <div className={styles.searchBox}>
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className={styles.clearButton}
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className={`py-5 ${styles.faqSection}`}>
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Frequently Asked Questions</h2>
            <p className="lead text-muted">Browse by category or search for specific topics</p>
          </motion.div>

          {filteredFaqs.length === 0 && searchQuery ? (
            <motion.div {...fadeInUp} className="text-center py-5">
              <i className="bi bi-search" style={{ fontSize: '4rem', color: 'var(--gray-400)' }}></i>
              <h3 className="mt-4">No results found</h3>
              <p className="text-muted">Try different keywords or browse categories below</p>
            </motion.div>
          ) : (
            <motion.div
              {...staggerContainer}
              className="row g-4"
            >
              {filteredFaqs.map((category, categoryIndex) => (
                <motion.div
                  key={categoryIndex}
                  {...staggerItem}
                  className="col-lg-6"
                >
                  <div className={styles.categoryCard}>
                    <div className={styles.categoryHeader}>
                      <div className={styles.categoryIcon}>
                        <i className={`bi ${category.icon}`}></i>
                      </div>
                      <h3 className={styles.categoryTitle}>{category.title}</h3>
                    </div>
                    <div className={styles.faqList}>
                      {category.faqs.map((faq, faqIndex) => {
                        const faqId = `${categoryIndex}-${faqIndex}`;
                        const isExpanded = expandedFaq === faqId;
                        return (
                          <div key={faqIndex} className={styles.faqItem}>
                            <button
                              className={`${styles.faqQuestion} ${isExpanded ? styles.active : ''}`}
                              onClick={() => toggleFaq(faqId)}
                            >
                              <span>{faq.question}</span>
                              <i className={`bi ${isExpanded ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                            </button>
                            <motion.div
                              initial={false}
                              animate={{
                                height: isExpanded ? 'auto' : 0,
                                opacity: isExpanded ? 1 : 0
                              }}
                              transition={{ duration: 0.3 }}
                              className={styles.faqAnswer}
                            >
                              <div className={styles.faqAnswerContent}>
                                <p>{faq.answer}</p>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Quick Links Section */}
      <section className={`py-5 ${styles.quickLinksSection}`}>
        <div className="container">
          <motion.div {...fadeInUp} className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Quick Links</h2>
            <p className="lead text-muted">Common resources and helpful pages</p>
          </motion.div>

          <motion.div
            {...staggerContainer}
            className="row g-4"
          >
            {[
              { icon: 'bi-file-earmark-text', title: 'Terms of Service', link: '/terms', desc: 'Read our terms and conditions' },
              { icon: 'bi-shield-lock', title: 'Privacy Policy', link: '/privacy', desc: 'Learn about our privacy practices' },
              { icon: 'bi-envelope', title: 'Contact Us', link: '/contact', desc: 'Get in touch with our team' },
              { icon: 'bi-info-circle', title: 'About Us', link: '/about', desc: 'Learn more about ' + PLATFORM_NAME },
            ].map((link, index) => (
              <motion.div
                key={index}
                {...staggerItem}
                className="col-md-6 col-lg-3"
              >
                <Link href={link.link} className={styles.quickLinkCard}>
                  <div className={styles.quickLinkIcon}>
                    <i className={`bi ${link.icon}`}></i>
                  </div>
                  <h5 className={styles.quickLinkTitle}>{link.title}</h5>
                  <p className={styles.quickLinkDesc}>{link.desc}</p>
                  <i className={`bi bi-arrow-right ${styles.quickLinkArrow}`}></i>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={`py-5 ${styles.contactSection}`}>
        <div className="container">
          <motion.div
            {...fadeInUp}
            className="text-center"
          >
            <h2 className={`display-5 fw-bold mb-4 ${styles.contactTitle}`}>Still Need Help?</h2>
            <p className={`lead mb-5 ${styles.contactDescription}`}>
              Can't find what you're looking for? Our support team is here to help you 24/7.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <a href={`mailto:${CONTACT_EMAIL}`} className={`btn btn-lg px-4 ${styles.emailButton}`}>
                <i className="bi bi-envelope me-2"></i>
                Email Us
              </a>
              <a href={`tel:${CONTACT_PHONE}`} className={`btn btn-lg px-4 ${styles.callButton}`}>
                <i className="bi bi-telephone me-2"></i>
                Call Us
              </a>
              <Link href="/contact" className={`btn btn-lg px-4 ${styles.contactFormButton}`}>
                <i className="bi bi-chat-left-text me-2"></i>
                Contact Form
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <UserFooter />
    </div>
  );
}

