import React from 'react';
import Card from '../components/ui/Card';
import './Legal.css';

const Privacy: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Card>
          <h1 className="gradient-text">Privacy Policy</h1>
          <p className="legal-date">Last updated: February 4, 2026</p>

          <section className="legal-section">
            <h2>1. Introduction</h2>
            <p>
              Welcome to FinanceFlow. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we look after your personal data and tell you about
              your privacy rights.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Data We Collect</h2>
            <p>We collect and process the following types of personal data:</p>
            <ul>
              <li>Identity Data: name, email address</li>
              <li>Financial Data: transaction records, income and expense information</li>
              <li>Technical Data: IP address, browser type, device information</li>
              <li>Usage Data: how you use our website and services</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. How We Use Your Data</h2>
            <p>We use your personal data for the following purposes:</p>
            <ul>
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis to improve our service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal data against unauthorized access,
              alteration, disclosure, or destruction. All financial data is encrypted using industry-standard encryption.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request transfer of your data</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@financeflow.com
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;
