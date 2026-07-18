'use client';
import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { cn, cleanPassword } from '@/lib/utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordByDefault?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightIcon, className = '', type = 'text', showPasswordByDefault = false, ...props }, ref) => {
    const [showPass, setShowPass] = useState(showPasswordByDefault);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (type === 'password') {
        const cleanedValue = cleanPassword(e.target.value);
        e.target.value = cleanedValue;
      }
      if (props.onChange) {
        props.onChange(e);
      }
    };

    return (
      <div className="w-full">
        {label && <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
        <div className="relative">
          {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
          <input
            ref={ref}
            type={type === 'password' ? (showPass ? 'text' : 'password') : type}
            className={cn(
              'w-full px-4 py-3 rounded-xl border bg-white text-gray-800 placeholder-gray-400 transition-all duration-200 text-sm sm:text-base',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              error ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 hover:border-gray-300',
              icon ? 'pl-10' : '',
              (rightIcon || type === 'password') ? 'pr-10' : '',
              className
            )}
            {...props}
            onChange={handleChange}
          />
          {type === 'password' && (
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              )}
            </button>
          )}
          {rightIcon && type !== 'password' && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">{rightIcon}</span>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
