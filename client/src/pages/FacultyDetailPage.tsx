
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import FacultyDetail from '@/components/faculty/FacultyDetail';

const FacultyDetailPage: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <MainLayout>
      <FacultyDetail />
    </MainLayout>
  );
};

export default FacultyDetailPage;
