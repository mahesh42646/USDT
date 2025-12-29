'use client';

import Link from 'next/link';
import 'bootstrap-icons/font/bootstrap-icons.css';
import styles from './UserFooter.module.css';

export default function UserFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'FAQs', href: '/faq' },
      { name: 'Support', href: '/support' },
    ],
    legal: [
      { name: 'Disclaimer', href: '/disclaimer' },
      { name: 'Risk Disclosure', href: '/risk' },
    ],
  };

  return (
    <footer className={`${styles.userFooter} bg-light mt-auto`}>
      <div className="container">
        <div className="row py-5">
          {/* Company Info */}
          <div className="col-lg-4 col-md-6 mb-4 mb-md-0">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-graph-up-arrow text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
              <h5 className="fw-bold mb-0">GroandInvest</h5>
            </div>
            <p className="text-muted small">
              USDT-based investment platform with referral system. 
              Secure, transparent, and designed for long-term growth.
            </p>
            <div className="mt-3">
              <span className="text-muted small">© {currentYear} GroandInvest. All rights reserved.</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
            <h6 className="fw-semibold mb-3">Company</h6>
            <ul className="list-unstyled">
              {footerLinks.company.map((link) => (
                <li key={link.name} className="mb-2">
                  <Link href={link.href} className={`${styles.footerLink} text-muted small d-flex align-items-center`}>
                    <i className="bi bi-chevron-right me-1" style={{ fontSize: '0.75rem' }}></i>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
            <h6 className="fw-semibold mb-3">Support</h6>
            <ul className="list-unstyled">
              {footerLinks.support.map((link) => (
                <li key={link.name} className="mb-2">
                  <Link href={link.href} className={`${styles.footerLink} text-muted small d-flex align-items-center`}>
                    <i className="bi bi-chevron-right me-1" style={{ fontSize: '0.75rem' }}></i>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="col-lg-2 col-md-6 mb-4 mb-md-0">
            <h6 className="fw-semibold mb-3">Legal</h6>
            <ul className="list-unstyled">
              {footerLinks.legal.map((link) => (
                <li key={link.name} className="mb-2">
                  <Link href={link.href} className={`${styles.footerLink} text-muted small d-flex align-items-center`}>
                    <i className="bi bi-chevron-right me-1" style={{ fontSize: '0.75rem' }}></i>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-2 col-md-6">
            <h6 className="fw-semibold mb-3">Contact</h6>
            <ul className="list-unstyled">
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-envelope text-muted me-2"></i>
                <span className="text-muted small">support@groandinvest.com</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-telephone text-muted me-2"></i>
                <span className="text-muted small">+1 (555) 123-4567</span>
              </li>
            </ul>
            <div className="mt-3">
              <p className="text-muted small mb-2">Follow Us:</p>
              <div className="d-flex gap-2">
                <a href="#" className={styles.socialLink} aria-label="Facebook">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className={styles.socialLink} aria-label="Twitter">
                  <i className="bi bi-twitter-x"></i>
                </a>
                <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={`${styles.footerBottom} border-top pt-3 pb-3`}>
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="text-muted small mb-0">
                This is a digital reward & participation model. Returns are variable and not guaranteed.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="text-muted small mb-0">
                Subject to platform terms and risk disclosures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
