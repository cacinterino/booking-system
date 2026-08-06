import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';

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
            <h2 className="text-3xl font-bold text-ink font-display">Booked.</h2>
          </Link>
          <h3 className="text-2xl font-bold text-ink font-display">Create your account</h3>
          <p className="mt-2 text-slate">Start managing bookings in minutes</p>
        </div>

        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm" role="alert">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="label-field">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  required
                  {...register('firstName', { required: 'First name is required' })}
                  className={`input-field ${errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="First name"
                  aria-invalid={errors.firstName ? 'true' : 'false'}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                />
                {errors.firstName && (
                  <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="label-field">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  required
                  {...register('lastName', { required: 'Last name is required' })}
                  className={`input-field ${errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="Last name"
                  aria-invalid={errors.lastName ? 'true' : 'false'}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                />
                {errors.lastName && (
                  <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="label-field">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="you@example.com"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="label-field">Phone Number (optional)</label>
              <input
                id="phoneNumber"
                type="tel"
                {...register('phoneNumber')}
                className="input-field"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label htmlFor="password" className="label-field">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
                    message: 'Must contain uppercase, lowercase, number, and special character',
                  },
                })}
                className={`input-field ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="••••••••"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label-field">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === password || 'Passwords do not match',
                })}
                className={`input-field ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                placeholder="••••••••"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              />
              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-sm text-red-600" role="alert">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Create account
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate">
              Already have an account?{' '}
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