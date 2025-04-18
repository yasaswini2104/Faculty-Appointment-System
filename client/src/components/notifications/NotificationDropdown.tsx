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
