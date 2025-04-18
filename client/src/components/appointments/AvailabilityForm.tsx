import React, { useState } from 'react';
import {
  useAppointments,
  AppointmentType,
  CreateAvailabilitySlot,
} from '@/contexts/AppointmentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const AvailabilityForm: React.FC = () => {
  const { currentUser } = useAuth();
  const { addAvailabilitySlot } = useAppointments();

  const [day, setDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [type, setType] = useState<AppointmentType>('in-person');
  const [location, setLocation] = useState('');
  const [recurring, setRecurring] = useState(true);
  const [loading, setLoading] = useState(false);

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || currentUser.role !== 'faculty') {
      toast.error('Only faculty members can add availability slots');
      return;
    }

    if (!day || !startTime || !endTime) {
      toast.error('Please provide day, start time and end time');
      return;
    }

    if (startTime >= endTime) {
      toast.error('Start time must be before end time');
      return;
    }

    if (type === 'in-person' && !location.trim()) {
      toast.error('Location is required for in-person appointments');
      return;
    }

    setLoading(true);

    try {
      const newSlot: CreateAvailabilitySlot = {
        facultyId: currentUser._id,
        dayOfWeek: day,
        startTime,
        endTime,
        isRecurring: recurring,
        type,
        location: type === 'in-person' ? location : undefined,
      };

      await addAvailabilitySlot(newSlot);

      // Reset form
      setDay('');
      setStartTime('');
      setEndTime('');
      setType('in-person');
      setLocation('');
      setRecurring(true);

      toast.success('Availability slot added successfully');
    } catch (error) {
      console.error('Error adding slot:', error);
      toast.error('Failed to add availability slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Availability Slot</CardTitle>
        <CardDescription>
          Set your available time slots for students to book appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Day of Week */}
          <div className="space-y-2">
            <Label htmlFor="day">Day of Week</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger id="day">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Appointment Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Appointment Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as AppointmentType)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in-person">In Person</SelectItem>
                <SelectItem value="virtual">Virtual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location (only for in-person) */}
          {type === 'in-person' && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., CSE Block 104"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          )}

          {/* Recurring Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={recurring}
              onCheckedChange={setRecurring}
            />
            <Label htmlFor="recurring">Recurring weekly slot</Label>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-university-blue hover:bg-university-blue/90"
          >
            {loading ? 'Adding...' : 'Add Availability Slot'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AvailabilityForm;
