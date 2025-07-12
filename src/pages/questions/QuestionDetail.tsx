
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { useAuthStore } from '@/store/authStore';
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share,
  Bookmark,
  Flag,
  CheckCircle,
  Clock,
  Eye,
  ArrowLeft,
  Edit,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

// Mock question data
const mockQuestion = {
  id: '1',
  title: 'How to handle async/await in React useEffect hook?',
  content: `<p>I am trying to use async/await inside useEffect but getting warnings about cleanup functions. Here's what I'm doing:</p>

<pre><code>useEffect(async () => {
  const result = await fetchData();
  setData(result);
}, []);</code></pre>

<p>But React gives me a warning saying that useEffect should not return anything other than a cleanup function. What's the proper way to handle async operations in useEffect?</p>

<p>I've tried a few approaches but I'm not sure which one is considered best practice. Any help would be appreciated!</p>`,
  tags: ['React', 'JavaScript', 'Async'],
  author: {
    id: '1',
    username: 'johndev',
    avatar: '',
    reputation: 245,
  },
  votes: 15,
  userVote: 0, // -1, 0, 1
  views: 156,
  bookmarked: false,
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  answers: [
    {
      id: '1',
      content: `<p>The issue is that async functions return a Promise, but useEffect expects either nothing or a cleanup function to be returned.</p>

<p>Here are the correct ways to handle async operations in useEffect:</p>

<h3>Method 1: Define async function inside useEffect</h3>
<pre><code>useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await fetch('/api/data');
      const data = await result.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  fetchData();
}, []);</code></pre>

<h3>Method 2: Use IIFE (Immediately Invoked Function Expression)</h3>
<pre><code>useEffect(() => {
  (async () => {
    try {
      const result = await fetch('/api/data');
      const data = await result.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  })();
}, []);</code></pre>

<p>Both methods are valid, but I prefer Method 1 as it's more readable and easier to add cleanup logic if needed.</p>`,
      author: {
        id: '2',
        username: 'reactexpert',
        avatar: '',
        reputation: 1250,
      },
      votes: 12,
      userVote: 0,
      isAccepted: true,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      content: `<p>Another approach is to use a custom hook for data fetching:</p>

<pre><code>const useAsyncData = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchFunction();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, dependencies);

  return { data, loading, error };
};</code></pre>

<p>This pattern handles cleanup properly and prevents state updates on unmounted components.</p>`,
      author: {
        id: '3',
        username: 'hookmaster',
        avatar: '',
        reputation: 890,
      },
      votes: 8,
      userVote: 0,
      isAccepted: false,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
};

const QuestionDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [question, setQuestion] = useState(mockQuestion);
  const [newAnswer, setNewAnswer] = useState('');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [questionRef, questionInView] = useInView({ triggerOnce: true, threshold: 0.15 });
  const [answersRef, answersInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  const handleVote = (type: 'up' | 'down', targetType: 'question' | 'answer', targetId?: string) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to vote');
      return;
    }

    const voteValue = type === 'up' ? 1 : -1;
    
    if (targetType === 'question') {
      const currentVote = question.userVote;
      const newVote = currentVote === voteValue ? 0 : voteValue;
      const voteDiff = newVote - currentVote;
      
      setQuestion(prev => ({
        ...prev,
        votes: prev.votes + voteDiff,
        userVote: newVote,
      }));
      
      toast.success(newVote === 0 ? 'Vote removed' : `Question ${type}voted`);
    } else if (targetId) {
      setQuestion(prev => ({
        ...prev,
        answers: prev.answers.map(answer => {
          if (answer.id === targetId) {
            const currentVote = answer.userVote;
            const newVote = currentVote === voteValue ? 0 : voteValue;
            const voteDiff = newVote - currentVote;
            
            return {
              ...answer,
              votes: answer.votes + voteDiff,
              userVote: newVote,
            };
          }
          return answer;
        }),
      }));
      
      toast.success(`Answer ${type}voted`);
    }
  };

  const handleAcceptAnswer = (answerId: string) => {
    if (!isAuthenticated || user?.id !== question.author.id) {
      toast.error('Only the question author can accept answers');
      return;
    }

    setQuestion(prev => ({
      ...prev,
      answers: prev.answers.map(answer => ({
        ...answer,
        isAccepted: answer.id === answerId ? !answer.isAccepted : false,
      })),
    }));

    toast.success('Answer marked as accepted');
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to bookmark questions');
      return;
    }

    setQuestion(prev => ({
      ...prev,
      bookmarked: !prev.bookmarked,
    }));

    toast.success(question.bookmarked ? 'Bookmark removed' : 'Question bookmarked');
  };

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim()) {
      toast.error('Please write your answer');
      return;
    }

    setIsSubmittingAnswer(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newAnswerObj = {
        id: Date.now().toString(),
        content: newAnswer,
        author: {
          id: user!.id,
          username: user!.username,
          avatar: user!.avatar || '',
          reputation: user!.reputation,
        },
        votes: 0,
        userVote: 0,
        isAccepted: false,
        createdAt: new Date().toISOString(),
      };

      setQuestion(prev => ({
        ...prev,
        answers: [...prev.answers, newAnswerObj],
      }));

      setNewAnswer('');
      toast.success('Your answer has been posted!');
    } catch (error) {
      toast.error('Failed to post answer. Please try again.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
      {/* Back Navigation */}
      <div className="mb-4 sm:mb-6">
        <Button variant="ghost" asChild size="sm" className="text-sm">
          <Link to="/questions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questions
          </Link>
        </Button>
      </div>

      {/* Question */}
      <motion.div
        ref={questionRef}
        initial={{ opacity: 0, y: 30 }}
        animate={questionInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            {/* Question Header */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight">{question.title}</h1>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {question.views} views
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Vote Controls */}
              <div className="flex sm:flex-col items-center justify-center sm:justify-start space-x-4 sm:space-x-0 sm:space-y-2">
                <Button
                  variant={question.userVote === 1 ? "default" : "ghost"}
                  size="sm"
                  className="vote-button h-8 w-8 sm:h-10 sm:w-10 p-0"
                  onClick={() => handleVote('up', 'question')}
                  disabled={!isAuthenticated}
                >
                  <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                
                <span className={`text-base sm:text-lg font-bold ${
                  question.userVote === 1 ? 'text-vote-up' : 
                  question.userVote === -1 ? 'text-vote-down' : ''
                }`}>
                  {question.votes}
                </span>
                
                <Button
                  variant={question.userVote === -1 ? "destructive" : "ghost"}
                  size="sm"
                  className="vote-button h-8 w-8 sm:h-10 sm:w-10 p-0"
                  onClick={() => handleVote('down', 'question')}
                  disabled={!isAuthenticated}
                >
                  <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                  onClick={handleBookmark}
                  disabled={!isAuthenticated}
                >
                  <Bookmark className={`h-4 w-4 sm:h-5 sm:w-5 ${question.bookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                <div
                  className="prose prose-sm sm:prose prose-slate max-w-none mb-4 sm:mb-6 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: question.content }}
                />

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                  {question.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Question Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                      <Share className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                      <Flag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Flag
                    </Button>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      <AvatarImage src={question.author.avatar} />
                      <AvatarFallback className="text-xs sm:text-sm">
                        {getInitials(question.author.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-xs sm:text-sm">
                      <div className="font-medium">{question.author.username}</div>
                      <div className="text-muted-foreground">
                        {question.author.reputation} reputation
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Answers Header */}
      <motion.div
        ref={answersRef}
        initial={{ opacity: 0, y: 30 }}
        animate={answersInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
      >
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">
            {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {/* Answers */}
        <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
          {question.answers.map((answer) => (
            <Card key={answer.id} className={answer.isAccepted ? 'border-green-500 bg-green-50/50' : ''}>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Answer Vote Controls */}
                  <div className="flex sm:flex-col items-center justify-center sm:justify-start space-x-4 sm:space-x-0 sm:space-y-2">
                    <Button
                      variant={answer.userVote === 1 ? "default" : "ghost"}
                      size="sm"
                      className="vote-button h-8 w-8 sm:h-10 sm:w-10 p-0"
                      onClick={() => handleVote('up', 'answer', answer.id)}
                      disabled={!isAuthenticated}
                    >
                      <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                    
                    <span className={`text-base sm:text-lg font-bold ${
                      answer.userVote === 1 ? 'text-vote-up' : 
                      answer.userVote === -1 ? 'text-vote-down' : ''
                    }`}>
                      {answer.votes}
                    </span>
                    
                    <Button
                      variant={answer.userVote === -1 ? "destructive" : "ghost"}
                      size="sm"
                      className="vote-button h-8 w-8 sm:h-10 sm:w-10 p-0"
                      onClick={() => handleVote('down', 'answer', answer.id)}
                      disabled={!isAuthenticated}
                    >
                      <ArrowDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>

                    {/* Accept Answer Button */}
                    {isAuthenticated && user?.id === question.author.id && (
                      <Button
                        variant={answer.isAccepted ? "default" : "ghost"}
                        size="sm"
                        className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                        onClick={() => handleAcceptAnswer(answer.id)}
                      >
                        <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${answer.isAccepted ? 'text-white' : 'text-green-600'}`} />
                      </Button>
                    )}
                  </div>

                  {/* Answer Content */}
                  <div className="flex-1 min-w-0">
                    {answer.isAccepted && (
                      <div className="flex items-center gap-2 mb-3 sm:mb-4 text-green-600">
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="font-medium text-sm sm:text-base">Accepted Answer</span>
                      </div>
                    )}

                    <div
                      className="prose prose-sm sm:prose prose-slate max-w-none mb-4 sm:mb-6 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: answer.content }}
                    />

                    {/* Answer Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                      <div className="flex items-center space-x-2 sm:space-x-4">
                        <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                          <Share className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Share
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                          <Flag className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Flag
                        </Button>
                      </div>

                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                        </span>
                        <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                          <AvatarImage src={answer.author.avatar} />
                          <AvatarFallback className="text-xs sm:text-sm">
                            {getInitials(answer.author.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-xs sm:text-sm">
                          <div className="font-medium">{answer.author.username}</div>
                          <div className="text-muted-foreground">
                            {answer.author.reputation} reputation
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Add Answer Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={answersInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
      >
        {isAuthenticated ? (
          <Card>
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Your Answer</h3>
              
              <div className="space-y-4">
                <RichTextEditor
                  content={newAnswer}
                  onChange={setNewAnswer}
                  placeholder="Write your answer here..."
                  className="min-h-32 sm:min-h-48"
                />
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <Button 
                    onClick={handleSubmitAnswer}
                    disabled={isSubmittingAnswer || !newAnswer.trim()}
                    className="w-full sm:w-auto"
                  >
                    {isSubmittingAnswer ? 'Posting...' : 'Post Your Answer'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setNewAnswer('')}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4 sm:p-6 lg:p-8 text-center">
              <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">Want to answer this question?</h3>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">
                Sign in to share your knowledge and help the community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

export default QuestionDetail;
