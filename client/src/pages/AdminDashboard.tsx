import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

const AdminDashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <AdminDashboard />
    </MainLayout>
  );
};

export default AdminDashboardPage;
