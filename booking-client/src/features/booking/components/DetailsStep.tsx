import { useState } from 'react';
import type { PublicBusiness } from '../types';

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
        <label className="label-field" htmlFor="guest-name">
          Your name
        </label>
        <input
          id="guest-name"
          type="text"
          className={`input-field ${nameError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          placeholder="Maria Santos"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
        {nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
      </div>

      <div>
        <label className="label-field" htmlFor="guest-email">
          Email
        </label>
        <input
          id="guest-email"
          type="email"
          className={`input-field ${emailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
          placeholder="maria@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
      </div>

      <div>
        <label className="label-field" htmlFor="guest-phone">
          Phone <span className="font-normal text-slate">(optional)</span>
        </label>
        <input
          id="guest-phone"
          type="tel"
          className="input-field"
          placeholder="0917 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </div>

      <div>
        <label className="label-field" htmlFor="guest-notes">
          Notes <span className="font-normal text-slate">(optional)</span>
        </label>
        <textarea
          id="guest-notes"
          className="input-field"
          rows={3}
          placeholder="Anything the business should know?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {business.requireDeposit && (
        <div className="p-4 rounded-lg border border-brass/30 bg-brass/10">
          <p className="font-mono text-xs uppercase tracking-widest text-brass">Deposit required</p>
          <p className="mt-1 text-sm text-ink">
            {new Intl.NumberFormat('en-PH', { style: 'currency', currency: business.currency }).format(
              business.depositAmount,
            )}{' '}
            may be collected at the business to hold this slot. Your booking proceeds now without payment.
          </p>
        </div>
      )}

      {error && <p className="text-red-600">{error}</p>}

      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting ? 'Booking…' : 'Confirm booking'}
      </button>
    </form>
  );
}
