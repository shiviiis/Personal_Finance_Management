import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-section">
            <h3 className="footer-logo gradient-text">FinanceFlow</h3>
            <p className="footer-description">
              Your personal finance management companion. Track expenses, monitor income, and achieve your financial goals.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li><Link to="/transactions">Transactions</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="footer-section">
            <h4 className="footer-title">Connect</h4>
            <div className="footer-social">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <Github size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <Linkedin size={20} />
              </a>
              <a href="mailto:contact@financeflow.com" className="social-icon">
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} FinanceFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
