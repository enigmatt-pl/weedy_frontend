import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-wider rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      primary: 'bg-primary text-white hover:bg-emerald-700 shadow-sm hover:shadow-md focus:ring-2 focus:ring-primary focus:ring-offset-2',
      secondary: 'bg-brand-dark text-white hover:bg-slate-800 focus:ring-2 focus:ring-brand-dark focus:ring-offset-2',
      ghost: 'text-slate-500 hover:text-brand-dark hover:bg-slate-100 focus:ring-2 focus:ring-slate-300 focus:ring-offset-2',
    };

    const sizes = {
      xs: 'px-3 py-1 text-[10px]',
      sm: 'px-4 py-2 text-xs',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-8 py-3.5 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
