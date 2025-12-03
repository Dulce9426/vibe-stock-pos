'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-300 mb-2"
          >
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            className={cn(
              // Base styles
              'w-full h-12 px-4 bg-slate-800/50 border rounded-xl',
              'text-slate-100 placeholder:text-slate-500',
              'transition-all duration-200',
              // Focus styles
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'focus:bg-slate-800/70',
              // Default border
              !error && 'border-slate-700 focus:ring-violet-500 focus:border-violet-500',
              // Error state
              error && 'border-red-500/50 focus:ring-red-500 focus:border-red-500',
              // Disabled state
              disabled && 'opacity-50 cursor-not-allowed',
              // Padding for icons
              leftIcon && 'pl-12',
              rightIcon && 'pr-12',
              className
            )}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Hint Text */}
        {hint && !error && (
          <p className="mt-2 text-sm text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };

