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
        <path d="M12 2C12 2 12 12 2 12C12 12 12 22 22 12C12 12 12 2 12 2Z" />
        <path d="M12 2V22" />
      </svg>
      <span className="uppercase leading-none mt-0.5 whitespace-nowrap font-bold tracking-widest text-xs">
        WEE<span className={variant === 'brand' ? 'text-slate-900' : 'text-primary'}>DY</span>
      </span>
    </Link>
  );
};
