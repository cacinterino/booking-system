import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { extractApiDetail } from '../../booking/errors';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

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
          <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-2">Set up business</p>
          <h3 className="text-2xl font-bold text-ink font-display">Set up your business</h3>
          <p className="mt-2 text-slate">Create your booking page in under a minute</p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={onSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Business name"
                id="bizName"
                type="text"
                required
                placeholder="e.g. Juan's Barbershop"
                value={businessName}
                onChange={(e) => handleBusinessNameChange(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Booking page link"
                id="bizSlug"
                type="text"
                required
                placeholder="juans-barbershop"
                value={businessSlug}
                onChange={(e) => {
                  setBusinessSlug(e.target.value);
                  setSlugTouched(true);
                }}
              />
              <p className="mt-1 text-xs text-slate">
                This is the link you'll share with customers.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="First name"
                  id="bizFirst"
                  type="text"
                  required
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <Input
                  label="Last name"
                  id="bizLast"
                  type="text"
                  required
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Input
                label="Email address"
                id="bizEmail"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Phone (optional)"
                id="bizPhone"
                type="tel"
                placeholder="0917 000 0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Password"
                id="bizPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Input
                label="Confirm password"
                id="bizConfirm"
                type="password"
                autoComplete="new-password"
                required
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <details className="group border-t border-line pt-4">
              <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-brass-deep">
                Add details (optional)
              </summary>
              <div className="mt-4 space-y-4">
                <div>
                  <Input
                    label="Description"
                    id="bizDesc"
                    as="textarea"
                    rows={2}
                    placeholder="What do you offer?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="Address"
                    id="bizAddr"
                    type="text"
                    placeholder="City, province"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>
            </details>

            <div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? 'Setting up…' : 'Create my booking page'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate">
              Already have a business?{' '}
              <Link to="/login" className="font-medium text-brass-deep hover:text-brass transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
