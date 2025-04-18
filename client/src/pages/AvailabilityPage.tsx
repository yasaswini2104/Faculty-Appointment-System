import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointments } from '@/contexts/AppointmentContext';
import MainLayout from '@/components/layout/MainLayout';
import AvailabilityForm from '@/components/appointments/AvailabilityForm';
import AvailabilityList from '@/components/appointments/AvailabilityList';

const AvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const { fetchAvailabilitySlots } = useAppointments();

  // ✅ Always call hooks at the top
  useEffect(() => {
    if (user && user.role === 'faculty') {
      fetchAvailabilitySlots(user._id);
    }
  }, [user, fetchAvailabilitySlots]);

  // ✅ Only conditional rendering happens below
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'faculty') return <Navigate to="/" />;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="heading-1">Manage Availability</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AvailabilityForm />
          </div>
          <div className="lg:col-span-2">
            <AvailabilityList />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AvailabilityPage;
