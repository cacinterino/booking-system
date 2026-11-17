import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { extractApiDetail } from '../../booking/errors';

export function AcceptInvitationPage() {
  const navigate = useNavigate();
  const { acceptInvitation } = useAuth();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('This invitation link is missing its token. Check the link from your email.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await acceptInvitation({
        token,
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone.trim() || undefined,
      });
      navigate('/staff/calendar');
    } catch (err) {
      setError(extractApiDetail(err) ?? 'Could not accept the invitation. It may have expired.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-4">
        <div className="card max-w-md w-full text-center">
          <h1 className="font-display text-2xl font-semibold text-ink">Missing invitation</h1>
          <p className="mt-2 text-ink-soft">
            This link is missing its invitation token. Use the link from your invitation email.
          </p>
          <Link to="/" className="btn-secondary mt-6 inline-flex">
            Back to Booked.
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block mb-8">
            <h2 className="text-3xl font-bold text-ink font-display">
              Booked<span className="text-brass">.</span>
            </h2>
          </Link>
          <h3 className="text-2xl font-bold text-ink font-display">Join the team</h3>
          <p className="mt-2 text-slate">You've been invited to a business on Booked.</p>
        </div>

        <div className="card">
          <form className="space-y-6" onSubmit={onSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="invEmail" className="label-field">Work email</label>
              <input
                id="invEmail"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate">Use the email you were invited with.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="invFirst" className="label-field">First name</label>
                <input
                  id="invFirst"
                  type="text"
                  required
                  className="input-field"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="invLast" className="label-field">Last name</label>
                <input
                  id="invLast"
                  type="text"
                  required
                  className="input-field"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="invPhone" className="label-field">Phone (optional)</label>
              <input
                id="invPhone"
                type="tel"
                className="input-field"
                placeholder="0917 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="invPassword" className="label-field">Password</label>
              <input
                id="invPassword"
                type="password"
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="invConfirm" className="label-field">Confirm password</label>
              <input
                id="invConfirm"
                type="password"
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Accepting…' : 'Accept invitation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
