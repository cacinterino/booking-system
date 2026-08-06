import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import type { UserDto } from '../../../shared/types/auth';

interface ProfileForm {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fullName = user?.fullName || '';
  const [firstName, lastName] = fullName.split(' ');

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    defaultValues: {
      firstName: firstName || '',
      lastName: lastName || '',
      phoneNumber: user?.phoneNumber || '',
    },
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      await updateUser({
        ...user!,
        fullName: `${data.firstName} ${data.lastName}`,
        phoneNumber: data.phoneNumber,
      } as UserDto);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-paper py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-ink font-display">Profile</h1>
            <button
              onClick={handleLogout}
              className="btn-danger text-sm py-2 px-4"
            >
              Sign Out
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-600 border border-green-200' 
                : 'bg-red-50 text-red-600 border border-red-200'
            }`} role="alert">
              {message.text}
            </div>
          )}

          <div className="space-y-8">
            <div className="border-b border-line pb-8">
              <h2 className="text-lg font-medium text-ink mb-6 font-display">Personal Information</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="label-field">First Name</label>
                    <input
                      id="firstName"
                      {...register('firstName', { required: 'First name is required' })}
                      className={`input-field ${errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      aria-invalid={errors.firstName ? 'true' : 'false'}
                      aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                    />
                    {errors.firstName && <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">{errors.firstName.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="label-field">Last Name</label>
                    <input
                      id="lastName"
                      {...register('lastName', { required: 'Last name is required' })}
                      className={`input-field ${errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                      aria-invalid={errors.lastName ? 'true' : 'false'}
                      aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                    />
                    {errors.lastName && <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">{errors.lastName.message}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="label-field">Phone Number</label>
                  <input
                    id="phoneNumber"
                    {...register('phoneNumber')}
                    className="input-field"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>

            <div className="border-b border-line pb-8">
              <h2 className="text-lg font-medium text-ink mb-6 font-display">Account Information</h2>
              <dl className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <dt className="text-sm font-medium text-slate">Email</dt>
                  <dd className="text-sm text-ink font-mono">{user?.email}</dd>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <dt className="text-sm font-medium text-slate">Role</dt>
                  <dd className="text-sm text-ink">{user?.roles.join(', ')}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}