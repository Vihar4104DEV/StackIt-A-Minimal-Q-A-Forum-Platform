
import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/store/notificationStore';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationsDropdown = () => {
  const {
    notifications,
    unreadCount,
    isOpen,
    toggleDropdown,
    closeDropdown,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeDropdown]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'question_answered':
        return '💬';
      case 'answer_commented':
        return '💭';
      case 'mention':
        return '👤';
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDropdown}
        className="relative p-1 sm:p-2"
      >
        <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        {unreadCount > 0 && (
          <div className="notification-dot">
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-popover border rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="p-3 sm:p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm sm:text-base">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-80 sm:max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-3 sm:p-4 text-center text-muted-foreground text-sm">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 sm:p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${
                    !notification.isRead ? 'bg-primary/5' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="text-base sm:text-lg">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-xs sm:text-sm truncate">{notification.title}</p>
                        {!notification.isRead && (
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                        {notification.actionUrl && (
                          <Link
                            to={notification.actionUrl}
                            className="text-xs text-primary hover:underline flex-shrink-0"
                            onClick={closeDropdown}
                          >
                            {notification.actionText || 'View'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
