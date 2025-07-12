
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/authStore';
import { 
  ArrowLeft, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle,
  User,
  Clock,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { questionsApi, Question } from '@/lib/api/questionsApi';
import { answersApi, Answer, CreateAnswerData } from '@/lib/api/answersApi';
import { toast } from 'sonner';
import RichTextEditor from '@/components/editor/RichTextEditor';

const QuestionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuthStore();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  // Fetch question and answers
  const fetchQuestionData = async () => {
    if (!id || id === 'undefined') {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Fetch question
      const questionResponse = await questionsApi.getQuestion(id);
      setQuestion(questionResponse);
      
      // Increment view count
      await questionsApi.incrementViews(id);
      
      // Fetch answers for this question
      const answersResponse = await answersApi.getAnswers({ question: parseInt(id) });
      setAnswers(answersResponse || []);
    } catch (error: any) {
      console.error('Failed to fetch question data:', error);
      toast.error('Failed to load question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionData();
  }, [id]);

  const handleSubmitAnswer = async () => {
    if (!id || id === 'undefined' || !answerContent.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    try {
      setSubmittingAnswer(true);
      const answerData: CreateAnswerData = {
        content: answerContent,
        question: parseInt(id),
      };

      const response = await answersApi.createAnswer(answerData);
      
      // Add new answer to the list
      setAnswers(prev => [response, ...prev]);
      setAnswerContent('');
      setShowAnswerForm(false);
      
      toast.success('Your answer has been posted successfully!');
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      toast.error(error.message || 'Failed to post your answer. Please try again.');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleVoteQuestion = async (voteType: 'up' | 'down') => {
    if (!id || id === 'undefined') return;
    
    try {
      if (voteType === 'up') {
        await questionsApi.voteUp(id);
      } else {
        await questionsApi.voteDown(id);
      }
      
      // Refresh question data to get updated votes
      const response = await questionsApi.getQuestion(id);
      setQuestion(response);
      
      toast.success(`Question ${voteType === 'up' ? 'upvoted' : 'downvoted'} successfully!`);
    } catch (error: any) {
      console.error('Failed to vote:', error);
      toast.error(error.message || 'Failed to vote. Please try again.');
    }
  };

  const handleAcceptAnswer = async (answerId: number) => {
    try {
      await answersApi.acceptAnswer(answerId);
      
      // Refresh answers to show updated accepted status
      if (id && id !== 'undefined') {
        const answersResponse = await answersApi.getAnswers({ question: parseInt(id) });
        setAnswers(answersResponse || []);
        
        // Refresh question to show updated answered status
        const questionResponse = await questionsApi.getQuestion(id);
        setQuestion(questionResponse);
      }
      
      toast.success('Answer accepted successfully!');
    } catch (error: any) {
      console.error('Failed to accept answer:', error);
      toast.error(error.message || 'Failed to accept answer. Please try again.');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!id || id === 'undefined') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Invalid Question ID</h2>
          <p className="text-muted-foreground mb-4">The question ID is invalid or missing.</p>
          <Button asChild>
            <Link to="/questions">Back to Questions</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Question not found</h2>
          <p className="text-muted-foreground mb-4">The question you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/questions">Back to Questions</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/questions">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Questions
          </Link>
        </Button>
      </motion.div>

      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl mb-2">
                  {question.title}
                  {question.is_answered && (
                    <CheckCircle className="inline ml-2 h-5 w-5 text-green-600" />
                  )}
                </CardTitle>
                
                {/* Question Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Asked by <span className="font-medium text-foreground">{question.author.username}</span></span>
                    {question.author.reputation && (
                      <span className="text-primary">({question.author.reputation})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatTimeAgo(question.created_at)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {question.views} views
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>

            {/* Question Content */}
            <div className="prose max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ __html: question.content }} />
            </div>

            {/* Question Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVoteQuestion('up')}
                    disabled={!isAuthenticated || question.author.id === Number(user?.id)}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">{question.votes}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVoteQuestion('down')}
                    disabled={!isAuthenticated || question.author.id === Number(user?.id)}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {isAuthenticated && question.author.id === Number(user?.id) && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Answers Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>
          
          {isAuthenticated && (
            <Button onClick={() => setShowAnswerForm(!showAnswerForm)}>
              <Plus className="mr-2 h-4 w-4" />
              {showAnswerForm ? 'Cancel' : 'Add Answer'}
            </Button>
          )}
        </div>

        {/* Answer Form */}
        {showAnswerForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={answerContent}
                onChange={setAnswerContent}
                placeholder="Write your answer here..."
                className="min-h-48 mb-4"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitAnswer}
                  disabled={submittingAnswer || !answerContent.trim()}
                >
                  {submittingAnswer ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    'Post Answer'
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAnswerForm(false)}
                  disabled={submittingAnswer}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Answers List */}
        <div className="space-y-4">
          {answers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="mx-auto h-8 w-8 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No answers yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to answer this question!
                </p>
                {isAuthenticated && (
                  <Button onClick={() => setShowAnswerForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Answer
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            answers.map((answer) => (
              <Card key={answer.id} className={answer.is_accepted ? 'border-green-500 bg-green-50' : ''}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Vote Buttons */}
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* Handle answer vote up */}}
                        disabled={!isAuthenticated || answer.author.id === Number(user?.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <span className="font-medium">{answer.votes}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {/* Handle answer vote down */}}
                        disabled={!isAuthenticated || answer.author.id === Number(user?.id)}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                      
                      {question.author.id === Number(user?.id) && (
                        <Button
                          variant={answer.is_accepted ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleAcceptAnswer(answer.id)}
                          className="mt-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Answer Content */}
                    <div className="flex-1">
                      <div className="prose max-w-none mb-4">
                        <div dangerouslySetInnerHTML={{ __html: answer.content }} />
                      </div>
                      
                      {/* Answer Meta */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            <span>Answered by <span className="font-medium text-foreground">{answer.author.username}</span></span>
                            {answer.author.reputation && (
                              <span className="text-primary">({answer.author.reputation})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTimeAgo(answer.created_at)}
                          </div>
                        </div>
                        
                        {isAuthenticated && answer.author.id === Number(user?.id) && (
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuestionDetail;
