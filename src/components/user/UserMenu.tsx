
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore, User as UserType } from '@/store/authStore';

interface UserMenuProps {
  user: UserType;
}

const UserMenu = ({ user }: UserMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        className="flex items-center space-x-2 p-1 sm:p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback className="text-xs">
            {getInitials(user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium">{user.username}</span>
          <span className="text-xs text-muted-foreground">
            {user.reputation} reputation
          </span>
        </div>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-popover border rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="p-3 sm:p-4 border-b">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback className="text-xs sm:text-sm">{getInitials(user.username)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm sm:text-base truncate">{user.username}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 rounded">
                    {user.role}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.reputation} rep
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="py-1 sm:py-2">
            <Link
              to="/profile"
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            {user.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 text-sm hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Shield className="h-4 w-4" />
                <span>Admin Panel</span>
              </Link>
            )}

            <div className="border-t my-1 sm:my-2"></div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 w-full px-3 sm:px-4 py-2 text-sm hover:bg-muted transition-colors text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
