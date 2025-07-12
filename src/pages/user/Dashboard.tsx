
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import {
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Eye,
  Trophy,
  Star,
  Calendar,
  Target,
  Activity,
  Award,
  BookOpen,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Dashboard = () => {
  const { user } = useAuthStore();

  // Animation hooks for each section
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [achievementsRef, achievementsInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [questionsRef, questionsInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const stats = {
    questionsAsked: 23,
    answersGiven: 47,
    acceptedAnswers: 31,
    totalVotes: 156,
    reputation: user?.reputation || 0,
    views: 2451,
    badges: 8,
    streak: 7,
  };

  const recentQuestions = [
    {
      id: '1',
      title: 'How to optimize React performance with useMemo?',
      votes: 12,
      answers: 3,
      views: 234,
      status: 'answered',
    },
    {
      id: '2',
      title: 'Understanding TypeScript generic constraints',
      votes: 15,
      answers: 5,
      views: 456,
      status: 'answered',
    },
    {
      id: '3',
      title: 'Best practices for error handling in Node.js',
      votes: 8,
      answers: 0,
      views: 67,
      status: 'open',
    },
  ];

  const achievements = [
    {
      title: 'Question Streak',
      description: '7 days of active participation',
      progress: 70,
      icon: Target,
      color: 'text-blue-500',
    },
    {
      title: 'Helpful Answers',
      description: '5 more to reach next level',
      progress: 85,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      title: 'Community Impact',
      description: 'Help 10 more users',
      progress: 60,
      icon: Users,
      color: 'text-purple-500',
    },
  ];

  const upcomingGoals = [
    { title: 'Reach 500 reputation', current: stats.reputation, target: 500 },
    { title: 'Get 50 accepted answers', current: stats.acceptedAnswers, target: 50 },
    { title: 'Earn 10 badges', current: stats.badges, target: 10 },
  ];

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.username}!</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Here's your activity overview and progress on StackIt
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
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold">{stats.questionsAsked}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Questions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold">{stats.answersGiven}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Answers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold">{stats.reputation}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Reputation</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              <div className="ml-3 sm:ml-4">
                <p className="text-lg sm:text-2xl font-bold">{stats.views}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Profile Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Achievements */}
        <motion.div
          ref={achievementsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={achievementsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                Achievement Progress
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">Your progress towards next achievements</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <achievement.icon className={`h-3 w-3 sm:h-4 sm:w-4 ${achievement.color}`} />
                      <span className="font-medium text-xs sm:text-sm">{achievement.title}</span>
                    </div>
                    <span className="text-xs sm:text-sm text-muted-foreground">{achievement.progress}%</span>
                  </div>
                  <Progress value={achievement.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Questions */}
        <motion.div
          ref={questionsRef}
          initial={{ opacity: 0, y: 30 }}
          animate={questionsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div>
                  <CardTitle className="text-base sm:text-lg">Your Recent Questions</CardTitle>
                  <CardDescription className="text-sm sm:text-base">Track your latest questions and their progress</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                  <Link to="/ask">Ask Question</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {recentQuestions.map((question) => (
                  <div key={question.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-0">
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/questions/${question.id}`}
                        className="font-medium text-sm sm:text-base hover:text-primary transition-colors line-clamp-2"
                      >
                        {question.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                          {question.votes} votes
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                          {question.answers} answers
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          {question.views} views
                        </span>
                      </div>
                    </div>
                    <Badge variant={question.status === 'answered' ? 'default' : 'secondary'} className="w-fit">
                      {question.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
