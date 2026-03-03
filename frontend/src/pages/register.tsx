import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import './Auth.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(formData.firstname, formData.lastname, formData.email, formData.password);
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h1 className="gradient-text">Create Account</h1>
          <p>Sign up to start managing your finances</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <Input
              type="text"
              name="firstname"
              label="First Name"
              placeholder="Enter your first name"
              value={formData.firstname}
              onChange={handleChange}
              icon={<User size={20} />}
              required
            />
            <Input
              type="text"
              name="lastname"
              label="Last Name"
              placeholder="Enter your last name"
              value={formData.lastname}
              onChange={handleChange}
              icon={<User size={20} />}
              required
            />
          </div>

          <Input
            type="email"
            name="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            icon={<Mail size={20} />}
            required
          />

          <div style={{ position: 'relative' }}>
            <Input
              type={showPassword ? 'text' : 'password'}
              name="password"
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              icon={<Lock size={20} />}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <Input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={<Lock size={20} />}
            required
          />

          <Button type="submit" loading={loading} fullWidth>
            Sign Up
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
