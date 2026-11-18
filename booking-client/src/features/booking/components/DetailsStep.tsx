import { useState } from 'react';
import type { PublicBusiness } from '../types';
import { Card, Input, Button } from '../../../shared/ui';

interface DetailsStepProps {
  business: PublicBusiness;
  onConfirm: (contact: { name: string; email: string; phone?: string; notes?: string }) => void;
  submitting: boolean;
  error?: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function DetailsStep({ business, onConfirm, submitting, error }: DetailsStepProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [touched, setTouched] = useState(false);

  const nameError = touched && !name.trim() ? 'Please enter your name.' : null;
  const emailError = touched && !EMAIL_RE.test(email) ? 'Please enter a valid email address.' : null;
  const invalid = !!nameError || !!emailError || !name.trim() || !EMAIL_RE.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!invalid) {
      onConfirm({ name: name.trim(), email: email.trim(), phone: phone.trim() || undefined, notes: notes.trim() || undefined });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <Input
          label="Your name"
          id="guest-name"
          type="text"
          placeholder="Maria Santos"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          error={nameError ? true : false}
        />
        {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
      </div>

      <div>
        <Input
          label="Email"
          id="guest-email"
          type="email"
          placeholder="maria@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          error={emailError ? true : false}
        />
        {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
      </div>

      <div>
        <Input
          label="Phone"
          id="guest-phone"
          type="tel"
          placeholder="0917 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
        <span className="font-normal text-slate">(optional)</span>
      </div>

      <div>
        <Input
          label="Notes"
          id="guest-notes"
          as="textarea"
          rows={3}
          placeholder="Anything the business should know?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <span className="font-normal text-slate">(optional)</span>
      </div>

      {business.requireDeposit && (
        <Card className="p-4 border border-brass/30 bg-brass/10">
          <p className="font-mono text-xs uppercase tracking-widest text-brass-deep">Deposit required</p>
          <p className="mt-1 text-sm text-ink">
            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: business.currency }).format(
              business.depositAmount,
            )}{' '}
            may be collected at the business to hold this slot. Your booking proceeds now without payment.
          </p>
        </Card>
      )}

      {error && <p className="text-red-600">{error}</p>}

      <div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? 'Booking…' : 'Confirm booking'}
        </Button>
      </div>
    </form>
  );
}
