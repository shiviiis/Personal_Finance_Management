import React from 'react';
import Card from '../components/ui/Card';
import './Legal.css';

const Terms: React.FC = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Card>
          <h1 className="gradient-text">Terms & Conditions</h1>
          <p className="legal-date">Last updated: February 4, 2026</p>

          <section className="legal-section">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing and using FinanceFlow, you accept and agree to be bound by the terms and provision
              of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily use FinanceFlow for personal, non-commercial transitory viewing only.
              This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to decompile or reverse engineer any software contained in FinanceFlow</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. User Account</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept
              responsibility for all activities that occur under your account.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Disclaimer</h2>
            <p>
              The materials on FinanceFlow are provided on an 'as is' basis. FinanceFlow makes no warranties, expressed
              or implied, and hereby disclaims and negates all other warranties including, without limitation, implied
              warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of
              intellectual property or other violation of rights.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Limitations</h2>
            <p>
              In no event shall FinanceFlow or its suppliers be liable for any damages (including, without limitation,
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability
              to use FinanceFlow.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws and you irrevocably
              submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="legal-section">
            <h2>7. Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at legal@financeflow.com
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default Terms;
