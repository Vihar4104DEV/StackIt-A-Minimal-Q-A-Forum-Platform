
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  MessageSquare,
  Flag,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Download,
  Bell,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AdminDashboard = () => {
  // Animation hooks for each section
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [activityRef, activityInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [actionsRef, actionsInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const stats = {
    totalUsers: 3247,
    activeUsers: 892,
    totalQuestions: 12456,
    pendingReports: 23,
    totalAnswers: 28103,
    acceptedAnswers: 15672,
    flaggedContent: 45,
    bannedUsers: 12,
  };

  const recentActivity = [
    {
      type: 'report',
      message: 'New spam report on question #1234',
      timestamp: '2 minutes ago',
      severity: 'high',
    },
    {
      type: 'user',
      message: 'New user registration: john_doe',
      timestamp: '5 minutes ago',
      severity: 'low',
    },
    {
      type: 'content',
      message: 'Question flagged for inappropriate content',
      timestamp: '12 minutes ago',
      severity: 'medium',
    },
    {
      type: 'system',
      message: 'Daily backup completed successfully',
      timestamp: '1 hour ago',
      severity: 'low',
    },
  ];

  const pendingActions = [
    {
      id: '1',
      type: 'User Report',
      description: 'Multiple spam reports against user @spammer123',
      priority: 'high',
      count: 5,
    },
    {
      id: '2',
      type: 'Content Review',
      description: 'Question contains potentially harmful code',
      priority: 'medium',
      count: 1,
    },
    {
      id: '3',
      type: 'Account Appeal',
      description: 'Banned user requesting account restoration',
      priority: 'low',
      count: 2,
    },
  ];

  const systemHealth = {
    serverUptime: 99.8,
    responseTime: 120,
    errorRate: 0.2,
    activeConnections: 1543,
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      default:
        return 'text-green-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      default:
        return <Badge variant="secondary">Low</Badge>;
    }
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Monitor platform health, manage users, and moderate content
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        ref={statsRef}
        initial={{ opacity: 0, y: 30 }}
        animate={statsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
      >
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold">{stats.totalQuestions.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Flag className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold">{stats.pendingReports}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Pending Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold">{stats.activeUsers}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Recent Activity */}
        <motion.div
          ref={activityRef}
          initial={{ opacity: 0, y: 30 }}
          animate={activityInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="lg:col-span-2 space-y-6 sm:space-y-8"
        >
          {/* System Health */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                System Health
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Real-time platform performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium">Server Uptime</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{systemHealth.serverUptime}%</span>
                    </div>
                    <Progress value={systemHealth.serverUptime} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium">Response Time</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{systemHealth.responseTime}ms</span>
                    </div>
                    <Progress value={Math.min((200 - systemHealth.responseTime) / 200 * 100, 100)} className="h-2" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium">Error Rate</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{systemHealth.errorRate}%</span>
                    </div>
                    <Progress value={Math.max(100 - systemHealth.errorRate * 10, 0)} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs sm:text-sm font-medium">Active Connections</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">{systemHealth.activeConnections}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Latest platform events and notifications</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getSeverityColor(activity.severity)}`} />
                    <div className="flex-1">
                      <p className="font-medium text-xs sm:text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                Pending Actions
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Items requiring admin attention</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {pendingActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{action.type}</span>
                        {getPriorityBadge(action.priority)}
                        {action.count > 1 && (
                          <Badge variant="outline">{action.count} items</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <Button size="sm" variant="outline">
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="lg:col-span-1"
        >
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" asChild>
                <Link to="/admin/moderation">
                  <Flag className="h-4 w-4 mr-2" />
                  Content Moderation
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link to="/admin/users">
                  <Users className="h-4 w-4 mr-2" />
                  User Management
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Send Announcement
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
              <CardDescription>Key performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Answer Rate</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((stats.acceptedAnswers / stats.totalAnswers) * 100)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User Retention</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((stats.activeUsers / stats.totalUsers) * 100)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Content Flagged</span>
                <span className="text-sm text-muted-foreground">
                  {((stats.flaggedContent / stats.totalQuestions) * 100).toFixed(2)}%
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Banned Users</span>
                <span className="text-sm text-muted-foreground">
                  {((stats.bannedUsers / stats.totalUsers) * 100).toFixed(2)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Healthy</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">API Services</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Online</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Search Index</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-500">Synced</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">File Storage</span>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-500">85% Full</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
