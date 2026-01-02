'use client';

import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import { getPlatformName, PLATFORM_DESCRIPTION, CONTACT_EMAIL, CONTACT_PHONE, SOCIAL_LINKS } from '@/utils/constants';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './UserFooter.module.css';

export default function UserFooter() {
  const currentYear = new Date().getFullYear();
  const { settings } = useSettings();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    support: [
      { name: 'Help Center', href: '/helpcenter' },
      // { name: 'FAQs', href: '/faq' },
      { name: 'Support', href: '/support' },
    ],
    legal: [
      { name: 'Disclaimer', href: '/disclamier' },
      { name: 'Risk Disclosure', href: '/risk' },
    ],
  };

  return (
    <footer className={styles.userFooter}>
      <div className="container">
        {/* Main Footer Content */}
        <div className={styles.footerMain}>
          <div className="row g-4">
            {/* Company Info */}
            <div className="col-lg-4 col-md-6 col-12">
              <div className={styles.companySection}>
                <div className={styles.logoSection}>
                  <div className={styles.logoIcon}>
                    <i className="bi bi-graph-up-arrow"></i>
                  </div>
                  <h5 className={styles.logoText}>{getPlatformName(settings)}</h5>
                </div>
                <p className={styles.companyDescription}>
                  {PLATFORM_DESCRIPTION}. Secure, transparent, and designed for long-term growth.
                </p>
                <div className={styles.socialSection}>
                  <p className={styles.socialTitle}>Follow Us</p>
                  <div className={styles.socialLinks}>
                    <a href={SOCIAL_LINKS.facebook} className={styles.socialLink} aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-facebook"></i>
                    </a>
                    <a href={SOCIAL_LINKS.twitter} className={styles.socialLink} aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-twitter-x"></i>
                    </a>
                    <a href={SOCIAL_LINKS.linkedin} className={styles.socialLink} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-linkedin"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className={styles.linkSection}>
                <h6 className={styles.sectionTitle}>
                  <i className="bi bi-building me-2"></i>
                  Company
                </h6>
                <ul className={styles.linkList}>
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={styles.footerLink}>
                        <i className="bi bi-chevron-right"></i>
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Support */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className={styles.linkSection}>
                <h6 className={styles.sectionTitle}>
                  <i className="bi bi-headset me-2"></i>
                  Support
                </h6>
                <ul className={styles.linkList}>
                  {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={styles.footerLink}>
                        <i className="bi bi-chevron-right"></i>
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Legal */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className={styles.linkSection}>
                <h6 className={styles.sectionTitle}>
                  <i className="bi bi-shield-check me-2"></i>
                  Legal
                </h6>
                <ul className={styles.linkList}>
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className={styles.footerLink}>
                        <i className="bi bi-chevron-right"></i>
                        <span>{link.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-lg-2 col-md-6 col-6">
              <div className={styles.contactSection}>
                <h6 className={styles.sectionTitle}>
                  <i className="bi bi-envelope me-2"></i>
                  Contact
                </h6>
                <ul className={styles.contactList}>
                  <li>
                    <a href={`mailto:${CONTACT_EMAIL}`} className={styles.contactLink}>
                      <i className="bi bi-envelope-fill"></i>
                      <span>{CONTACT_EMAIL}</span>
                    </a>
                  </li>
                  <li>
                    <a href={`tel:${CONTACT_PHONE}`} className={styles.contactLink}>
                      <i className="bi bi-telephone-fill"></i>
                      <span>{CONTACT_PHONE}</span>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.footerBottom}>
          <div className="row align-items-center g-3">
            <div className="col-lg-6 col-md-12">
              <p className={styles.copyright}>
                © {currentYear} <strong>{getPlatformName(settings)}</strong>. All rights reserved.
              </p>
            </div>
            <div className="col-lg-6 col-md-12">
              <div className={styles.disclaimer}>
                <p className={styles.disclaimerText}>
                  <i className="bi bi-info-circle me-1"></i>
                  This is a digital reward & participation model. Returns are variable and not guaranteed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
