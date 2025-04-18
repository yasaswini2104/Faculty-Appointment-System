import React from 'react';
import { Link } from 'react-router-dom';
import { useAppointments, Appointment } from '@/contexts/AppointmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Calendar,
  GraduationCap,
  Users,
  UserCheck,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const AdminDashboard: React.FC = () => {
  const { appointments } = useAppointments();

  const totalAppointments = appointments.length;
  const pendingAppointments = appointments.filter(appt => appt.status === 'pending').length;
  const approvedAppointments = appointments.filter(appt => appt.status === 'approved').length;
  const completedAppointments = appointments.filter(appt => appt.status === 'completed').length;

  const uniqueFaculty = new Set(appointments.map(appt => appt.faculty._id)).size;
  const uniqueStudents = new Set(appointments.map(appt => appt.student._id)).size;

  const recentAppointments = [...appointments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-university-success">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-university-lightBlue">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-university-error">Rejected</Badge>;
      case 'canceled':
        return <Badge variant="outline">Canceled</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-1">Admin Dashboard</h1>
        <Link to="/analytics">
          <Button className="bg-university-blue hover:bg-university-blue/90">
            View Detailed Analytics
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Appointments</CardTitle>
            <CardDescription>System-wide appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-university-blue">{totalAppointments}</div>
              <Calendar className="h-8 w-8 text-university-lightBlue" />
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              <span className="text-university-success font-medium">
                {completedAppointments}
              </span> completed,
              <span className="text-university-lightBlue font-medium ml-1">
                {pendingAppointments}
              </span> pending
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Faculty</CardTitle>
            <CardDescription>Active faculty members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-university-blue">{uniqueFaculty}</div>
              <GraduationCap className="h-8 w-8 text-university-lightBlue" />
            </div>
            <div className="mt-2 text-sm">
              <Link to="/faculty-management" className="text-university-lightBlue hover:underline flex items-center">
                <span>Manage faculty</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Students</CardTitle>
            <CardDescription>Active students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold text-university-blue">{uniqueStudents}</div>
              <Users className="h-8 w-8 text-university-lightBlue" />
            </div>
            <div className="mt-2 text-sm">
              <Link to="/student-management" className="text-university-lightBlue hover:underline flex items-center">
                <span>Manage students</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">System Health</CardTitle>
            <CardDescription>Overall system status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-university-success">Operational</div>
              <div className="h-8 w-8 rounded-full bg-university-success/20 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-university-success"></div>
              </div>
            </div>
            <div className="mt-2 text-sm">
              <Link to="/system-status" className="text-university-lightBlue hover:underline flex items-center">
                <span>View detailed status</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <CardDescription>Latest appointments across the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments.map((appointment) => (
                  <div key={appointment._id} className="flex justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <div className="font-medium">{appointment.title}</div>
                      <div className="text-sm text-muted-foreground">
                        <div>Student: {appointment.student.name}</div>
                        <div>Faculty: {appointment.faculty.name}</div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{format(new Date(appointment.startTime), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {getStatusBadge(appointment.status)}
                      <div className="text-xs text-muted-foreground mt-1">
                        Created {format(new Date(appointment.createdAt), 'MMM d')}
                      </div>
                    </div>
                  </div>
                ))}

                <Link to="/appointments" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Appointments
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link to="/user-management" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>

              <Link to="/faculty-management" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Manage Faculty
                </Button>
              </Link>

              <Link to="/student-management" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Students
                </Button>
              </Link>

              <Link to="/analytics" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  System Analytics
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
