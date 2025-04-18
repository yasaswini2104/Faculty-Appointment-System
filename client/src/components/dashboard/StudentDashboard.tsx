import React from 'react';
import { Link } from 'react-router-dom';
import { useAppointments, Appointment } from '@/contexts/AppointmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Video, Users, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const StudentDashboard: React.FC = () => {
  const { appointments } = useAppointments();

  // Filter for upcoming appointments
  const upcomingAppointments = appointments
    .filter(appt => new Date(appt.startTime) > new Date() && appt.status !== 'canceled')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  // Filter for pending appointments
  const pendingAppointments = appointments
    .filter(appt => appt.status === 'pending')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

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
        <h1 className="heading-1">Student Dashboard</h1>
        <Link to="/faculty">
          <Button className="bg-university-blue hover:bg-university-blue/90">
            Book New Appointment
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
            <CardDescription>Your next scheduled meetings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map(appointment => (
                  <div key={appointment._id} className="border-b last:border-0 pb-2 last:pb-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{appointment.title}</span>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(new Date(appointment.startTime), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {format(new Date(appointment.startTime), 'h:mm a')} -{' '}
                          {format(new Date(appointment.endTime), 'h:mm a')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {appointment.type === 'in-person' ? (
                          <MapPin className="h-3 w-3 mr-1" />
                        ) : (
                          <Video className="h-3 w-3 mr-1" />
                        )}
                        <span>
                          {appointment.type === 'in-person'
                            ? appointment.location || 'No location specified'
                            : 'Virtual Meeting'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-center py-4">No upcoming appointments</div>
              )}
              {upcomingAppointments.length > 0 && (
                <Link to="/appointments" className="block mt-4">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Appointments
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Appointments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Requests</CardTitle>
            <CardDescription>Appointment requests awaiting approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pendingAppointments.length > 0 ? (
                pendingAppointments.map(appointment => (
                  <div key={appointment._id} className="border-b last:border-0 pb-2 last:pb-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{appointment.title}</span>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>With {appointment.faculty.name}</div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(new Date(appointment.startTime), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {format(new Date(appointment.startTime), 'h:mm a')} -{' '}
                          {format(new Date(appointment.endTime), 'h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-center py-4">No pending requests</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Faculty Directory Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Faculty Directory</CardTitle>
            <CardDescription>Search and connect with faculty members</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-muted p-8">
              <Users className="h-10 w-10 text-university-blue" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Find faculty members and book appointments based on their availability.
              </p>
              <Link to="/faculty">
                <Button variant="outline" size="sm">
                  Browse Faculty Directory
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Tips</CardTitle>
            <CardDescription>Making the most of your appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center text-university-blue mb-2">
                  <Calendar className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Scheduling</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Book appointments at least 48 hours in advance to ensure faculty availability.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center text-university-blue mb-2">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Preparation</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Prepare specific questions or topics to discuss to make the most of your meeting time.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center text-university-blue mb-2">
                  <Video className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">Virtual Meetings</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Test your camera and microphone before virtual appointments and join 5 minutes early.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
