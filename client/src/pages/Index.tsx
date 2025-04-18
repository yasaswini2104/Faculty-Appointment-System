import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Calendar, GraduationCap, Users } from 'lucide-react';

const Index: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'student':
          navigate('/student/dashboard');
          break;
        case 'faculty':
          navigate('/faculty/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          break;
      }
    }
  }, [user, navigate]);

  return (
    <MainLayout>
      <div className="flex flex-col items-center">
        <div className="text-center max-w-3xl mx-auto py-12">
          <h1 className="text-4xl font-bold text-university-blue mb-4">
            University Appointment & Availability Management
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect students and faculty with a seamless appointment scheduling system
          </p>

          <div className="flex gap-4 justify-center mb-12">
            <Link to="/login">
              <Button size="lg" className="bg-university-blue hover:bg-university-blue/90">
                Log In
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-16">
          <div className="university-card text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-university-blue/10 flex items-center justify-center">
                <Users className="h-8 w-8 text-university-blue" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">For Students</h2>
            <p className="text-muted-foreground mb-4">
              Easily book appointments with faculty members based on their real-time availability.
            </p>
            <ul className="text-left text-sm space-y-2 mb-4">
              <li className="flex items-center">
                <span className="mr-2">✓</span> View faculty availability
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Book appointments
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Receive confirmations
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Access meeting minutes
              </li>
            </ul>
          </div>

          <div className="university-card text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-university-blue/10 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-university-blue" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">For Faculty</h2>
            <p className="text-muted-foreground mb-4">
              Manage your availability and streamline the appointment process.
            </p>
            <ul className="text-left text-sm space-y-2 mb-4">
              <li className="flex items-center">
                <span className="mr-2">✓</span> Set availability slots
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Approve or decline requests
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Calendar integration
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Record meeting notes
              </li>
            </ul>
          </div>

          <div className="university-card text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-university-blue/10 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-university-blue" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Key Features</h2>
            <p className="text-muted-foreground mb-4">
              Our platform provides everything needed for efficient appointment scheduling.
            </p>
            <ul className="text-left text-sm space-y-2 mb-4">
              <li className="flex items-center">
                <span className="mr-2">✓</span> Real-time availability
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Virtual meeting support
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Automated notifications
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span> Meeting history & analytics
              </li>
            </ul>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
