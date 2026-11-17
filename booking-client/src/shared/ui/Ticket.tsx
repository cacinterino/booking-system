import { forwardRef } from 'react';

export interface TicketProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const Ticket = forwardRef<HTMLDivElement, TicketProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative bg-paper-white border border-line rounded-lg p-6 md:p-8 shadow-sm transition-all hover:shadow-md ${className ?? ''}`}
      {...props}
    />
  );
});

Ticket.displayName = 'Ticket';

export { Ticket };
