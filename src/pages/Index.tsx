import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  const [contentRef, contentInView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        ref={contentRef}
        initial={{ opacity: 0, y: 30 }}
        animate={contentInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
      </motion.div>
    </div>
  );
};

export default Index;
