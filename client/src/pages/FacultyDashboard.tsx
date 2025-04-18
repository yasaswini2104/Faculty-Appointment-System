import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FacultyDashboard from '@/components/dashboard/FacultyDashboard';

const FacultyDashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <FacultyDashboard />
    </MainLayout>
  );
};

export default FacultyDashboardPage;
