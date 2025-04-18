
import React, { useState } from 'react';
import { useAppointments, Appointment } from '@/contexts/AppointmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  CheckCircle2, 
  XCircle,
  FileText,
  MoreHorizontal
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface AppointmentListProps {
  filter?: 'upcoming' | 'past' | 'pending' | 'all';
}

const AppointmentList: React.FC<AppointmentListProps> = ({ 
  filter = 'all'
}) => {
  const { currentUser } = useAuth();
  const { appointments, updateAppointmentStatus } = useAppointments();
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [minutesOfMeeting, setMinutesOfMeeting] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const userAppointments = appointments.filter(appt =>
    currentUser?.role === 'student'
      ? appt.student._id === currentUser._id
      : appt.faculty._id === currentUser?._id
  );
  
  
  // Filter appointments based on the filter prop
  const filteredAppointments = userAppointments.filter(appt => {
    const now = new Date();
    const appointmentDate = new Date(appt.startTime);
    
    if (filter === 'upcoming') {
      return appointmentDate > now && appt.status !== 'canceled';
    } else if (filter === 'past') {
      return appointmentDate < now || appt.status === 'completed';
    } else if (filter === 'pending') {
      return appt.status === 'pending';
    } else {
      return true; // 'all'
    }
  });
  
  // Sort appointments by date (most recent first for past, earliest first for upcoming)
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    if (filter === 'past') {
      return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
    } else {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    }
  });
  
  // Get appointment status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-university-success">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-university-lightBlue">Pending</Badge>;
      case 'declined':
        return <Badge className="bg-university-error">Declined</Badge>;
      case 'canceled':
        return <Badge variant="outline">Canceled</Badge>;
      case 'completed':
        return <Badge variant="outline">Completed</Badge>;
      default:
        return null;
    }
  };
  
  const handleApprove = async (id: string) => {
    setLoading(true);
    try {
      await updateAppointmentStatus(id, { status: 'approved' });
      toast.success('Appointment approved');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDecline = async (id: string) => {
    setLoading(true);
    try {
      await updateAppointmentStatus(id, { status: 'rejected' });
      toast.success('Appointment declined');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = async (id: string) => {
    setLoading(true);
    try {
      await updateAppointmentStatus(id, { status: 'canceled' });
      toast.success('Appointment canceled');
    } finally {
      setLoading(false);
    }
  };
  
  const handleComplete = async (id: string) => {
    setLoading(true);
    try {
      await updateAppointmentStatus(id, { status: 'completed' });
      toast.success('Appointment marked as completed');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddMinutes = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setMinutesOfMeeting(appointment.minutesOfMeeting || '');
    setIsDialogOpen(true);
  };
  
  const saveMinutesOfMeeting = async () => {
    if (!selectedAppointment) return;
    setLoading(true);
    try {
      await updateAppointmentStatus(selectedAppointment._id, { 
        minutesOfMeeting,
        status: 'completed' 
      });
      setIsDialogOpen(false);
      toast.success('Minutes of meeting saved');
    } finally {
      setLoading(false);
    }

  };
  
  if (sortedAppointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === 'upcoming' && 'Upcoming Appointments'}
            {filter === 'past' && 'Past Appointments'}
            {filter === 'pending' && 'Pending Appointments'}
            {filter === 'all' && 'All Appointments'}
          </CardTitle>
          <CardDescription>
            {filter === 'upcoming' && 'Your scheduled upcoming appointments'}
            {filter === 'past' && 'Your previous appointments'}
            {filter === 'pending' && 'Appointments awaiting approval'}
            {filter === 'all' && 'All your appointments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No appointments found
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === 'upcoming' && 'Upcoming Appointments'}
            {filter === 'past' && 'Past Appointments'}
            {filter === 'pending' && 'Pending Appointments'}
            {filter === 'all' && 'All Appointments'}
          </CardTitle>
          <CardDescription>
            {filter === 'upcoming' && 'Your scheduled upcoming appointments'}
            {filter === 'past' && 'Your previous appointments'}
            {filter === 'pending' && 'Appointments awaiting approval'}
            {filter === 'all' && 'All your appointments'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedAppointments.map((appointment) => (
              <div key={appointment._id} className="border rounded-md p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-lg">{appointment.title}</h3>
                    <div className="text-sm text-muted-foreground">
                      {currentUser?.role === 'student' 
                        ? `With: ${appointment.faculty.name}` 
                        : `Student: ${appointment.student.name}`}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(appointment.status)}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild disabled={loading}>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Options</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {/* Faculty options for pending appointments */}
                        {currentUser?.role === 'faculty' && appointment.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(appointment._id)}>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-university-success" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDecline(appointment._id)}>
                              <XCircle className="h-4 w-4 mr-2 text-university-error" />
                              Decline
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {/* Student options for pending or approved appointments */}
                        {currentUser?.role === 'student' && 
                          (appointment.status === 'pending' || appointment.status === 'approved') && 
                          new Date(appointment.startTime) > new Date() && (
                          <DropdownMenuItem onClick={() => handleCancel(appointment._id)}>
                            <XCircle className="h-4 w-4 mr-2 text-university-error" />
                            Cancel
                          </DropdownMenuItem>
                        )}
                        
                        {/* Faculty options for approved appointments that have passed */}
                        {currentUser?.role === 'faculty' && 
                          appointment.status === 'approved' &&
                          new Date(appointment.endTime) < new Date() && (
                          <>
                            <DropdownMenuItem onClick={() => handleComplete(appointment._id)}>
                              <CheckCircle2 className="h-4 w-4 mr-2 text-university-success" />
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddMinutes(appointment)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Add Minutes of Meeting
                            </DropdownMenuItem>
                          </>
                        )}
                        
                        {/* View minutes of meeting (for both roles if available) */}
                        {appointment.minutesOfMeeting && (
                          <DropdownMenuItem onClick={() => handleAddMinutes(appointment)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Minutes of Meeting
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2" /> 
                    <span>{format(new Date(appointment.startTime), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      {format(new Date(appointment.startTime), 'h:mm a')} - 
                      {format(new Date(appointment.endTime), 'h:mm a')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    {appointment.type === 'in-person' ? (
                      <>
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{appointment.location || 'No location specified'}</span>
                      </>
                    ) : (
                      <>
                        <Video className="h-4 w-4 mr-2" />
                        <span>
                          Virtual Meeting
                          {appointment.zoomLink && (
                            <a 
                              href={appointment.zoomLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="ml-2 text-university-lightBlue hover:underline"
                            >
                              Join Meeting
                            </a>
                          )}
                        </span>
                      </>
                    )}
                  </div>
                  
                  {appointment.description && (
                    <div className="mt-2 text-sm border-t pt-2">
                      <p className="text-muted-foreground">{appointment.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Minutes of Meeting</DialogTitle>
            <DialogDescription>
              {selectedAppointment && (
                <span>
                  {selectedAppointment.title} - {format(new Date(selectedAppointment.startTime), 'MMMM d, yyyy')}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Textarea
              placeholder="Enter the minutes of the meeting here..."
              value={minutesOfMeeting}
              onChange={(e) => setMinutesOfMeeting(e.target.value)}
              rows={8}
              readOnly={currentUser?.role === 'student' || selectedAppointment?.status === 'completed'}
            />
            
            {currentUser?.role === 'faculty' && selectedAppointment?.status !== 'completed' && (
              <Button className="w-full" onClick={saveMinutesOfMeeting} disabled={loading}>
                Save and Complete
              </Button>
            )}
            
            {(currentUser?.role === 'student' || selectedAppointment?.status === 'completed') && (
              <Button className="w-full" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AppointmentList;
