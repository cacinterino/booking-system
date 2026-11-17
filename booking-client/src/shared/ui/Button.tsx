import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'on-dark' | 'outline-on-dark' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brass text-paper-white hover:bg-brass-soft focus:ring-2 focus:ring-brass focus:ring-offset-2 focus:ring-offset-paper-white',
  secondary:
    'bg-paper-white text-ink border border-line hover:bg-ink/5 focus:ring-2 focus:ring-ink focus:ring-offset-2 focus:ring-offset-paper-white',
  'on-dark':
    'bg-brass text-ink hover:bg-brass-soft hover:text-ink focus:ring-2 focus:ring-brass-soft focus:ring-offset-2 focus:ring-offset-ink',
  'outline-on-dark':
    'border border-paper-white/30 text-paper-white hover:bg-paper-white/10 focus:ring-2 focus:ring-paper-white focus:ring-offset-2 focus:ring-offset-ink',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-paper-white',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

const baseStyles =
  'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild, ...props }, ref) => {
    const Comp = asChild ? (props as unknown as React.ElementType) : 'button';
    return (
      <Comp
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ''}`}
        {...(asChild ? {} : { type: props.type ?? 'button' })}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button };
