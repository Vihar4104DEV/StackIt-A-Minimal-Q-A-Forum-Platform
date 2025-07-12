
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import {
  User,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Edit,
  Save,
  X,
  Trophy,
  MessageSquare,
  CheckCircle,
  TrendingUp,
  Award,
  Star,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: 'Full-stack developer passionate about React and Node.js',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
  });

  // Animation hooks for each section
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [badgesRef, badgesInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [activityRef, activityInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  // Mock user stats and activity
  const stats = {
    questionsAsked: 23,
    answersGiven: 47,
    reputation: user?.reputation || 0,
    badges: 8,
    acceptedAnswers: 31,
    totalVotes: 156,
  };

  const badges = [
    { name: 'Good Question', description: 'Question score of 25 or more', count: 3, color: 'bg-yellow-500' },
    { name: 'Good Answer', description: 'Answer score of 25 or more', count: 5, color: 'bg-green-500' },
    { name: 'Popular Question', description: 'Question with 1,000 or more views', count: 2, color: 'bg-blue-500' },
    { name: 'Helpful', description: '50 helpful flags', count: 1, color: 'bg-purple-500' },
  ];

  const recentActivity = [
    {
      type: 'question',
      title: 'How to optimize React performance with useMemo?',
      votes: 12,
      answers: 3,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      type: 'answer',
      title: 'Best practices for error handling in Express.js',
      votes: 8,
      accepted: true,
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      type: 'question',
      title: 'Understanding TypeScript generic constraints',
      votes: 15,
      answers: 5,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const handleSave = () => {
    updateUser({
      username: formData.username,
      email: formData.email,
    });
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: 'Full-stack developer passionate about React and Node.js',
      location: 'San Francisco, CA',
      website: 'https://johndoe.dev',
    });
    setIsEditing(false);
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-6 sm:mb-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="text-center p-4 sm:p-6">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 mx-auto mb-3 sm:mb-4">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback className="text-lg sm:text-xl lg:text-2xl">
                    {getInitials(user.username)}
                  </AvatarFallback>
                </Avatar>
                
                {isEditing ? (
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-sm sm:text-base">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="text-sm sm:text-base"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-xl sm:text-2xl">{user.username}</CardTitle>
                    <CardDescription className="text-sm sm:text-base">{user.email}</CardDescription>
                  </>
                )}
              </CardHeader>
              
              <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                {isEditing ? (
                  <>
                    <div>
                      <Label htmlFor="bio" className="text-sm sm:text-base">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={3}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-sm sm:text-base">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website" className="text-sm sm:text-base">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="text-sm sm:text-base"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button onClick={handleSave} size="sm" className="w-full sm:w-auto">
                        <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Save
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm" className="w-full sm:w-auto">
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs sm:text-sm text-muted-foreground">{formData.bio}</p>
                    
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span>{formData.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <a href={formData.website} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                          {formData.website}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="w-fit">
                        {user.role}
                      </Badge>
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="w-full sm:w-auto">
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold text-primary">{stats.reputation}</div>
                    <div className="text-xs text-muted-foreground">Reputation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold">{stats.badges}</div>
                    <div className="text-xs text-muted-foreground">Badges</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold">{stats.questionsAsked}</div>
                    <div className="text-xs text-muted-foreground">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl font-bold">{stats.answersGiven}</div>
                    <div className="text-xs text-muted-foreground">Answers</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Badges Section */}
            <motion.div
              ref={badgesRef}
              initial={{ opacity: 0, y: 30 }}
              animate={badgesInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>Achievements earned through participation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {badges.map((badge, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className={`w-12 h-12 rounded-full ${badge.color} flex items-center justify-center`}>
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{badge.name}</h4>
                            <Badge variant="secondary">{badge.count}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              ref={activityRef}
              initial={{ opacity: 0, y: 30 }}
              animate={activityInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest questions and answers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivity.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {item.type === 'question' ? (
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium mb-1">{item.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {item.votes} votes
                          </span>
                          {item.type === 'question' && (
                            <span>{item.answers} answers</span>
                          )}
                          {item.accepted && (
                            <Badge variant="default" className="text-xs">
                              Accepted
                            </Badge>
                          )}
                          <span>
                            {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
