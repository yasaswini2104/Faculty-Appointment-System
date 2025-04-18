import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { appointmentService, availabilityService } from '../lib/api';
import { useToast } from '@/components/ui/use-toast';

export type AppointmentType = 'in-person' | 'virtual';

export interface AvailabilitySlot {
  id?: string;
  facultyId: string;
  day: string;
  startTime: string;
  endTime: string;
  recurring: boolean;
  type: AppointmentType;
  location?: string;
}

export interface CreateAvailabilitySlot {
  facultyId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  type: AppointmentType;
  location?: string;
}

interface BackendAvailabilitySlot {
  _id: string;
  faculty: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  type: AppointmentType;
  location?: string;
}

export interface Appointment {
  _id: string;
  title: string;
  minutesOfMeeting?: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  faculty: {
    _id: string;
    name: string;
    email: string;
    department?: string;
    position?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'rejected' | 'canceled' | 'completed';
  reason: string;
  notes?: string;
  createdAt: string;
  type: AppointmentType;
  location?: string;
  zoomLink?: string;
  description?: string;
}

export interface CreateAppointmentData {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  type: AppointmentType;
  facultyId: string;
  facultyName?: string;
  location?: string;
  status: 'pending';
}

interface AppointmentContextType {
  appointments: Appointment[];
  selectedAppointment: Appointment | null;
  availabilitySlots: AvailabilitySlot[];
  loading: boolean;
  error: string | null;
  fetchAppointments: () => Promise<void>;
  fetchAvailabilitySlots: (facultyId: string) => Promise<void>;
  getAppointmentById: (id: string) => Promise<void>;
  createAppointment: (data: CreateAppointmentData) => Promise<void>;
  updateAppointmentStatus: (
    id: string,
    data: Partial<Pick<Appointment, 'status' | 'minutesOfMeeting' | 'notes'>>
  ) => Promise<void>;
  addAvailabilitySlot: (slot: CreateAvailabilitySlot) => Promise<void>;
  removeAvailabilitySlot: (slotId: string) => Promise<void>;
}

const AppointmentContext = createContext<AppointmentContextType | undefined>(undefined);

interface AxiosErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const AppointmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Use useEffect to fetch appointments on component load

  const extractErrorMessage = (err: unknown): string => {
    const error = err as AxiosErrorShape;
    return error?.response?.data?.message || 'Something went wrong';
  };

  // useCallback with the toast dependency
  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await appointmentService.getMyAppointments(); // Ensure token is passed
      setAppointments(data);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setLoading(false);
    }
  }, [toast]);  

// Added fetchAppointments to dependency array

  const fetchAvailabilitySlots = async (facultyId: string) => {
    try {
      setLoading(true);
      const slots = await availabilityService.getFacultyAvailability(facultyId);
      const transformed: AvailabilitySlot[] = slots.map((slot: BackendAvailabilitySlot) => ({
        id: slot._id,
        facultyId: slot.faculty,
        day: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        recurring: slot.isRecurring,
        type: slot.type,
        location: slot.location,
      }));
      setAvailabilitySlots(transformed);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAppointmentById(id);
      setSelectedAppointment(data);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (appointmentData: CreateAppointmentData) => {
    try {
      setLoading(true);
      setError(null);
      const startTimeStr = appointmentData.startTime.toTimeString().slice(0, 5);
      const endTimeStr = appointmentData.endTime.toTimeString().slice(0, 5);
      const student = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const payload = {
        faculty: appointmentData.facultyId,
        student: student._id,
        date: appointmentData.startTime.toISOString().split('T')[0],
        startTime: startTimeStr,
        endTime: endTimeStr,
        reason: appointmentData.title,
        description: appointmentData.description,
        type: appointmentData.type,
        location: appointmentData.location,
        status: appointmentData.status || 'pending',
      };
      await appointmentService.createAppointment(payload);
      await fetchAppointments();
      toast({
        title: 'Appointment requested',
        description: 'Your appointment request was submitted successfully',
      });
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast({ variant: 'destructive', title: 'Error', description: message });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    id: string,
    data: Partial<Pick<Appointment, 'status' | 'minutesOfMeeting' | 'notes'>>
  ) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await appointmentService.updateAppointmentStatus(id, data);
      setAppointments((prev) =>
        prev.map((app) => (app._id === id ? updated : app))
      );
      if (selectedAppointment?._id === id) {
        setSelectedAppointment(updated);
      }
      toast({
        title: 'Status updated',
        description: `Appointment marked as ${updated.status}`,
      });
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast({ variant: 'destructive', title: 'Error', description: message });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addAvailabilitySlot = async (slot: CreateAvailabilitySlot) => {
    try {
      setLoading(true);
      setError(null);
      await appointmentService.addAvailabilitySlot(slot);
      await fetchAvailabilitySlots(slot.facultyId);
      toast({ title: 'Slot added', description: 'Your availability slot was added.' });
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast({ variant: 'destructive', title: 'Error', description: message });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const removeAvailabilitySlot = async (slotId: string) => {
    try {
      setLoading(true);
      await appointmentService.removeAvailabilitySlot(slotId);
      setAvailabilitySlots((prev) => prev.filter((slot) => slot.id !== slotId));
      toast({ title: 'Slot removed', description: 'Availability slot has been deleted.' });
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      toast({ variant: 'destructive', title: 'Error', description: message });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppointmentContext.Provider
      value={{
        appointments,
        selectedAppointment,
        availabilitySlots,
        loading,
        error,
        fetchAppointments,
        fetchAvailabilitySlots,
        getAppointmentById,
        createAppointment,
        updateAppointmentStatus,
        addAvailabilitySlot,
        removeAvailabilitySlot,
      }}
    >
      {children}
    </AppointmentContext.Provider>
  );
};

export const useAppointments = (): AppointmentContextType => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointments must be used within an AppointmentProvider');
  }
  return context;
};
