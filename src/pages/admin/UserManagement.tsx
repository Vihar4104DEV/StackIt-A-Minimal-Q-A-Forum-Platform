
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Filter,
  MoreVertical,
  Shield,
  ShieldOff,
  Ban,
  UserCheck,
  Mail,
  Calendar,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Mock users data
const mockUsers = [
  {
    id: '1',
    username: 'johndev',
    email: 'john@example.com',
    role: 'user',
    reputation: 245,
    questionsAsked: 15,
    answersGiven: 32,
    isVerified: true,
    isBanned: false,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    avatar: '',
    reportCount: 0,
  },
  {
    id: '2',
    username: 'sarahcoder',
    email: 'sarah@example.com',
    role: 'user',
    reputation: 892,
    questionsAsked: 28,
    answersGiven: 67,
    isVerified: true,
    isBanned: false,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    avatar: '',
    reportCount: 0,
  },
  {
    id: '3',
    username: 'spammer123',
    email: 'spam@example.com',
    role: 'user',
    reputation: 1,
    questionsAsked: 0,
    answersGiven: 5,
    isVerified: false,
    isBanned: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    avatar: '',
    reportCount: 12,
  },
  {
    id: '4',
    username: 'moderator1',
    email: 'mod@stackit.com',
    role: 'admin',
    reputation: 1543,
    questionsAsked: 45,
    answersGiven: 123,
    isVerified: true,
    isBanned: false,
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    lastActive: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    avatar: '',
    reportCount: 0,
  },
];

const UserManagement = () => {
  const [users, setUsers] = useState(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [banReason, setBanReason] = useState('');
  const [tableRef, tableInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'banned' && user.isBanned) ||
      (statusFilter === 'active' && !user.isBanned) ||
      (statusFilter === 'verified' && user.isVerified) ||
      (statusFilter === 'reported' && user.reportCount > 0);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleBanUser = (userId: string, reason: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isBanned: true } : user
    ));
    toast.success('User has been banned');
    setBanReason('');
    setSelectedUser(null);
  };

  const handleUnbanUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isBanned: false } : user
    ));
    toast.success('User has been unbanned');
  };

  const handlePromoteUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: 'admin' } : user
    ));
    toast.success('User has been promoted to admin');
  };

  const handleDemoteUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: 'user' } : user
    ));
    toast.success('User has been demoted to regular user');
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getUserStatusBadge = (user: typeof mockUsers[0]) => {
    if (user.isBanned) {
      return <Badge variant="destructive">Banned</Badge>;
    }
    if (user.reportCount > 5) {
      return <Badge variant="secondary">Reported</Badge>;
    }
    if (user.isVerified) {
      return <Badge variant="default">Verified</Badge>;
    }
    return <Badge variant="outline">Active</Badge>;
  };

  const getLastActiveColor = (lastActive: string) => {
    const diffInHours = (Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) return 'text-green-500';
    if (diffInHours < 24) return 'text-yellow-500';
    return 'text-muted-foreground';
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">User Management</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage users, monitor activity, and handle moderation actions
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        ref={statsRef}
        initial={{ opacity: 0, y: 30 }}
        animate={statsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
      >
        <Card className="p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold">Total Users</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              All registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl sm:text-3xl font-bold">{users.length}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              View all users in the platform
            </p>
          </CardContent>
        </Card>
        <Card className="p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold">Active Users</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Users currently online
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl sm:text-3xl font-bold">{users.filter(user => !user.isBanned).length}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Monitor user activity
            </p>
          </CardContent>
        </Card>
        <Card className="p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold">Banned Users</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Users currently banned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl sm:text-3xl font-bold">{users.filter(user => user.isBanned).length}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Manage banned accounts
            </p>
          </CardContent>
        </Card>
        <Card className="p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg font-semibold">Reported Users</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Users with recent reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-2xl sm:text-3xl font-bold">{users.filter(user => user.reportCount > 0).length}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Handle user reports
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search users by username or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <motion.div
        ref={tableRef}
        initial={{ opacity: 0, y: 30 }}
        animate={tableInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              Showing all users matching your filters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.username}</h3>
                        {getUserStatusBadge(user)}
                        {user.role === 'admin' && (
                          <Badge variant="outline">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {user.reputation} rep
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {user.questionsAsked} questions
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {user.answersGiven} answers
                        </span>
                        {user.reportCount > 0 && (
                          <span className="flex items-center gap-1 text-red-500">
                            <AlertTriangle className="h-3 w-3" />
                            {user.reportCount} reports
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-muted-foreground">Joined</p>
                      <p>{formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</p>
                      <p className={`text-xs ${getLastActiveColor(user.lastActive)}`}>
                        Active {formatDistanceToNow(new Date(user.lastActive), { addSuffix: true })}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {user.isBanned ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnbanUser(user.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Unban
                        </Button>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Ban
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Ban User</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to ban {user.username}? This action will prevent them from accessing the platform.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="reason">Reason for ban</Label>
                                <Textarea
                                  id="reason"
                                  placeholder="Enter the reason for banning this user..."
                                  value={banReason}
                                  onChange={(e) => setBanReason(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="destructive"
                                onClick={() => handleBanUser(user.id, banReason)}
                                disabled={!banReason.trim()}
                              >
                                Ban User
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}

                      {user.role === 'admin' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDemoteUser(user.id)}
                        >
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Demote
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePromoteUser(user.id)}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Promote
                        </Button>
                      )}

                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found matching your filters.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default UserManagement;
