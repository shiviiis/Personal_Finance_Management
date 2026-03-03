import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import './Auth.css';

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const { verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      alert('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      await verifyOTP(email, otpCode);
      navigate('/login');
    } catch (error) {
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h1 className="gradient-text">Verify Your Email</h1>
          <p>Enter the 6-digit code sent to {email}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                className="otp-input"
                required
              />
            ))}
          </div>

          <div className="otp-timer">
            Time remaining: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>

          <Button type="submit" loading={loading} fullWidth>
            Verify OTP
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Didn't receive the code?{' '}
            <button className="auth-link" type="button">
              Resend
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default VerifyOTP;
