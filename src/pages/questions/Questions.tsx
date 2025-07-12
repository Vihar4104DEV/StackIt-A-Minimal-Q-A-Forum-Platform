import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Mock data for demonstration
const mockQuestions = [
  {
    id: '1',
    title: 'How to handle async/await in React useEffect?',
    content: 'I am trying to use async/await inside useEffect but getting warnings...',
    author: { name: 'John Doe', avatar: '', reputation: 1250 },
    tags: ['React', 'JavaScript', 'Async'],
    votes: 42,
    answers: 15,
    views: 2100,
    createdAt: '2024-01-15T10:30:00Z',
    isAnswered: true,
  },
  {
    id: '2',
    title: 'Best practices for state management in large React apps?',
    content: 'What are the recommended patterns for managing state in large applications?',
    author: { name: 'Jane Smith', avatar: '', reputation: 890 },
    tags: ['React', 'State Management', 'Architecture'],
    votes: 28,
    answers: 8,
    views: 1800,
    createdAt: '2024-01-14T14:20:00Z',
    isAnswered: false,
  },
  {
    id: '3',
    title: 'How to optimize React app performance?',
    content: 'My React app is getting slow with more components. What can I do?',
    author: { name: 'Mike Johnson', avatar: '', reputation: 2100 },
    tags: ['React', 'Performance', 'Optimization'],
    votes: 35,
    answers: 12,
    views: 3200,
    createdAt: '2024-01-13T09:15:00Z',
    isAnswered: true,
  },
];

const Questions = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');

  const [listRef, listInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const filteredQuestions = mockQuestions.filter(question =>
    question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">All Questions</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            {filteredQuestions.length} questions
          </p>
        </div>
        
        {isAuthenticated && (
          <Button asChild size="sm" className="w-full sm:w-auto">
            <Link to="/ask">
              <Plus className="mr-2 h-4 w-4" />
              Ask Question
            </Link>
          </Button>
        )}
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8"
      >
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search questions, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="votes">Most Votes</SelectItem>
            <SelectItem value="answers">Most Answers</SelectItem>
            <SelectItem value="views">Most Views</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Questions</SelectItem>
            <SelectItem value="answered">Answered</SelectItem>
            <SelectItem value="unanswered">Unanswered</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Questions List */}
      <section ref={listRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={listInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
          className="space-y-3 sm:space-y-4"
        >
          {filteredQuestions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8 sm:py-12">
                <MessageSquare className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No questions found</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to ask a question!'}
                </p>
                {isAuthenticated && (
                  <Button asChild size="sm">
                    <Link to="/ask">Ask the First Question</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question) => (
              <motion.div
                key={question.id}
                className="hover:shadow-md transition-shadow"
                whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Stats */}
                      <div className="flex sm:flex-col items-center justify-center sm:justify-start text-center space-x-4 sm:space-x-0 sm:space-y-2 min-w-20">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-foreground">{question.votes}</span>
                          <span className="text-xs text-muted-foreground">votes</span>
                        </div>
                        <div className={`flex flex-col items-center ${question.isAnswered ? 'text-green-600' : ''}`}>
                          <span className="text-sm font-medium">{question.answers}</span>
                          <span className="text-xs text-muted-foreground">answers</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-foreground">{question.views}</span>
                          <span className="text-xs text-muted-foreground">views</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                          <Link
                            to={`/questions/${question.id}`}
                            className="text-base sm:text-lg font-semibold text-foreground hover:text-primary transition-colors leading-tight"
                          >
                            {question.title}
                            {question.isAnswered && (
                              <CheckCircle className="inline ml-2 h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            )}
                          </Link>
                        </div>
                        
                        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                          {question.content}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                          {question.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Author and Date */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-2 sm:gap-0">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              asked by <span className="font-medium text-foreground">{question.author.name}</span>
                            </span>
                            <span className="text-primary">({question.author.reputation})</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {formatTimeAgo(question.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default Questions;
