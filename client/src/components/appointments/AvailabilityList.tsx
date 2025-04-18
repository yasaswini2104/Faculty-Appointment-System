import React from 'react';
import { useAppointments, AvailabilitySlot } from '@/contexts/AppointmentContext';
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
import { Clock, MapPin, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';

interface AvailabilityListProps {
  facultyId?: string;
  onSelectSlot?: (slot: AvailabilitySlot) => void;
  selectable?: boolean;
}


const AvailabilityList: React.FC<AvailabilityListProps> = ({
  facultyId,
  onSelectSlot,
  selectable = false
}) => {
  const { currentUser } = useAuth();
  const { availabilitySlots = [], removeAvailabilitySlot } = useAppointments();

  const targetFacultyId =
  facultyId || (currentUser?.role === 'faculty' ? currentUser._id : '');

  const facultySlots = availabilitySlots.filter(slot => slot.facultyId === targetFacultyId);

  const slotsByDay = facultySlots.reduce((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  const orderedDays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const parsed = parseInt(hours, 10);
    const period = parsed >= 12 ? 'PM' : 'AM';
    const displayHours = parsed > 12 ? parsed - 12 : parsed || 12;
    return `${displayHours}:${minutes} ${period}`;
  };

  const handleDelete = async (slotId: string) => {
    try {
      await removeAvailabilitySlot(slotId);
      toast.success('Availability slot removed');
    } catch (error) {
      console.error('Remove slot error:', error);
      toast.error('Failed to remove slot');
    }
  };

  const handleSelectSlot = (slot: AvailabilitySlot) => {
    if (onSelectSlot && selectable) {
      onSelectSlot(slot);
    }
  };

  if (facultySlots.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Availability Schedule</CardTitle>
          <CardDescription>
            {currentUser?.role === 'faculty' && !facultyId
              ? 'You have not set any availability slots yet'
              : 'No availability slots found for this faculty member'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {currentUser?.role === 'faculty' && !facultyId
              ? 'Add your first availability slot to start receiving appointment requests'
              : 'Check back later or contact the faculty member directly'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Schedule</CardTitle>
        <CardDescription>
          {currentUser?.role === 'faculty' && !facultyId
            ? 'Your current availability for appointments'
            : 'When this faculty member is available'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {orderedDays.map(day => {
            if (!slotsByDay[day]) return null;

            return (
              <div key={day}>
                <h3 className="font-semibold text-lg mb-2">{day}</h3>
                <div className="space-y-2">
                  {slotsByDay[day]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map(slot => (
                      <div
                        key={slot.id}
                        className={`border rounded-md p-3 flex justify-between items-center ${
                          selectable ? 'cursor-pointer hover:bg-muted/50' : ''
                        }`}
                        onClick={() => handleSelectSlot(slot)}
                      >
                        <div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span className="font-medium">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </span>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            {slot.type === 'in-person' ? (
                              <>
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{slot.location || 'No location specified'}</span>
                              </>
                            ) : (
                              <>
                                <Video className="h-3 w-3 mr-1" />
                                <span>Virtual</span>
                              </>
                            )}
                          </div>
                          {slot.recurring && (
                            <Badge variant="outline" className="mt-2">
                              Weekly
                            </Badge>
                          )}
                        </div>

                        {currentUser?.role === 'faculty' && !facultyId && !selectable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(slot.id!);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-university-error" />
                          </Button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityList;
