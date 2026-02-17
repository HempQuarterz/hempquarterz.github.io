import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mic, Feather, Info } from 'lucide-react';
import { AuroraBackground } from '../components/ui/AuroraBackground';
import { BentoGrid, BentoItem } from '../components/ui/BentoGrid';
import { useReducedMotion } from '../hooks/useReducedMotion';
import '../styles/modern.css'; // Ensure base styles are loaded

const HomePage = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Letter-by-letter animation for hero title (respects reduced motion)
  const letterVariants = prefersReducedMotion ? {
    hidden: { opacity: 1, y: 0, scale: 1 },
    visible: { opacity: 1, y: 0, scale: 1 }
  } : {
    hidden: { opacity: 0, y: 50, scale: 0.8 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: i * 0.08,
        type: "spring",
        stiffness: 120,
        damping: 12
      }
    })
  };

  // Container for hero title letters
  const heroContainerVariants = prefersReducedMotion ? {
    hidden: { opacity: 1 },
    visible: { opacity: 1 }
  } : {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2
      }
    }
  };

  // Animation variants for Staggered Load (BentoGrid)
  const containerVariants = prefersReducedMotion ? {
    hidden: { opacity: 1 },
    show: { opacity: 1 }
  } : {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.8 // Start after hero animation
      }
    }
  };

  const heroTitle = "ALL4YAH";

  return (
    <div className="hero-page">
      {/* 1. Living Background */}
      <AuroraBackground className="aurora-fixed-bg" />

      {/* Note: BreadcrumbRibbon is now rendered at App level */}

      <main className="main-content-above">

        {/* 3. Hero Section - Cinematic Typography */}
        <div className="text-center mb-12" style={{ marginTop: '2rem' }}>
          <motion.h1
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              display: 'flex',
              justifyContent: 'center',
              gap: '0.02em'
            }}
          >
            {heroTitle.split('').map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterVariants}
                style={{
                  display: 'inline-block',
                  background: 'linear-gradient(to bottom, #F9E4A4, #9C6F03)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 30px rgba(249, 228, 164, 0.4))',
                }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            style={{
              fontSize: '1.25rem',
              color: 'rgba(251, 245, 219, 0.8)',
              fontFamily: "'Inter', sans-serif",
              maxWidth: '600px',
              margin: '1rem auto'
            }}
          >
            "Restoring the Word, verse by verse."
          </motion.p>
        </div>

        {/* 4. The Bento Dashboard */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <BentoGrid>
            {/* Main Feature: Manuscripts (Large Tile) */}
            <BentoItem
              colSpan={2}
              rowSpan={2}
              title="Manuscript Viewer"
              description="Read Hebrew, Greek, and Aramaic scriptures with parallel translation and divine name restoration."
              icon={<BookOpen size={32} />}
              onClick={() => navigate('/manuscripts')}
              header={
                <div style={{
                  width: '100%',
                  height: '100%',
                  background: 'url(/textures/parchment.png)',
                  backgroundSize: 'cover',
                  opacity: 0.6,
                  maskImage: 'linear-gradient(to bottom, black, transparent)'
                }} />
              }
            />

            {/* Spirit AI (Vertical Tile) */}
            <BentoItem
              colSpan={1}
              rowSpan={2}
              title="Spirit AI (LSI)"
              description="AI-powered prayer analysis and spiritual reflection."
              icon={<Mic size={32} />}
              onClick={() => navigate('/lsi')}
              header={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <motion.div
                    animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={prefersReducedMotion ? {} : { duration: 3, repeat: Infinity }}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #609CB4 0%, transparent 70%)',
                      filter: 'blur(10px)',
                      opacity: prefersReducedMotion ? 0.65 : undefined
                    }}
                  />
                </div>
              }
            />

            {/* Quick Stats (Small Tile) */}
            <BentoItem
              colSpan={1}
              title="248,871 Verses"
              description="Restored across 12 manuscripts"
              icon={<Feather size={24} />}
            />

            {/* Mission (Small Tile) */}
            <BentoItem
              colSpan={1}
              title="Our Mission"
              description="Restoring truth, one name at a time."
              icon={<Info size={24} />}
              onClick={() => navigate('/about')}
            />

            {/* Daily Reflection (Wide Tile) */}
            <BentoItem
              colSpan={3}
              title="Daily Word"
              description='"This is my name forever, the name you shall call me from generation to generation." - Exodus 3:15'
              className="italic"
            />
          </BentoGrid>
        </motion.div>

      </main>
    </div>
  );
};

export default HomePage;
