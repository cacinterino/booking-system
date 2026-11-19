import { forwardRef, useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  maxWidth?: string;
  children: React.ReactNode;
}

const Modal = forwardRef<HTMLDivElement, ModalProps>(({ isOpen, onClose, title, className, maxWidth = 'max-w-md', children }, ref) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Modal'}
    >
      <div
        className={`w-full ${maxWidth} bg-paper-white rounded-xl shadow-2xl border border-line transition-all ${className ?? ''}`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-line">
            <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        <div className="px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';

export { Modal };
