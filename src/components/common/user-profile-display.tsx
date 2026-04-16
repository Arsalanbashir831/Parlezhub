'use client';

import { useUser } from '@/contexts/user-context';

export function UserProfileDisplay() {
  const { user, isLoading, error, refetchUser } = useUser();

  if (isLoading) {
    return <div>Loading user profile...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error loading profile: {error}</p>
        <button onClick={refetchUser}>Retry</button>
      </div>
    );
  }

  if (!user) {
    return <div>No user profile available</div>;
  }

  return (
    <div className="rounded-lg border p-4">
      <h2 className="mb-4 text-xl font-bold">User Profile</h2>
      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {user.full_name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
        <p>
          <strong>Verified:</strong> {user.is_verified ? 'Yes' : 'No'}
        </p>

        {user.role === 'STUDENT' && (
          <div className="mt-4 rounded bg-blue-50 p-3">
            <h3 className="font-semibold">Student Information</h3>
            <p>City: {user.city || 'Not set'}</p>
            <p>Country: {user.country || 'Not set'}</p>
            <p>Address: {user.address || 'Not set'}</p>
          </div>
        )}

        {user.role === 'TEACHER' && (
          <div className="mt-4 rounded bg-green-50 p-3">
            <h3 className="font-semibold">Consultant Information</h3>
            <p>Qualification: {user.qualification || 'Not set'}</p>
            <p>Bio: {user.bio || 'Not set'}</p>
            <p>Hourly Rate: ${user.hourly_rate || 'Not set'}</p>
            <p>Experience: {user.experience_years || 'Not set'} years</p>
            {user.subjects && user.subjects.length > 0 && (
              <p>Subjects: {user.subjects.join(', ')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
