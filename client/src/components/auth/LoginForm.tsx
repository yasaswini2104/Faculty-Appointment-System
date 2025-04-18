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
