
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />;
  }
  
  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-12">
        <RegisterForm />
      </div>
    </MainLayout>
  );
};

export default RegisterPage;
