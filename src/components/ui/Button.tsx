import React from 'react';

type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-bold transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';
  
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 shadow-sm',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-200',
    outline: 'border-2 border-slate-200 text-slate-700 hover:bg-slate-50 focus:ring-slate-200',
    ghost: 'text-slate-700 hover:bg-slate-100 focus:ring-slate-200',
    danger: 'bg-rose-50 text-rose-600 hover:bg-rose-100 focus:ring-rose-200',
    success: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 focus:ring-emerald-200',
  };

  const sizes = {
    sm: 'h-9 px-4 text-sm',
    md: 'h-12 px-6 text-base', // 48px height minimum for mobile targets
    lg: 'h-14 px-8 text-lg',
    xl: 'h-16 px-8 text-lg',
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}
