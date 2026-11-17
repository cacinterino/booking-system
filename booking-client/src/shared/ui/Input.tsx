import { forwardRef } from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  className?: string;
  as?: 'input' | 'textarea';
  rows?: number;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, className, id, as = 'input', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const Comp = as === 'textarea' ? 'textarea' : 'input';
    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium uppercase tracking-wider text-ink-soft font-mono"
          >
            {label}
          </label>
        )}
        <Comp
          ref={ref as never}
          id={inputId}
          className={`w-full px-4 py-2.5 border rounded-lg bg-paper-white text-ink placeholder-slate focus:outline-none focus:ring-2 focus:ring-brass focus:border-brass transition-all ${
            error
              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
              : 'border-line'
          } ${className ?? ''}`}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-600 font-mono" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
