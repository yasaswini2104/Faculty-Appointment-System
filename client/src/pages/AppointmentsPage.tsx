
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import AppointmentList from '@/components/appointments/AppointmentList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="heading-1">Appointments</h1>
        
        <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <AppointmentList filter="upcoming" />
          </TabsContent>
          
          <TabsContent value="pending">
            <AppointmentList filter="pending" />
          </TabsContent>
          
          <TabsContent value="past">
            <AppointmentList filter="past" />
          </TabsContent>
          
          <TabsContent value="all">
            <AppointmentList filter="all" />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AppointmentsPage;
