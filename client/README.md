AppointmentContext.tsx
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

  useEffect(() => {
    fetchAppointments();  // Ensure appointments are fetched on component load
  }, [fetchAppointments]); // Added fetchAppointments to dependency array

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


AuthContext.tsx
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';
import { authService } from '../lib/api';
import { useToast } from '@/components/ui/use-toast';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  position?: string;
  bio?: string;
  profileImage?: string;
  token: string;
}

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty';
  department?: string;
  position?: string;
  bio?: string;
}

type UpdateUserData = Partial<Omit<User, '_id' | 'token'>>;

interface AuthContextType {
  user: User | null;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (userData: RegisterUserData) => Promise<User>;
  logout: () => void;
  updateProfile: (userData: UpdateUserData) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (error) {
        console.error('Error parsing user info from localStorage:', error);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('userToken');
      }
    }
    setLoading(false);
  }, []);

  const extractErrorMessage = (error: unknown): string => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof error.response === 'object' &&
      error.response !== null &&
      'data' in error.response &&
      typeof error.response.data === 'object' &&
      error.response.data !== null &&
      'message' in error.response.data
    ) {
      return (error as { response: { data: { message: string } } }).response.data.message;
    }
    return 'An unexpected error occurred';
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.login(email, password);
      setUser(data);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.name}!`,
      });
      return data;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterUserData): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.register(userData);
      setUser(data);
      toast({
        title: 'Registration successful',
        description: `Welcome, ${data.name}!`,
      });
      return data;
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out',
    });
  };

  const updateProfile = async (userData: UpdateUserData): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const data = await authService.updateProfile(userData);
      setUser(data);
      toast({
        title: 'Profile updated',
        description: 'Your profile was successfully updated',
      });
    } catch (error: unknown) {
      const errorMessage = extractErrorMessage(error);
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


NotificationContext.tsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { notificationService } from '../lib/api';
import { useAuth } from './AuthContext';

export type NotificationType =
  | 'appointment_request'
  | 'appointment_approved'
  | 'appointment_rejected'
  | 'appointment_canceled'
  | 'system';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
  };
  type: NotificationType;
  content: string;
  read: boolean;
  relatedAppointment?: string;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface AxiosErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const extractErrorMessage = (err: unknown): string => {
    const error = err as AxiosErrorShape;
    return error?.response?.data?.message || 'Something went wrong';
  };

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getMyNotifications();
      setNotifications(data);
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      const message = extractErrorMessage(err);
      setError(message);
      console.error('Error marking all notifications as read:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

api.ts
import axios, { AxiosRequestConfig } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import type {
  Appointment,
  AvailabilitySlot,
  CreateAvailabilitySlot,
} from '@/contexts/AppointmentContext';

export interface BackendAvailabilitySlot {
  _id: string;
  faculty: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  type: 'in-person' | 'virtual';
  location?: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  email: string;
  title?: string;
  department: string;
  specialization: string;
  bio?: string;
  profileImageUrl?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ========== AUTH SERVICE ==========

export interface LoginResponse {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  department?: string;
  position?: string;
  bio?: string;
  profileImage?: string;
  token: string;
}

interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty';
  department?: string;
  position?: string;
  bio?: string;
}

interface UserUpdateData {
  name?: string;
  email?: string;
  department?: string;
  position?: string;
  bio?: string;
  profileImage?: string;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/users/login', { email, password });
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    localStorage.setItem('userToken', res.data.token);
    return res.data;
  },

  register: async (userData: RegisterUserData): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/users/register', userData);
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    localStorage.setItem('userToken', res.data.token);
    return res.data;
  },

  logout: (): void => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userToken');
  },

  updateProfile: async (userData: UserUpdateData): Promise<LoginResponse> => {
    const res = await api.put<LoginResponse>('/users/profile', userData);
    localStorage.setItem('userInfo', JSON.stringify(res.data));
    localStorage.setItem('userToken', res.data.token);
    return res.data;
  },
};

// ========== FACULTY SERVICE ==========

export const facultyService = {
  getAllFaculty: async (): Promise<FacultyMember[]> => {
    const response = await api.get('/users/faculty');
    return response.data;
  },

  getFacultyById: async (id: string): Promise<FacultyMember> => {
    const response = await api.get(`/users/faculty/${id}`);
    return response.data;
  },
};

// ========== AVAILABILITY SERVICE ==========

export const availabilityService = {
  addAvailabilitySlot: async (slotData: CreateAvailabilitySlot): Promise<AvailabilitySlot> => {
    const res = await api.post('/availability', slotData);
    return res.data;
  },

  getMyAvailability: async (): Promise<BackendAvailabilitySlot[]> => {
    const res = await api.get('/availability/me');
    return res.data;
  },

  getFacultyAvailability: async (facultyId: string): Promise<BackendAvailabilitySlot[]> => {
    const res = await api.get(`/availability/faculty/${facultyId}`);
    return res.data;
  },

  updateAvailability: async (id: string, data: Partial<CreateAvailabilitySlot>): Promise<AvailabilitySlot> => {
    const res = await api.put(`/availability/${id}`, data);
    return res.data;
  },

  deleteAvailability: async (id: string): Promise<void> => {
    await api.delete(`/availability/${id}`);
  },
};

// ========== APPOINTMENT SERVICE ==========

export const appointmentService = {
  createAppointment: async (data: Record<string, unknown>): Promise<Appointment> => {
    const res = await api.post('/appointments', data);
    return res.data;
  },

  getMyAppointments: async (): Promise<Appointment[]> => {
    const res = await api.get('/appointments/me');
    return res.data;
  },

  getFacultyAppointments: async (facultyId: string): Promise<Appointment[]> => {
    const res = await api.get(`/appointments/faculty/${facultyId}`);
    return res.data;
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    const res = await api.get(`/appointments/${id}`);
    return res.data;
  },

  updateAppointmentStatus: async (
    id: string,
    statusData: Record<string, unknown>
  ): Promise<Appointment> => {
    const res = await api.put(`/appointments/${id}`, statusData);
    return res.data;
  },

  addAvailabilitySlot: async (slotData: CreateAvailabilitySlot): Promise<AvailabilitySlot> => {
    const res = await api.post('/availability', slotData);
    return res.data;
  },

  removeAvailabilitySlot: async (slotId: string): Promise<void> => {
    await api.delete(`/availability/${slotId}`);
  },
};

// ========== NOTIFICATION SERVICE ==========

export const notificationService = {
  getMyNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },

  markAsRead: async (id: string) => {
    const res = await api.put(`/notifications/${id}`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
};

export default api;


utils.js
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

AppointmentForm.tsx
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

AppointmentList.tsx

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

AvailabilityForm.jsx
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

AvailabilityList.tsx
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

LoginForm.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const user = await login(email, password); // this returns user with role
  
      switch (user?.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'faculty':
          navigate('/faculty/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          navigate('/');
          break;
      }
  
      toast.success('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };
  

  const setDemoCredentials = (role: 'student' | 'faculty' | 'admin') => {
    const demoEmails: Record<typeof role, string> = {
      student: 'student@university.edu',
      faculty: 'faculty@university.edu',
      admin: 'admin@university.edu',
    };
    setEmail(demoEmails[role]);
    setPassword('password');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Welcome back to University Connect
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-university-lightBlue hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-university-blue hover:bg-university-blue/90"
            aria-busy={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        {/* Demo credentials */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-500">Demo Accounts</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDemoCredentials('student')}
              disabled={loading}
            >
              Student
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDemoCredentials('faculty')}
              disabled={loading}
            >
              Faculty
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDemoCredentials('admin')}
              disabled={loading}
            >
              Admin
            </Button>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-university-lightBlue hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;

RegisterForm.tsx
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (role === 'faculty' && (!department || !position)) {
      toast.error('Faculty must provide department and position');
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        role,
        ...(role === 'faculty' && {
          department,
          position,
          bio,
        }),
      });

      navigate('/');
      toast.success('Registration successful');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Join University Connect to schedule and manage appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => {
                if (value === 'student' || value === 'faculty') {
                  setRole(value);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {role === 'faculty' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g. CSE"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="e.g. Professor"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio (optional)</Label>
                <Input
                  id="bio"
                  placeholder="Tell something about you"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-university-blue hover:bg-university-blue/90"
          >
            {loading ? 'Creating account...' : 'Register'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-university-lightBlue hover:underline">
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;

AdminDashboard.tsx
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

FacultyDashboard.tsx
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

StudentDashboard.tsx
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

FacultyDetails.tsx
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

FacultyList.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FacultyMember } from '@/data/facultyData'; // interface only
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GraduationCap, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FacultyListProps {
  facultyData: FacultyMember[];
  filter?: {
    department?: string;
    searchQuery?: string;
  };
}

const FacultyList: React.FC<FacultyListProps> = ({ facultyData, filter }) => {
  const filteredFaculty = facultyData.filter((faculty) => {
    if (filter?.department && faculty.department !== filter.department) return false;

    if (filter?.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      return (
        faculty.name.toLowerCase().includes(query) ||
        faculty.department.toLowerCase().includes(query) ||
        faculty.specialization.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase();

  if (filteredFaculty.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No faculty members found</h3>
        <p className="text-muted-foreground">
          Try changing your search criteria or department filter
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredFaculty.map((faculty) => (
        <Card key={faculty.id || faculty.email || faculty.name} className="overflow-hidden">
          <div className="h-24 bg-university-blue"></div>
          <CardContent className="pt-0">
            <div className="flex justify-center -mt-12 mb-4">
              <Avatar className="h-24 w-24 border-4 border-white">
                <AvatarImage src={faculty.profileImageUrl} alt={faculty.name} />
                <AvatarFallback className="text-xl bg-university-lightBlue text-white">
                  {getInitials(faculty.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold">{faculty.name}</h3>
              <p className="text-university-blue">{faculty.title}</p>
              <div className="flex items-center justify-center mt-1">
                <GraduationCap className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{faculty.department}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Specialization</h4>
                <p className="text-sm text-muted-foreground">{faculty.specialization}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-muted/50">
                  {faculty.department}
                </Badge>
                <Badge variant="outline" className="bg-muted/50">
                {(faculty.specialization ?? 'N/A').split(' ')[0]}
                </Badge>
              </div>

              <Link to={`/faculty/${faculty.id}`} className="block">
                <Button className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Appointment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FacultyList;

Header.tsx

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Bell, Calendar, LogOut, Settings, User } from 'lucide-react';
import NotificationDropdown from '../notifications/NotificationDropdown';
import { useNotifications } from '@/contexts/NotificationContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = async () => {
    await logout();
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <header className="bg-university-blue text-white shadow-md sticky top-0 z-50">
      <div className="university-container py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/" className="text-xl font-bold flex items-center">
            <Calendar className="mr-2 h-6 w-6" />
            <span className="hidden sm:inline">University Connect</span>
          </Link>
        </div>
        
        {user ? (
          <div className="flex items-center space-x-2">
            <NotificationDropdown />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="cursor-pointer flex w-full items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer flex w-full items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:text-white hover:bg-university-blue/80">
                Log in
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-white text-university-blue hover:bg-gray-100">
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

MainLayout.jsx

import React from 'react';
import Header from './Header';
import SideNavigation from './SideNavigation';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        {user && <SideNavigation />}
        
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="university-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

SideNavigation.tsx

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calendar, 
  CalendarClock, 
  GraduationCap, 
  Home, 
  UserCog, 
  Users,
  BarChart
} from 'lucide-react';

const SideNavigation: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  if (!user) return null;
  
  // Define navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { name: 'Dashboard', href: '/', icon: Home },
      { name: 'Appointments', href: '/appointments', icon: Calendar }
    ];
    
    if (user.role === 'student') {
      return [
        ...commonItems,
        { name: 'Faculty Directory', href: '/faculty', icon: Users },
      ];
    } else if (user.role === 'faculty') {
      return [
        ...commonItems,
        { name: 'Availability', href: '/availability', icon: CalendarClock },
      ];
    } else if (user.role === 'admin') {
      return [
        ...commonItems,
        { name: 'Faculty Management', href: '/faculty-management', icon: GraduationCap },
        { name: 'Student Management', href: '/student-management', icon: Users },
        { name: 'User Management', href: '/user-management', icon: UserCog },
        { name: 'Analytics', href: '/analytics', icon: BarChart },
      ];
    }
    
    return commonItems;
  };
  
  const navItems = getNavItems();
  
  return (
    <aside className="w-64 hidden md:block bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm rounded-md",
                isActive 
                  ? "bg-university-blue text-white" 
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-gray-500")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SideNavigation;

NotificationDropdown.tsx
import React from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  
  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  // ✅ Updated to match your NotificationType
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment_request':
      case 'appointment_approved':
        return <div className="w-2 h-2 rounded-full bg-university-lightBlue mr-2" />;
      case 'appointment_canceled':
      case 'appointment_rejected':
        return <div className="w-2 h-2 rounded-full bg-university-error mr-2" />;
      case 'system':
        return <div className="w-2 h-2 rounded-full bg-gray-500 mr-2" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-muted mr-2" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <Bell className="h-5 w-5 text-white" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-university-error text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead} 
              className="text-xs h-auto py-1"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`cursor-pointer py-3 px-4 ${!notification.read ? 'bg-muted/50' : ''}`}
                onClick={() => handleNotificationClick(notification._id)}
              >
                <div className="flex items-start w-full">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="font-medium text-sm">{notification.content}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              No notifications
            </div>
          )}
        </DropdownMenuGroup>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center" asChild>
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <a href="/notifications">View all notifications</a>
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;

AdminDashboard.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AdminDashboard from '@/components/dashboard/AdminDashboard';

const AdminDashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <AdminDashboard />
    </MainLayout>
  );
};

export default AdminDashboardPage;

AppointmentsPage.tsx

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import AppointmentList from '@/components/appointments/AppointmentList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="heading-1">Appointments</h1>
        
        <Tabs defaultValue="upcoming" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full max-w-md mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <AppointmentList filter="upcoming" />
          </TabsContent>
          
          <TabsContent value="pending">
            <AppointmentList filter="pending" />
          </TabsContent>
          
          <TabsContent value="past">
            <AppointmentList filter="past" />
          </TabsContent>
          
          <TabsContent value="all">
            <AppointmentList filter="all" />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AppointmentsPage;

AvailabilityPage.tsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useAppointments } from '@/contexts/AppointmentContext';
import MainLayout from '@/components/layout/MainLayout';
import AvailabilityForm from '@/components/appointments/AvailabilityForm';
import AvailabilityList from '@/components/appointments/AvailabilityList';

const AvailabilityPage: React.FC = () => {
  const { user } = useAuth();
  const { fetchAvailabilitySlots } = useAppointments();

  // ✅ Always call hooks at the top
  useEffect(() => {
    if (user && user.role === 'faculty') {
      fetchAvailabilitySlots(user._id);
    }
  }, [user, fetchAvailabilitySlots]);

  // ✅ Only conditional rendering happens below
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'faculty') return <Navigate to="/" />;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="heading-1">Manage Availability</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AvailabilityForm />
          </div>
          <div className="lg:col-span-2">
            <AvailabilityList />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AvailabilityPage;

FacultyDashboardPage.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import FacultyDashboard from '@/components/dashboard/FacultyDashboard';

const FacultyDashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <FacultyDashboard />
    </MainLayout>
  );
};

export default FacultyDashboardPage;

FacultyDetailsPage.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import FacultyDetail from '@/components/faculty/FacultyDetail';

const FacultyDetailPage: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return (
    <MainLayout>
      <FacultyDetail />
    </MainLayout>
  );
};

export default FacultyDetailPage;

FacultyDirectoryPage.tsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import FacultyList from '@/components/faculty/FacultyList';
import { getDepartments, facultyMembers, FacultyMember } from '@/data/facultyData';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search, Filter } from 'lucide-react';
import { facultyService } from '@/lib/api';

const FacultyDirectoryPage: React.FC = () => {
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>(facultyMembers);

  useEffect(() => {
    const loadData = async () => {
      try {
        const backendFaculty: FacultyMember[] = await facultyService.getAllFaculty();
        setFaculty(backendFaculty);

        const deptSet = new Set(backendFaculty.map((f) => f.department));
        setDepartments(['all', ...Array.from(deptSet)]);
      } catch (error) {
        console.error('Fallback to static data due to error:', error);
        setDepartments(['all', ...getDepartments()]);
      }
    };

    loadData();
  }, []);

  // 🔐 Redirect placed **after** hooks
  if (!user) return <Navigate to="/login" />;

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="heading-1">Faculty Directory</h1>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="flex items-center">
                <Search className="h-4 w-4 mr-1" />
                <span>Search Faculty</span>
              </Label>
              <Input
                id="search"
                placeholder="Search by name, department, or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                <span>Filter by Department</span>
              </Label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <FacultyList
          facultyData={faculty}
          filter={{
            department: selectedDepartment === 'all' ? '' : selectedDepartment,
            searchQuery
          }}
        />
      </div>
    </MainLayout>
  );
};

export default FacultyDirectoryPage;

Index.tsx
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

LoginPage.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />;
  }
  
  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-12">
        <LoginForm />
      </div>
    </MainLayout>
  );
};

export default LoginPage;

NotFound.tsx
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

RegisterPage.tsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import RegisterForm from '@/components/auth/RegisterForm';

const RegisterPage: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />;
  }
  
  return (
    <MainLayout>
      <div className="max-w-md mx-auto py-12">
        <RegisterForm />
      </div>
    </MainLayout>
  );
};

export default RegisterPage;

StudentDashboardPage.tsx
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

const StudentDashboardPage: React.FC = () => {
  return (
    <MainLayout>
      <StudentDashboard />
    </MainLayout>
  );
};

export default StudentDashboardPage;

ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  children: React.ReactNode;
  allowedRoles: Array<'student' | 'faculty' | 'admin'>;
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;



