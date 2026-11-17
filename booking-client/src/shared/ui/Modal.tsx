import { forwardRef, useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, className, maxWidth = 'max-w-lg', children }, ref) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div
        ref={ref}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xs"
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Modal'}
      >
        <div
          className={`w-full ${maxWidth} bg-paper-white rounded-xl shadow-2xl border border-line transition-all overflow-hidden flex flex-col max-h-[90vh] ${className ?? ''}`}
        >
          {title && (
            <div className="px-6 py-4 border-b border-line flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-slate hover:text-ink transition-colors p-1 rounded-md"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="px-6 py-5 overflow-y-auto">{children}</div>
        </div>
      </div>
    );
  },
);

Modal.displayName = 'Modal';

export { Modal };
