import React from 'react';
import { Link } from 'react-router-dom';
import { useAppointments, Appointment } from '@/contexts/AppointmentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  CalendarClock,
  CheckCircle2,
  XCircle,
  UserCheck,
  Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

const FacultyDashboard: React.FC = () => {
  const { appointments, updateAppointmentStatus } = useAppointments();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const myAppointments = appointments.filter(appt => appt.faculty); // Additional filtering logic can go here

  const pendingAppointments = myAppointments
    .filter(appt => appt.status === 'pending')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const todaysAppointments = myAppointments
    .filter(appt => {
      const appointmentDate = new Date(appt.startTime);
      appointmentDate.setHours(0, 0, 0, 0);
      return appointmentDate.getTime() === today.getTime() && appt.status === 'approved';
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  const upcomingAppointmentsCount = myAppointments.filter(appt => {
    const appointmentDate = new Date(appt.startTime);
    return appointmentDate > tomorrow && appt.status === 'approved';
  }).length;

  const approvedCount = myAppointments.filter(appt => appt.status === 'approved').length;
  const completedCount = myAppointments.filter(appt => appt.status === 'completed').length;
  const pendingCount = pendingAppointments.length;

  const handleApprove = async (id: string) => {
    await updateAppointmentStatus(id, { status: 'approved' });
  };

  const handleDecline = async (id: string) => {
    await updateAppointmentStatus(id, { status: 'rejected' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-1">Faculty Dashboard</h1>
        <Link to="/availability">
          <Button className="bg-university-blue hover:bg-university-blue/90">
            Manage Availability
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today’s Appointments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Today's Schedule</CardTitle>
            <CardDescription>Your appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todaysAppointments.length > 0 ? (
                todaysAppointments.map((appointment) => (
                  <div key={appointment._id} className="border-b last:border-0 pb-2 last:pb-0">
                    <div className="font-medium mb-1">{appointment.title}</div>
                    <div className="text-sm text-muted-foreground">
                      <div>With {appointment.student.name}</div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {format(new Date(appointment.startTime), 'h:mm a')} -{' '}
                          {format(new Date(appointment.endTime), 'h:mm a')}
                        </span>
                      </div>
                      <div className="capitalize">
                        {appointment.type}
                        {appointment.type === 'in-person' && appointment.location && ` - ${appointment.location}`}
                        {appointment.type === 'virtual' && appointment.zoomLink && ' - Zoom link available'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-center py-4">
                  No appointments scheduled for today
                </div>
              )}

              {todaysAppointments.length > 0 && (
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
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
            <CardDescription>Appointment requests needing your response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAppointments.length > 0 ? (
                pendingAppointments.map((appointment) => (
                  <div key={appointment._id} className="border-b last:border-0 pb-4 last:pb-0">
                    <div className="mb-1 font-medium">{appointment.title}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <div>Student: {appointment.student.name}</div>
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
                      {appointment.description && (
                        <div className="mt-1 italic">"{appointment.description}"</div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-university-success hover:bg-university-success/90"
                        onClick={() => handleApprove(appointment._id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-university-error border-university-error hover:bg-university-error/10"
                        onClick={() => handleDecline(appointment._id)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-center py-4">
                  No pending requests
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">At a Glance</CardTitle>
            <CardDescription>Your appointment statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              {[
                { label: 'Today', value: todaysAppointments.length },
                { label: 'Upcoming', value: upcomingAppointmentsCount },
                { label: 'Pending', value: pendingCount },
                { label: 'Completed', value: completedCount },
              ].map(({ label, value }) => (
                <div key={label} className="bg-muted/50 rounded-lg p-4">
                  <div className="text-4xl font-bold text-university-blue mb-1">{value}</div>
                  <div className="text-sm text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-between space-x-2 mt-4">
              <Link to="/appointments" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  All Appointments
                </Button>
              </Link>
              <Link to="/availability" className="flex-1">
                <Button variant="outline" size="sm" className="w-full">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  Manage Schedule
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Common tasks and options</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link to="/availability" className="block">
                <div className="bg-muted/50 rounded-lg p-6 text-center hover:bg-muted">
                  <CalendarClock className="h-8 w-8 text-university-blue mb-2" />
                  <h3 className="font-medium">Set Office Hours</h3>
                  <p className="text-sm text-muted-foreground mt-1">Manage your availability</p>
                </div>
              </Link>

              <Link to="/appointments" className="block">
                <div className="bg-muted/50 rounded-lg p-6 text-center hover:bg-muted">
                  <Calendar className="h-8 w-8 text-university-blue mb-2" />
                  <h3 className="font-medium">View Calendar</h3>
                  <p className="text-sm text-muted-foreground mt-1">See your schedule</p>
                </div>
              </Link>

              <Link to="/appointments?filter=pending" className="block">
                <div className="bg-muted/50 rounded-lg p-6 text-center hover:bg-muted">
                  <UserCheck className="h-8 w-8 text-university-blue mb-2" />
                  <h3 className="font-medium">Review Requests</h3>
                  <p className="text-sm text-muted-foreground mt-1">Handle pending approvals</p>
                </div>
              </Link>

              <Link to="/profile" className="block">
                <div className="bg-muted/50 rounded-lg p-6 text-center hover:bg-muted">
                  <Users className="h-8 w-8 text-university-blue mb-2" />
                  <h3 className="font-medium">Update Profile</h3>
                  <p className="text-sm text-muted-foreground mt-1">Edit your information</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyDashboard;
