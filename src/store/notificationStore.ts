
import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'question_answered' | 'answer_commented' | 'mention' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  toggleDropdown: () => void;
  closeDropdown: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: '1',
      type: 'question_answered',
      title: 'New Answer',
      message: 'Someone answered your question about React hooks',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/questions/1',
      actionText: 'View Answer'
    },
    {
      id: '2',
      type: 'mention',
      title: 'You were mentioned',
      message: '@john_doe mentioned you in a comment',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      actionUrl: '/questions/2',
      actionText: 'View Comment'
    },
    {
      id: '3',
      type: 'system',
      title: 'Platform Update',
      message: 'StackIt will undergo maintenance tonight at 2 AM UTC',
      isRead: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ],
  unreadCount: 2,
  isOpen: false,
  
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
    
    console.log('New notification added:', newNotification);
  },
  
  markAsRead: (id) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      );
      
      const unreadCount = updatedNotifications.filter((notif) => !notif.isRead).length;
      
      return {
        notifications: updatedNotifications,
        unreadCount,
      };
    });
    
    console.log('Notification marked as read:', id);
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notif) => ({ ...notif, isRead: true })),
      unreadCount: 0,
    }));
    
    console.log('All notifications marked as read');
  },
  
  toggleDropdown: () => {
    set((state) => ({ isOpen: !state.isOpen }));
  },
  
  closeDropdown: () => {
    set({ isOpen: false });
  },
}));
