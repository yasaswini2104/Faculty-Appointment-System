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
