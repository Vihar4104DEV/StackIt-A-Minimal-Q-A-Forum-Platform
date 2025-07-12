import { useState, useEffect } from 'react';
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
  User,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { questionsApi, Question, QuestionFilters, QuestionsResponse } from '@/lib/api/questionsApi';
import { toast } from 'sonner';

const Questions = () => {
  const { isAuthenticated } = useAuthStore();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [filters, setFilters] = useState<QuestionFilters>({});
  const [pagination, setPagination] = useState<{
    count: number;
    next: string | null;
    previous: string | null;
  }>({ count: 0, next: null, previous: null });

  const [listRef, listInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  // Fetch questions from API
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      console.log('Fetching questions with filters:', filters);
      const response = await questionsApi.getQuestions(filters);
      console.log('API Response:', response);
      
      // Handle the paginated response structure
      if (response && response.results) {
        console.log('Setting questions:', response.results);
        setQuestions(response.results || []);
        setPagination({
          count: response.count || 0,
          next: response.next,
          previous: response.previous
        });
      } else {
        console.log('No results in response, setting empty questions');
        setQuestions([]);
        setPagination({ count: 0, next: null, previous: null });
      }
    } catch (error: any) {
      console.error('Failed to fetch questions:', error);
      toast.error('Failed to load questions. Please try again.');
      setQuestions([]);
      setPagination({ count: 0, next: null, previous: null });
    } finally {
      setLoading(false);
    }
  };

  // Update filters when search, sort, or filter changes
  useEffect(() => {
    const newFilters: QuestionFilters = {};
    
    // Add search filter
    if (searchQuery.trim()) {
      newFilters.search = searchQuery.trim();
    }
    
    // Add sort filter
    switch (sortBy) {
      case 'newest':
        newFilters.ordering = '-created_at';
        break;
      case 'votes':
        newFilters.ordering = '-votes';
        break;
      case 'answers':
        newFilters.ordering = '-answers_count';
        break;
      case 'views':
        newFilters.ordering = '-views';
        break;
    }
    
    // Add filter by answered status
    switch (filterBy) {
      case 'answered':
        newFilters.answered = true;
        break;
      case 'unanswered':
        newFilters.answered = false;
        break;
    }
    
    setFilters(newFilters);
  }, [searchQuery, sortBy, filterBy]);

  // Fetch questions when filters change
  useEffect(() => {
    fetchQuestions();
  }, [filters]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    question.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        </div>
      </div>
    );
  }

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
            {pagination.count} questions
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
                        <div className={`flex flex-col items-center ${question.is_answered ? 'text-green-600' : ''}`}>
                          <span className="text-sm font-medium">{question.answers_count}</span>
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
                            {question.is_answered && (
                              <CheckCircle className="inline ml-2 h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                            )}
                          </Link>
                        </div>
                        
                        <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">
                          {question.short_title || question.title}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                          {question.tags.map((tag) => (
                            <Badge key={tag.id} variant="secondary" className="text-xs">
                              {tag.name}
                            </Badge>
                          ))}
                        </div>

                        {/* Author and Date */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              asked by <span className="font-medium text-foreground">{question.author.username}</span>
                            </span>
                            {question.author.reputation && (
                              <span className="text-primary">({question.author.reputation})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                            {formatTimeAgo(question.created_at)}
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
