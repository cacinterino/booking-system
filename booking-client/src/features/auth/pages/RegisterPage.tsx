import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setError('');
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block mb-8">
            <h2 className="text-3xl font-bold text-ink font-display">Booked<span className="text-brass">.</span></h2>
          </Link>
          <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-2">Create account</p>
          <h3 className="text-2xl font-bold text-ink font-display">Create your account</h3>
          <p className="mt-2 text-slate">Start managing bookings in minutes</p>
        </div>

        <Card>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="First Name"
                  id="firstName"
                  type="text"
                  required
                  placeholder="First name"
                  {...register('firstName', { required: 'First name is required' })}
                  error={errors.firstName ? true : false}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Input
                  label="Last Name"
                  id="lastName"
                  type="text"
                  required
                  placeholder="Last name"
                  {...register('lastName', { required: 'Last name is required' })}
                  error={errors.lastName ? true : false}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Input
                label="Email address"
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email ? true : false}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Phone Number (optional)"
                id="phoneNumber"
                type="tel"
                placeholder="Phone number"
                {...register('phoneNumber')}
              />
            </div>

            <div>
              <Input
                label="Password"
                id="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
                    message: 'Must contain uppercase, lowercase, number, and special character',
                  },
                })}
                error={errors.password ? true : false}
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <Input
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                error={errors.confirmPassword ? true : false}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-sm text-red-600" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div>
              <Button type="submit" className="w-full">
                Create account
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate">
              Already have an account?{' '}
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
