import { forwardRef } from 'react';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  /*
   * `true` only paints the red error border, which is what the form pages pass
   * while they render their own validation message. Pass a string to render a
   * message as well.
   */
  error?: string | boolean;
  className?: string;
  as?: 'input' | 'textarea';
  rows?: number;
}

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, className, id, as = 'input', ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
    const Comp = (as === 'textarea' ? 'textarea' : 'input') as React.ElementType;
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-ink-soft mb-2 font-mono"
          >
            {label}
          </label>
        )}
        <Comp
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 border rounded-lg bg-paper-white text-ink placeholder-slate focus:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:border-brass transition-all ${
            error
              ? 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500'
              : 'border-line'
          } ${className ?? ''}`}
          {...props}
        />
        {typeof error === 'string' && error.length > 0 && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
