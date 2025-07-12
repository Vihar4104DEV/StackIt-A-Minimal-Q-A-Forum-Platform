
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Flag,
  CheckCircle,
  X,
  Eye,
  MessageSquare,
  AlertTriangle,
  Ban,
  Trash2,
  Edit,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Mock reported content data
const mockReports = [
  {
    id: '1',
    type: 'question',
    contentId: 'q123',
    title: 'How to hack into someone\'s account?',
    content: 'I need to get into my ex\'s social media account...',
    author: {
      id: 'u1',
      username: 'suspicious_user',
      avatar: '',
    },
    reporter: {
      id: 'u2',
      username: 'community_member',
      avatar: '',
    },
    reason: 'Inappropriate content',
    description: 'This question is asking for help with illegal activities',
    status: 'pending',
    priority: 'high',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'answer',
    contentId: 'a456',
    title: 'Answer to: Best JavaScript framework?',
    content: 'React is trash! Anyone who uses React is stupid and doesn\'t know real programming...',
    author: {
      id: 'u3',
      username: 'angry_dev',
      avatar: '',
    },
    reporter: {
      id: 'u4',
      username: 'helpful_user',
      avatar: '',
    },
    reason: 'Harassment',
    description: 'Toxic behavior and personal attacks against other developers',
    status: 'pending',
    priority: 'medium',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'question',
    contentId: 'q789',
    title: 'Free premium accounts available here!!!',
    content: 'Get free premium accounts for Netflix, Spotify, and more! Click this link: [suspicious-link.com]',
    author: {
      id: 'u5',
      username: 'spammer123',
      avatar: '',
    },
    reporter: {
      id: 'u6',
      username: 'vigilant_user',
      avatar: '',
    },
    reason: 'Spam',
    description: 'Clear spam content with suspicious links',
    status: 'approved',
    priority: 'high',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    reportedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

const ContentModeration = () => {
  const [reports, setReports] = useState(mockReports);
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [reportsRef, reportsInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const filteredReports = reports.filter((report) => {
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || report.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const handleApproveReport = (reportId: string, action: 'delete' | 'edit' | 'warn', reason: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: 'approved' } : report
    ));
    
    const actionText = action === 'delete' ? 'deleted' : action === 'edit' ? 'edited' : 'warned';
    toast.success(`Report approved and content ${actionText}`);
    setActionReason('');
    setSelectedReport(null);
  };

  const handleRejectReport = (reportId: string, reason: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, status: 'rejected' } : report
    ));
    
    toast.success('Report rejected');
    setActionReason('');
    setSelectedReport(null);
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="default">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getContentIcon = (type: string) => {
    return type === 'question' ? MessageSquare : CheckCircle;
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
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Content Moderation</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Review reported content and take appropriate moderation actions
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
        <Card className="p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                <h3 className="font-semibold text-base sm:text-lg">Total Reports</h3>
              </div>
              <Badge variant="secondary">{reports.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-muted-foreground text-xs sm:text-sm">All reported content</p>
          </CardContent>
        </Card>
        <Card className="p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
                <h3 className="font-semibold text-base sm:text-lg">Approved</h3>
              </div>
              <Badge variant="default">{reports.filter(r => r.status === 'approved').length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-muted-foreground text-xs sm:text-sm">Content deemed acceptable</p>
          </CardContent>
        </Card>
        <Card className="p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500" />
                <h3 className="font-semibold text-base sm:text-lg">Rejected</h3>
              </div>
              <Badge variant="outline">{reports.filter(r => r.status === 'rejected').length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-muted-foreground text-xs sm:text-sm">Content deemed unacceptable</p>
          </CardContent>
        </Card>
        <Card className="p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
                <h3 className="font-semibold text-base sm:text-lg">Pending</h3>
              </div>
              <Badge variant="secondary">{reports.filter(r => r.status === 'pending').length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-muted-foreground text-xs sm:text-sm">Content awaiting moderation</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports */}
      <motion.div
        ref={reportsRef}
        initial={{ opacity: 0, y: 30 }}
        animate={reportsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
      >
        {filteredReports.map((report) => {
          const ContentIcon = getContentIcon(report.type);
          
          return (
            <Card key={report.id} className="overflow-hidden">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <ContentIcon className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{report.title}</h3>
                        {getStatusBadge(report.status)}
                        {getPriorityBadge(report.priority)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Reported for: {report.reason}</span>
                        <span>
                          <Clock className="h-4 w-4 inline mr-1" />
                          {formatDistanceToNow(new Date(report.reportedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approve Report</DialogTitle>
                            <DialogDescription>
                              What action would you like to take on this content?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Action</Label>
                              <Select defaultValue="delete">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="delete">Delete Content</SelectItem>
                                  <SelectItem value="edit">Edit Content</SelectItem>
                                  <SelectItem value="warn">Warn Author</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="reason">Reason</Label>
                              <Textarea
                                id="reason"
                                placeholder="Explain the reason for this action..."
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={() => handleApproveReport(report.id, 'delete', actionReason)}
                              disabled={!actionReason.trim()}
                            >
                              Approve Report
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Report</DialogTitle>
                            <DialogDescription>
                              Why are you rejecting this report?
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="reject-reason">Rejection Reason</Label>
                              <Textarea
                                id="reject-reason"
                                placeholder="Explain why this report is being rejected..."
                                value={actionReason}
                                onChange={(e) => setActionReason(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => handleRejectReport(report.id, actionReason)}
                              disabled={!actionReason.trim()}
                            >
                              Reject Report
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Content Preview */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Reported Content:</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {report.content}
                  </p>
                </div>

                {/* Report Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm mb-1">Content Author</h5>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={report.author.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(report.author.username)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{report.author.username}</span>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1">Reported By</h5>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={report.reporter.avatar} />
                          <AvatarFallback className="text-xs">
                            {getInitials(report.reporter.username)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{report.reporter.username}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h5 className="font-medium text-sm mb-1">Report Description</h5>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1">Content Created</h5>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Content
                  </Button>
                  <Button variant="outline" size="sm">
                    <Flag className="h-4 w-4 mr-2" />
                    View All Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-muted-foreground">
                There are no reports matching your current filters.
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default ContentModeration;
