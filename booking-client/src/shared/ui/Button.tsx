import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'on-dark' | 'outline-on-dark' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brass text-paper-white hover:bg-brass-soft focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper-white',
  secondary:
    'bg-paper-white text-ink border border-line hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper-white',
  'on-dark':
    'bg-brass text-ink hover:bg-brass-soft hover:text-ink focus-visible:ring-2 focus-visible:ring-brass-soft focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
  'outline-on-dark':
    'border border-paper-white/30 text-paper-white hover:bg-paper-white/10 focus-visible:ring-2 focus-visible:ring-paper-white focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-white',
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
  /** Render an anchor instead of a button. Pass the link target here, not in `children`. */
  href?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, children, ...props }, ref) => {
    const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ''}`;

    if (href) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} type={props.type ?? 'button'} className={classes} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
