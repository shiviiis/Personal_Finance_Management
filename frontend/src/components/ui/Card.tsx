import React, { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'gradient-border' | 'hover';
  children: ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`card card-${variant} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
