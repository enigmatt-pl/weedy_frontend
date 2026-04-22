import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
}

export const Card = ({ variant = 'default', className = '', children, ...props }: CardProps) => {
  const variants = {
    default: 'bg-white border border-slate-200 shadow-sm transition-all duration-300',
    outlined: 'bg-white border border-slate-200',
  };

  return (
    <div
      className={`rounded-md ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export const CardHeader = ({ className = '', children, ...props }: CardHeaderProps) => {
  return (
    <div className={`px-6 py-4 border-b border-slate-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

type CardContentProps = HTMLAttributes<HTMLDivElement>;

export const CardContent = ({ className = '', children, ...props }: CardContentProps) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export const CardFooter = ({ className = '', children, ...props }: CardFooterProps) => {
  return (
    <div className={`px-6 py-4 border-t border-slate-200 ${className}`} {...props}>
      {children}
    </div>
  );
};
