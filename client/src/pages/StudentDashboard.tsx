import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

const StudentDashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <StudentDashboard />
    </MainLayout>
  );
};

export default StudentDashboardPage;
