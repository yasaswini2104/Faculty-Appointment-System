import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getFacultyById } from '@/data/facultyData';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  ArrowLeft,
  GraduationCap,
  Mail,
  Calendar,
  CalendarClock,
  Clock,
} from 'lucide-react';
import AvailabilityList from '../appointments/AvailabilityList';
import AppointmentForm from '../appointments/AppointmentForm';
import { AvailabilitySlot } from '@/contexts/AppointmentContext';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const FacultyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | undefined>(undefined);
  const [bookingComplete, setBookingComplete] = useState(false);

  if (!id) return <div>Faculty ID not provided</div>;

  const faculty = getFacultyById(id);

  if (!faculty) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Faculty Not Found</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't find the faculty member you're looking for.
        </p>
        <Link to="/faculty">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Faculty Directory
          </Button>
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

  const handleSlotSelect = (slot: AvailabilitySlot) => setSelectedSlot(slot);

  const handleBookingSuccess = () => {
    setBookingComplete(true);
    setSelectedSlot(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Link
          to="/faculty"
          className="flex items-center text-university-blue hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Faculty Directory</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={faculty.profileImageUrl || ''} alt={faculty.name} />
                  <AvatarFallback className="text-xl bg-university-lightBlue text-white">
                    {getInitials(faculty.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl">{faculty.name}</CardTitle>
              <CardDescription className="text-lg text-university-blue">
                {faculty.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2 text-university-blue" />
                  <span>{faculty.department}</span>
                </div>

                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-university-blue" />
                  <a
                    href={`mailto:${faculty.email}`}
                    className="text-university-lightBlue hover:underline"
                  >
                    {faculty.email}
                  </a>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Specialization</h3>
                  <p className="text-muted-foreground">
                    {faculty.specialization || 'Not provided'}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Biography</h3>
                  <p className="text-muted-foreground">
                    {faculty.bio || 'No bio available'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {faculty.department && (
                    <Badge variant="outline" className="bg-muted/50">
                      {faculty.department}
                    </Badge>
                  )}
                  {faculty.specialization && (
                    <Badge variant="outline" className="bg-muted/50">
                      {faculty.specialization.split(' ')[0]}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {bookingComplete ? (
            <Card>
              <CardHeader>
                <CardTitle>Appointment Request Submitted</CardTitle>
                <CardDescription>
                  Your request has been sent to {faculty.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="flex justify-center my-6">
                  <div className="w-16 h-16 rounded-full bg-university-success/20 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-university-success" />
                  </div>
                </div>
                <p>You will receive a notification once your appointment request is reviewed.</p>
                <div className="space-x-4 pt-4">
                  <Button variant="outline" onClick={() => setBookingComplete(false)}>
                    Book Another Appointment
                  </Button>
                  <Link to="/appointments">
                    <Button>View Your Appointments</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="availability">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="availability" className="flex items-center">
                  <CalendarClock className="h-4 w-4 mr-2" />
                  <span>Availability</span>
                </TabsTrigger>
                <TabsTrigger value="booking" className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>Book Appointment</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="availability">
                <AvailabilityList
                  facultyId={faculty.id}
                  onSelectSlot={handleSlotSelect}
                  selectable
                />
                {selectedSlot && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() =>
                        document.querySelector('[data-value="booking"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
                      }
                    >
                      Continue to Booking
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="booking">
                <AppointmentForm
                  facultyId={faculty.id}
                  selectedSlot={selectedSlot}
                  onSuccess={handleBookingSuccess}
                />
                {!selectedSlot && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-md text-center">
                    <p className="mb-2">Please select an availability slot first</p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.querySelector('[data-value="availability"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))
                      }
                    >
                      Select Availability Slot
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDetail;
