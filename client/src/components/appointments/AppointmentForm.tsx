import React, { useEffect, useState } from 'react';
import { useAppointments, AvailabilitySlot, AppointmentType } from '@/contexts/AppointmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { FacultyMember, getFacultyById } from '@/data/facultyData';

interface AppointmentFormProps {
  facultyId: string;
  selectedSlot?: AvailabilitySlot;
  onSuccess?: () => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  facultyId,
  selectedSlot,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const { createAppointment, fetchAppointments } = useAppointments(); // ✅ fetchAppointments added

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const facultyMember = getFacultyById(facultyId);

  if (!facultyMember) {
    return <div>Faculty member not found</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error('You must be logged in to book an appointment');
      return;
    }

    if (!selectedDate) {
      toast.error('Please select a date for your appointment');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select an availability slot');
      return;
    }

    setLoading(true);

    try {
      const [startHour, startMinute] = selectedSlot.startTime.split(':').map(Number);
      const [endHour, endMinute] = selectedSlot.endTime.split(':').map(Number);

      const startDate = new Date(selectedDate);
      startDate.setHours(startHour, startMinute, 0, 0);

      const endDate = new Date(selectedDate);
      endDate.setHours(endHour, endMinute, 0, 0);

      await createAppointment({
        title,
        description,
        startTime: startDate,
        endTime: endDate,
        type: selectedSlot.type,
        facultyId,
        facultyName: facultyMember.name,
        location: selectedSlot.location,
        status: 'pending',
      });

      toast.success('Appointment request submitted');

      // ✅ Refresh appointments list
      await fetchAppointments();

      setTitle('');
      setDescription('');
      setSelectedDate(undefined);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      toast.error('Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Book an Appointment with {facultyMember.name}</h2>
        <p className="text-muted-foreground">
          {facultyMember.title}, {facultyMember.department}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Appointment Title</Label>
          <Input
            id="title"
            placeholder="e.g., Thesis Discussion, Project Review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Briefly describe the purpose of this meeting..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {selectedSlot && (
          <div className="border p-4 rounded-md bg-muted/50">
            <h3 className="font-medium mb-2">Selected Time Slot</h3>
            <p><span className="font-medium">Day:</span> {selectedSlot.day}</p>
            <p><span className="font-medium">Time:</span> {selectedSlot.startTime} - {selectedSlot.endTime}</p>
            <p><span className="font-medium">Type:</span> {selectedSlot.type === 'in-person' ? 'In Person' : 'Virtual'}</p>
            {selectedSlot.type === 'in-person' && selectedSlot.location && (
              <p><span className="font-medium">Location:</span> {selectedSlot.location}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Select Date</Label>
          <div className="border rounded-md p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => {
                if (date < new Date()) return true;
                if (selectedSlot) {
                  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
                  return dayOfWeek !== selectedSlot.day;
                }
                return false;
              }}
              className="mx-auto"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !selectedDate || !selectedSlot}
          className="w-full bg-university-blue hover:bg-university-blue/90"
        >
          {loading ? 'Booking...' : 'Request Appointment'}
        </Button>
      </form>
    </div>
  );
};

export default AppointmentForm;
