
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { 
  MessageSquare, 
  Users, 
  Trophy, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Star,
  TrendingUp,
  Target,
  BookOpen,
  HelpCircle,
  UserCheck,
  Award,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Home = () => {
  const { isAuthenticated } = useAuthStore();

  // Animation hooks for each section
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [questionsRef, questionsInView] = useInView({ triggerOnce: true, threshold: 0.2 });

  const features = [
    {
      icon: MessageSquare,
      title: 'Ask & Answer',
      description: 'Get help from the community and share your knowledge with others.'
    },
    {
      icon: Users,
      title: 'Collaborative Learning',
      description: 'Learn together with peers and build a stronger understanding.'
    },
    {
      icon: Trophy,
      title: 'Reputation System',
      description: 'Earn points for helpful answers and quality questions.'
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description: 'Get instant notifications when someone answers your questions.'
    },
  ];

  const stats = [
    { label: 'Questions Asked', value: '12.5K', icon: MessageSquare },
    { label: 'Active Users', value: '3.2K', icon: Users },
    { label: 'Answers Given', value: '28.1K', icon: CheckCircle },
    { label: 'Success Rate', value: '94%', icon: TrendingUp },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Frontend Developer",
      content: "StackIt helped me solve complex React issues that I couldn't find anywhere else. The community is incredibly supportive!",
      rating: 5
    },
    {
      name: "Mike Johnson",
      role: "Full Stack Engineer",
      content: "I've learned more in 3 months on StackIt than in years of solo coding. The quality of answers is outstanding.",
      rating: 5
    },
    {
      name: "Lisa Wang",
      role: "Backend Developer",
      content: "Not just answers, but explanations that help you understand the 'why' behind solutions. Game changer!",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 md:py-32 px-4 text-center hero-section">
        <motion.div
          className="container mx-auto max-w-7xl relative"
          initial={{ opacity: 0, y: 40 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
              <Target className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight text-gray-900">
              Learn Together, <span className="text-primary">Grow Together</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              StackIt is where developers ask questions, share knowledge, and build their careers.
              Join our community of learners and experts.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isAuthenticated ? (
                <>
                  <Button size="lg" asChild className="primary-button">
                    <Link to="/ask" className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      Ask a Question
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="secondary-button">
                    <Link to="/questions" className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Browse Questions
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild className="primary-button">
                    <Link to="/register" className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="secondary-button">
                    <Link to="/questions" className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Explore Questions
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 px-4 bg-gray-50">
        <motion.div
          className="container mx-auto max-w-7xl"
          initial={{ opacity: 0, y: 40 }}
          animate={statsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stats-card"
                whileHover={{ scale: 1.05, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="icon-container mx-auto mb-4">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl font-bold mb-2 text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-4">
        <motion.div
          className="container mx-auto max-w-7xl"
          initial={{ opacity: 0, y: 40 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
        >
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Choose StackIt?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We've built the perfect platform for developers to learn, share, and grow together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="feature-card"
                whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="icon-container mx-auto mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-base leading-relaxed text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Popular Questions Preview */}
      <section ref={questionsRef} className="py-24 px-4 bg-gray-50">
        <motion.div
          className="container mx-auto max-w-7xl"
          initial={{ opacity: 0, y: 40 }}
          animate={questionsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
        >
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Popular Questions
            </h2>
            <p className="text-xl text-gray-600">
              See what the community is discussing right now
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {[
              {
                title: "How to handle async/await in React useEffect?",
                tags: ["React", "JavaScript", "Async"],
                answers: 15,
                votes: 42,
                views: "2.1K"
              },
              {
                title: "Best practices for state management in large React apps?",
                tags: ["React", "State Management", "Architecture"],
                answers: 8,
                votes: 28,
                views: "1.8K"
              },
              {
                title: "How to optimize React app performance?",
                tags: ["React", "Performance", "Optimization"],
                answers: 12,
                votes: 35,
                views: "3.2K"
              },
              {
                title: "Understanding TypeScript generics with examples",
                tags: ["TypeScript", "Generics", "Tutorial"],
                answers: 6,
                votes: 18,
                views: "1.5K"
              }
            ].map((question, index) => (
              <motion.div
                key={index}
                className="question-card"
                whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 text-gray-900 hover:text-primary transition-colors leading-relaxed">
                    {question.title}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {question.tags.map((tag) => (
                      <span key={tag} className="tag-pill">
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-6">
                      <span className="flex items-center gap-1 hover:text-primary transition-colors">
                        <TrendingUp className="h-4 w-4" />
                        {question.votes} votes
                      </span>
                      <span className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        {question.answers} answers
                      </span>
                    </div>
                    <span className="font-medium">{question.views} views</span>
                  </div>
                </CardContent>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Button variant="outline" size="lg" asChild className="secondary-button">
              <Link to="/questions" className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                View All Questions
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Developers Say
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from our amazing community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="feature-card text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex justify-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg text-gray-900">{testimonial.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">
                    {testimonial.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-primary/5">
        <div className="container mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-8">
            <BookOpen className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900">
            Ready to Start Learning?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers who are already growing their skills with StackIt. 
            Your coding journey starts here!
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button size="lg" asChild className="primary-button">
                <Link to="/register" className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Create Your Account
                  <Star className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="secondary-button">
                <Link to="/login" className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Sign In
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
