import React, { InputHTMLAttributes, ReactNode } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className={`input-wrapper ${icon ? `input-with-icon-${iconPosition}` : ''}`}>
        {icon && iconPosition === 'left' && (
          <span className="input-icon input-icon-left">{icon}</span>
        )}
        <input
          className={`input ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
        {icon && iconPosition === 'right' && (
          <span className="input-icon input-icon-right">{icon}</span>
        )}
      </div>
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
