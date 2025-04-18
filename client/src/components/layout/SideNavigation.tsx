
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
