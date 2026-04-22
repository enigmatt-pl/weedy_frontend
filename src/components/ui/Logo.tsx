import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'brand';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'dark', size = 'md', to = '/' }) => {
  const sizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    hero: 'h-16',
  };

  const colors = {
    dark: 'text-slate-900',
    light: 'text-white',
    brand: 'text-primary',
  };

  const iconColors = {
    dark: 'text-primary',
    light: 'text-primary',
    brand: 'text-slate-900',
  };

  return (
    <Link to={to} className={`flex items-center gap-2.5 font-black tracking-tighter select-none hover:opacity-90 transition-opacity ${sizes[size]} ${colors[variant]} ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${sizes[size]} w-auto ${iconColors[variant]}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
      </svg>
      <span className="font-black leading-none mt-0.5 whitespace-nowrap text-lg">
        WEE<span className={variant === 'brand' ? 'text-slate-900' : 'text-primary'}>DY</span>
      </span>
    </Link>
  );
};
