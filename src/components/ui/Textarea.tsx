import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-md border ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300 focus:ring-primary focus:border-primary'
          } focus:ring-1 focus:ring-offset-0 outline-none transition-all resize-none placeholder:text-slate-400 ${className}`}
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

Textarea.displayName = 'Textarea';
