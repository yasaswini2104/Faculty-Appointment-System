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
