import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import type { UserDto } from '../../../shared/types/auth';
import { Card } from '../../../shared/ui/Card';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

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
        <Card>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-1">Profile</p>
              <h1 className="text-3xl font-bold text-ink font-display">Profile</h1>
            </div>
            <button
              onClick={handleLogout}
              className="btn-danger text-sm py-2 px-4"
            >
              Sign Out
            </button>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success'
              ? 'bg-green-50 text-green-600 border border-green-200'
              : 'bg-red-50 text-red-600 border border-red-200'
            }`} role="alert">
              {message.text}
            </div>
          )}

          <div className="space-y-8">
            <div className="border-b border-line pb-8">
              <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-1">Personal Information</p>
              <h2 className="text-lg font-medium text-ink mb-6 font-display">Personal Information</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="First Name"
                      id="firstName"
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
                    label="Phone Number"
                    id="phoneNumber"
                    {...register('phoneNumber')}
                  />
                </div>

                <div>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>

            <div className="border-b border-line pb-8">
              <p className="font-mono text-xs uppercase tracking-widest text-brass-deep mb-1">Account Information</p>
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
        </Card>
      </div>
    </div>
  );
}
