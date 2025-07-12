
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import NotificationsDropdown from '@/components/notifications/NotificationsDropdown';
import UserMenu from '@/components/user/UserMenu';
import { Search, PlusCircle, Home, HelpCircle, User, BarChart3, Shield, Bell, LogOut, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Menu } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const isMobile = useIsMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/questions?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setDrawerOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              S
            </div>
            <span className="text-xl font-bold">StackIt</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/questions"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/questions') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Questions</span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Desktop Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => navigate('/ask')}
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Ask Question
                </Button>
                <NotificationsDropdown />
                <UserMenu user={user!} />
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Hamburger for Mobile */}
          <div className="md:hidden flex items-center">
            <button
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent>
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="p-6 space-y-6"
              >
                {/* User Profile Section (if logged in) */}
                {isAuthenticated && user && (
                  <div className="border-b pb-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} alt={user.username} />
                        <AvatarFallback className="text-sm">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base truncate">{user.username}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                            {user.role}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.reputation} reputation
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Main Navigation */}
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/"
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Home className="h-5 w-5" />
                    <span>Home</span>
                  </Link>
                  <Link
                    to="/questions"
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive('/questions') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    <HelpCircle className="h-5 w-5" />
                    <span>Questions</span>
                  </Link>
                </div>

                {/* User-Specific Navigation (if logged in) */}
                {isAuthenticated && (
                  <div className="flex flex-col space-y-2">
                    <Link
                      to="/profile"
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive('/profile') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setDrawerOpen(false)}
                    >
                      <BarChart3 className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                          isActive('/admin') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setDrawerOpen(false)}
                      >
                        <Shield className="h-5 w-5" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                  </div>
                )}

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="w-full">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </form>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3">
                  {isAuthenticated ? (
                    <>
                      <Button
                        onClick={() => {
                          setDrawerOpen(false);
                          navigate('/ask');
                        }}
                        className="w-full"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Ask Question
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setDrawerOpen(false);
                          navigate('/notifications');
                        }}
                        className="w-full justify-start"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notifications
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setDrawerOpen(false);
                          navigate('/settings');
                        }}
                        className="w-full justify-start"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Button>
                      <div className="border-t pt-3">
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full justify-start text-destructive hover:text-destructive"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Sign Out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" onClick={() => { setDrawerOpen(false); navigate('/login'); }} className="w-full">
                        Sign In
                      </Button>
                      <Button onClick={() => { setDrawerOpen(false); navigate('/register'); }} className="w-full">
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            </DrawerContent>
          </Drawer>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
