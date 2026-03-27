import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, PieChart, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import './Homepage.css';

const Homepage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const features = [
    { icon: TrendingUp, title: 'Track Expenses', description: 'Monitor your spending and income in real-time' },
    { icon: PieChart, title: 'Visual Analytics', description: 'Beautiful charts and insights about your finances' },
    { icon: Shield, title: 'Secure & Private', description: 'Your financial data is encrypted and protected' },
    { icon: Bell, title: 'Smart Alerts', description: 'Get notified about important transactions' },
  ];

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Take Control of Your <span className="gradient-text">Financial Future</span>
          </h1>
          <p className="hero-description">
            Track expenses, manage budgets, and achieve your financial goals with FinanceFlow
          </p>
          <div className="hero-buttons">
            <Link to="/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            {!isAuthenticated && (
              <Link to="/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Powerful Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <Card key={index} variant="hover" className="feature-card">
              <feature.icon size={40} className="feature-icon" />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Homepage;
