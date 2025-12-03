'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// -----------------------------------------------------------------------------
// Styles
// -----------------------------------------------------------------------------

const baseStyles = [
  'inline-flex items-center justify-center gap-2',
  'font-medium transition-all duration-200',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  'focus-visible:ring-offset-slate-950',
  'disabled:pointer-events-none disabled:opacity-50',
  'active:scale-[0.98]',
  'rounded-xl',
];

const variantStyles = {
  primary: [
    'bg-gradient-to-r from-violet-600 to-indigo-600',
    'hover:from-violet-500 hover:to-indigo-500',
    'text-white shadow-lg shadow-violet-500/25',
    'focus-visible:ring-violet-500',
  ],
  secondary: [
    'bg-slate-800 hover:bg-slate-700',
    'text-slate-100 border border-slate-700',
    'focus-visible:ring-slate-500',
  ],
  destructive: [
    'bg-gradient-to-r from-red-600 to-rose-600',
    'hover:from-red-500 hover:to-rose-500',
    'text-white shadow-lg shadow-red-500/25',
    'focus-visible:ring-red-500',
  ],
  ghost: [
    'hover:bg-slate-800/50',
    'text-slate-300 hover:text-slate-100',
    'focus-visible:ring-slate-500',
  ],
  outline: [
    'border-2 border-slate-700 hover:border-slate-600',
    'bg-transparent hover:bg-slate-800/50',
    'text-slate-300 hover:text-slate-100',
    'focus-visible:ring-slate-500',
  ],
};

const sizeStyles = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
  icon: 'h-11 w-11',
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };

