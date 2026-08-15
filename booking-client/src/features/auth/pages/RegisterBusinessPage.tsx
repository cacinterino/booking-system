import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { extractApiDetail } from '../../booking/errors';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function RegisterBusinessPage() {
  const navigate = useNavigate();
  const { registerBusiness } = useAuth();
  const [error, setError] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [businessSlug, setBusinessSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleBusinessNameChange = (value: string) => {
    setBusinessName(value);
    if (!slugTouched) setBusinessSlug(slugify(value));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!slugify(businessSlug)) {
      setError('Please enter a valid business link (letters, numbers, and dashes).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await registerBusiness({
        businessName: businessName.trim(),
        businessSlug: slugify(businessSlug),
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: phone.trim() || undefined,
        description: description.trim() || undefined,
        address: address.trim() || undefined,
      });
      navigate('/staff/calendar');
    } catch (err) {
      setError(extractApiDetail(err) ?? 'Could not create your business. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block mb-8">
            <h2 className="text-3xl font-bold text-ink font-display">
              Booked<span className="text-brass">.</span>
            </h2>
          </Link>
          <h3 className="text-2xl font-bold text-ink font-display">Set up your business</h3>
          <p className="mt-2 text-slate">Create your booking page in under a minute</p>
        </div>

        <div className="card">
          <form className="space-y-6" onSubmit={onSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="bizName" className="label-field">Business name</label>
              <input
                id="bizName"
                type="text"
                required
                className="input-field"
                placeholder="e.g. Juan's Barbershop"
                value={businessName}
                onChange={(e) => handleBusinessNameChange(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="bizSlug" className="label-field">Booking page link</label>
              <div className="flex items-center rounded-lg border border-line bg-paper-white focus-within:ring-2 focus-within:ring-brass focus-within:border-brass transition-all">
                <span className="pl-4 font-mono text-sm text-slate">/book/</span>
                <input
                  id="bizSlug"
                  type="text"
                  required
                  className="w-full bg-transparent px-3 py-3 font-mono text-sm text-ink placeholder-slate focus:outline-none"
                  placeholder="juans-barbershop"
                  value={businessSlug}
                  onChange={(e) => {
                    setBusinessSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  aria-describedby="bizSlug-hint"
                />
              </div>
              <p id="bizSlug-hint" className="mt-1 text-xs text-slate">
                This is the link you'll share with customers.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bizFirst" className="label-field">First name</label>
                <input
                  id="bizFirst"
                  type="text"
                  required
                  className="input-field"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="bizLast" className="label-field">Last name</label>
                <input
                  id="bizLast"
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
              <label htmlFor="bizEmail" className="label-field">Email address</label>
              <input
                id="bizEmail"
                type="email"
                autoComplete="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="bizPhone" className="label-field">Phone (optional)</label>
              <input
                id="bizPhone"
                type="tel"
                className="input-field"
                placeholder="0917 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="bizPassword" className="label-field">Password</label>
              <input
                id="bizPassword"
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
              <label htmlFor="bizConfirm" className="label-field">Confirm password</label>
              <input
                id="bizConfirm"
                type="password"
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <details className="group rounded-lg border border-line bg-paper p-4">
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-brass">
                Add details (optional)
              </summary>
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="bizDesc" className="label-field">Description</label>
                  <textarea
                    id="bizDesc"
                    className="input-field"
                    rows={2}
                    placeholder="What do you offer?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="bizAddr" className="label-field">Address</label>
                  <input
                    id="bizAddr"
                    type="text"
                    className="input-field"
                    placeholder="City, province"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </details>

            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Setting up…' : 'Create my booking page'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate">
              Already have a business?{' '}
              <Link to="/login" className="font-medium text-brass hover:text-brass-soft transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
