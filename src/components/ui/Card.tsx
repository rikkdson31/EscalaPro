import React from 'react';

type CardProps = React.ComponentProps<'div'> & {
  children?: React.ReactNode;
};

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`mb-3 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }: CardProps) {
  return (
    <h3 className={`text-lg font-semibold text-slate-800 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}
