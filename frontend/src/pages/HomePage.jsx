import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mic, Feather, Info } from 'lucide-react';
import ModernHeader from '../components/ModernHeader';
import { AuroraBackground } from '../components/ui/AuroraBackground';
import { BentoGrid, BentoItem } from '../components/ui/BentoGrid';
import '../styles/modern.css'; // Ensure base styles are loaded

const HomePage = () => {
  const navigate = useNavigate();

  // Animation variants for Staggered Load
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="relative min-h-screen font-sans text-brand-gold">
      {/* 1. Living Background */}
      <AuroraBackground className="fixed inset-0 z-0" />

      {/* 2. Glass Header (Overlay) */}
      <div className="relative z-50">
        <ModernHeader title="All4Yah" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8">

        {/* 3. Hero Section - Cinematic Typography */}
        <div className="text-center mb-12 mt-8">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 700,
              background: 'linear-gradient(to bottom, #F9E4A4, #9C6F03)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 30px rgba(249, 228, 164, 0.4))',
              lineHeight: 1.1
            }}
          >
            ALL4YAH
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
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, #609CB4 0%, transparent 70%)',
                      filter: 'blur(10px)'
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
