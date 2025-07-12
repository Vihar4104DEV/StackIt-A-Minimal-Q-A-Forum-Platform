
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { toast } from 'sonner';
import { X, Plus, HelpCircle, Tag, Lightbulb, BookOpen, CheckCircle, AlertCircle, Clock, Users, Target, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { questionsApi, CreateQuestionData } from '@/lib/api/questionsApi';

interface QuestionForm {
  title: string;
  content: string;
  tags: string[];
}

const AskQuestion = () => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<QuestionForm>();

  const title = watch('title', '');

  const popularTags = [
    { name: 'React', color: 'bg-blue-100 text-blue-800' },
    { name: 'JavaScript', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'TypeScript', color: 'bg-blue-100 text-blue-700' },
    { name: 'Node.js', color: 'bg-green-100 text-green-800' },
    { name: 'Python', color: 'bg-green-100 text-green-700' },
    { name: 'CSS', color: 'bg-purple-100 text-purple-800' },
    { name: 'HTML', color: 'bg-orange-100 text-orange-800' },
    { name: 'Git', color: 'bg-gray-100 text-gray-800' },
    { name: 'Database', color: 'bg-indigo-100 text-indigo-800' },
    { name: 'API', color: 'bg-teal-100 text-teal-800' },
    { name: 'Testing', color: 'bg-pink-100 text-pink-800' },
    { name: 'Performance', color: 'bg-yellow-100 text-yellow-700' }
  ];

  const addTag = (tagName: string) => {
    if (tagName.trim() && !tags.includes(tagName.trim()) && tags.length < 5) {
      const newTags = [...tags, tagName.trim()];
      setTags(newTags);
      setValue('tags', newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setValue('tags', newTags);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const onSubmit = async (data: QuestionForm) => {
    if (!content.trim()) {
      toast.error('Please provide details about your question');
      return;
    }

    if (tags.length === 0) {
      toast.error('Please add at least one tag');
      return;
    }

    setIsSubmitting(true);

    try {
      const questionData: CreateQuestionData = {
        title: data.title,
        content: content,
        tag_names: tags,
      };

      console.log('Submitting question data:', questionData);
      const response = await questionsApi.createQuestion(questionData);
      console.log('Question creation response:', response);

      // Handle the response structure correctly
      if (response && response.id) {
        console.log('Question created successfully with ID:', response.id);
        toast.success('Your question has been posted successfully!');
        navigate(`/questions/${response.id}`);
      } else {
        console.log('Question created but no ID found in response');
        toast.error('Question created but could not redirect. Please check the questions list.');
        navigate('/questions');
      }
    } catch (error: any) {
      console.error('Failed to submit question:', error);
      
      // Handle specific error cases
      if (error.errors) {
        const errorMessages = Object.values(error.errors).flat();
        toast.error(errorMessages[0] || 'Failed to post your question. Please try again.');
      } else {
        toast.error(error.message || 'Failed to post your question. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTitleValidationIcon = () => {
    if (!title) return null;
    if (title.length < 10) return <AlertCircle className="h-4 w-4 text-warning" />;
    if (title.length > 150) return <AlertCircle className="h-4 w-4 text-destructive" />;
    return <CheckCircle className="h-4 w-4 text-success" />;
  };

  const [formRef, formInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-4 sm:mb-6">
            <HelpCircle className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Ask a Question
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get help from our amazing community! Share your coding challenges and discover solutions together.
          </p>
        </motion.div>

        {/* Question Form */}
        <motion.div
          ref={formRef}
          initial={{ opacity: 0, y: 30 }}
          animate={formInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
            <Card className="professional-card">
              <CardHeader className="bg-primary/5 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl lg:text-2xl flex items-center gap-2">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Question Details
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Be specific and clear to get the best answers from our community
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
                {/* Title */}
                <div className="space-y-2 sm:space-y-3">
                  <Label htmlFor="title" className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    Title *
                    {getTitleValidationIcon()}
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="e.g., How do I implement authentication in React?"
                    {...register('title', {
                      required: 'Title is required',
                      minLength: {
                        value: 10,
                        message: 'Title must be at least 10 characters',
                      },
                      maxLength: {
                        value: 150,
                        message: 'Title must be less than 150 characters',
                      },
                    })}
                    className={`professional-input text-base sm:text-lg ${
                      errors.title ? 'border-destructive focus:ring-destructive/30' : ''
                    }`}
                  />
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    {errors.title && (
                      <p className="text-xs sm:text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                        {errors.title.message}
                      </p>
                    )}
                    <p className={`text-xs sm:text-sm ${errors.title ? 'sm:ml-auto' : 'ml-auto'} ${
                      title.length < 10 ? 'text-warning' :
                      title.length > 150 ? 'text-destructive' : 'text-success'
                    }`}>
                      {title.length}/150 characters
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    Content *
                  </Label>
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    placeholder="Describe your problem in detail. Include what you've tried and what specific help you need...

Pro tips:
• Share your code snippets
• Mention error messages  
• Explain your expected vs actual results
• Add screenshots if helpful

You can add emojis from the toolbar above to make your question more engaging!"
                    className="min-h-48 sm:min-h-80 border-2 border-dashed border-gray-300 hover:border-primary/30 transition-colors duration-300"
                  />
                  {!content.trim() && (
                    <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                      <Info className="h-3 w-3 sm:h-4 sm:w-4" />
                      Please provide details about your question
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-3 sm:space-y-4">
                  <Label className="text-sm sm:text-base font-semibold flex items-center gap-2">
                    <Tag className="h-3 w-3 sm:h-4 sm:w-4" />
                    Tags * (up to 5)
                  </Label>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Selected Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        {tags.map((tag) => {
                          const tagInfo = popularTags.find(t => t.name === tag);
                          return (
                            <Badge key={tag} variant="secondary" className={`text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 ${tagInfo?.color || 'bg-gray-100 text-gray-800'} hover:scale-105 transition-transform`}>
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 sm:ml-2 hover:bg-destructive/20 rounded-full p-0.5 transition-colors"
                              >
                                <X className="h-2 w-2 sm:h-3 sm:w-3" />
                              </button>
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    {/* Tag Input */}
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Add tags (press Enter or comma to add)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        className="professional-input"
                        disabled={tags.length >= 5}
                      />
                      {tags.length >= 5 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum 5 tags allowed
                        </p>
                      )}
                    </div>

                    {/* Popular Tags */}
                    <div className="space-y-2 sm:space-y-3">
                      <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                        Popular tags:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                          <button
                            key={tag.name}
                            type="button"
                            onClick={() => addTag(tag.name)}
                            disabled={tags.includes(tag.name) || tags.length >= 5}
                            className={`text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 rounded-full border transition-all ${
                              tags.includes(tag.name)
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : `${tag.color} hover:scale-105 hover:shadow-sm cursor-pointer`
                            }`}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="professional-card">
              <CardHeader className="bg-blue-50 p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2 text-blue-900">
                  <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
                  Writing a Good Question
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-1">Be Specific</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Include details about your environment, version, and specific error messages.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-1">Show Your Work</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Share what you've already tried and why it didn't work.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm sm:text-base mb-1">Be Patient</h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Good answers take time. Our community will help you find the solution.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting Question...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Post Question
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate('/questions')}
                className="flex-1 sm:flex-none sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AskQuestion;
