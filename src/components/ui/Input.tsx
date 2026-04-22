import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const inputId = props.id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-md border ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300 focus:ring-primary focus:border-primary'
          } focus:ring-1 focus:ring-offset-0 outline-none transition-all placeholder:text-slate-400 ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600 font-bold uppercase tracking-tighter">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
