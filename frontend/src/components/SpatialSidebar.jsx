import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, FileText, Settings, Eye, X, Navigation } from 'lucide-react';
import { getCanonicalBooks } from '../api/canonicalBooks';
import { getBookChapters } from '../api/verses';
import MagneticButton from './ui/MagneticButton';
import { BibleNavigator } from './Navigation';
import '../styles/bible-navigator.css';

// --- Components ---

/**
 * DockItem
 * A single icon in the floating dock with "Spotlight" active state
 */
const DockItem = ({ icon, label, onClick, isActive, isMobile }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="relative flex items-center justify-center w-16 h-16"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Tooltip (Desktop) - Appears on right */}
            <AnimatePresence>
                {isHovered && !isMobile && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 18, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="glass-tooltip absolute left-full z-50 whitespace-nowrap pointer-events-none"
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Magnetic Wrapper */}
            <MagneticButton
                onClick={onClick}
                strength={0.4}
                className="relative w-12 h-12 flex items-center justify-center"
            >
                {/* The Active "Spotlight" Pill Background */}
                {isActive && (
                    <motion.div
                        layoutId="activeDockBGPill"
                        className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 rounded-full border border-brand-gold/30 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                )}

                <div className={`
                    relative z-10 p-3 rounded-full transition-colors duration-300
                    flex items-center justify-center w-full h-full
                    ${isActive
                        ? 'text-brand-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]'
                        : 'text-gray-400 hover:text-white'
                    }
                `}>
                    {icon}
                </div>
            </MagneticButton>
        </div>
    );
};


// Panel content stagger animation
const panelContentVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
            delayChildren: 0.15
        }
    }
};

const panelItemVariants = {
    hidden: { opacity: 0, x: -10, scale: 0.95 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 150, damping: 15 }
    }
};

/**
 * SpatialPanel
 * The glass sheet that slides out containing the Grid
 */
const SpatialPanel = ({ title, onClose, children, isMobile }) => {
    return (
        <motion.div
            initial={isMobile ? { y: '100%', opacity: 0 } : { x: -30, opacity: 0, scale: 0.98 }}
            animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1, scale: 1 }}
            exit={isMobile ? { y: '100%', opacity: 0 } : { x: -30, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className={`
                fixed z-[55] glass-panel rounded-3xl
                ${isMobile
                    ? 'bottom-[5.5rem] left-4 right-4 max-h-[75vh] pb-4 flex flex-col' // Mobile Panel
                    : 'left-[6.5rem] top-24 bottom-24 w-[26rem] flex flex-col' // Desktop Panel
                }
            `}
        >
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex items-center justify-between p-5 border-b border-white/5 shrink-0"
            >
                <h2 className="font-cinzel text-xl text-brand-gold font-bold tracking-wide flex items-center gap-3">
                    {/* Decorative Dot */}
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-gold"></span>
                    </span>
                    {title}
                </h2>
                <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </motion.button>
            </motion.div>

            {/* Content Container with stagger */}
            <motion.div
                variants={panelContentVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 overflow-y-auto custom-scrollbar p-1"
            >
                {children}
            </motion.div>
        </motion.div>
    );
};

// Export variants for use in child components
export { panelItemVariants };


// --- Main Component ---

export const SpatialSidebar = ({
    currentBook,
    currentChapter,
    currentVerse = 1,
    onBookChange,
    onChapterChange,
    onVerseChange,
    showRestored,
    toggleRestoration,
    viewMode,
    setViewMode
}) => {
    const [activeTab, setActiveTab] = useState(null); // 'books', 'chapters', 'settings'
    const [books, setBooks] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);

    // Check mobile
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    // Load Data
    useEffect(() => {
        getCanonicalBooks({ orderBy: 'order_number' }).then(setBooks).catch(console.error);
    }, []);

    useEffect(() => {
        if (currentBook) {
            getBookChapters(currentBook).then(setChapters).catch(() => setChapters(Array.from({ length: 50 }, (_, i) => i + 1)));
        }
    }, [currentBook]);

    const toggleTab = (tab) => setActiveTab(prev => prev === tab ? null : tab);
    const closePanel = () => setActiveTab(null);

    const handleBookSelect = (code) => {
        onBookChange(code);
        setActiveTab('chapters'); // Auto-advance flow
    };

    // Handle scripture navigator selection (Book + Chapter + Verse)
    const handleNavigatorSelect = (selection) => {
        if (selection.book) onBookChange(selection.book);
        if (selection.chapter) onChapterChange(selection.chapter);
        if (selection.verse && onVerseChange) onVerseChange(selection.verse);
    };

    // Open the full scripture navigator
    const openNavigator = () => {
        setIsNavigatorOpen(true);
        setActiveTab(null); // Close any open panels
    };

    return (
        <>
            {/* --- The Ethereal Dock --- */}
            <motion.nav
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`
                    fixed z-50 flex items-center justify-between glass-dock glass-chromium glass-noise-high p-2
                    ${isMobile
                        ? 'bottom-6 left-6 right-6 h-16 rounded-full'
                        : 'left-6 top-1/2 -translate-y-1/2 w-[4.5rem] flex-col gap-4 py-6 rounded-[3rem]'
                    }
                `}
            >
                {/* Brand / Logo (Desktop Only Top) */}
                {!isMobile && (
                    <div className="mb-2 shrink-0">
                        <div className="w-12 h-12 flex items-center justify-center drop-shadow-[0_0_15px_rgba(212,175,55,0.3)] rounded-full overflow-hidden p-1 bg-black/20">
                            <img
                                src="/logo-living.jpg"
                                alt="All4Yah"
                                className="opacity-90 hover:opacity-100 transition-opacity"
                                style={{ width: '40px', height: '40px', objectFit: 'contain', maxWidth: '40px', maxHeight: '40px' }}
                            />
                        </div>
                    </div>
                )}

                {/* --- Dock Items --- */}

                {/* Scripture Navigator (New Miller Columns) */}
                <DockItem
                    icon={<Navigation size={22} strokeWidth={1.5} />}
                    label="Navigate"
                    isActive={isNavigatorOpen}
                    onClick={openNavigator}
                    isMobile={isMobile}
                />

                <DockItem
                    icon={<Book size={22} strokeWidth={1.5} />}
                    label="Library"
                    isActive={activeTab === 'books'}
                    onClick={() => toggleTab('books')}
                    isMobile={isMobile}
                />

                <DockItem
                    icon={<FileText size={22} strokeWidth={1.5} />}
                    label="Chapters"
                    isActive={activeTab === 'chapters'}
                    onClick={() => toggleTab('chapters')}
                    isMobile={isMobile}
                />

                {/* Divider */}
                <div className={`bg-white/10 ${isMobile ? 'w-px h-8 mx-1' : 'h-px w-8 my-1'}`} />

                <DockItem
                    icon={<Settings size={22} strokeWidth={1.5} />}
                    label="Settings"
                    isActive={activeTab === 'settings'}
                    onClick={() => toggleTab('settings')}
                    isMobile={isMobile}
                />
            </motion.nav>


            {/* --- The Spatial Panels --- */}
            <AnimatePresence>

                {/* BOOKS PANEL */}
                {activeTab === 'books' && (
                    <SpatialPanel key="books" title="Library" onClose={closePanel} isMobile={isMobile}>
                        <div className="grid grid-cols-2 gap-3 p-3">
                            {books.map(b => (
                                <motion.button
                                    key={b.book_code}
                                    variants={panelItemVariants}
                                    onClick={() => handleBookSelect(b.book_code)}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                                        relative group p-3 rounded-xl border transition-colors duration-200 text-left overflow-hidden flex items-center justify-between
                                        ${currentBook === b.book_code
                                            ? 'bg-brand-gold/10 border-brand-gold/40 text-brand-gold'
                                            : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10 text-gray-300'
                                        }
                                    `}
                                >
                                    <span className="relative z-10 font-serif font-medium text-sm tracking-wide">{b.book_name}</span>
                                    {currentBook === b.book_code && (
                                        <motion.div
                                            layoutId="activeBookDot"
                                            className="w-1.5 h-1.5 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(212,175,55,1)]"
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </SpatialPanel>
                )}

                {/* CHAPTERS PANEL */}
                {activeTab === 'chapters' && (
                    <SpatialPanel key="chapters" title={`${currentBook || 'Scripture'} Chapters`} onClose={closePanel} isMobile={isMobile}>
                        <div className="grid grid-cols-5 gap-3 p-4">
                            {chapters.map(ch => (
                                <motion.button
                                    key={ch}
                                    variants={panelItemVariants}
                                    onClick={() => { onChapterChange(ch); if (isMobile) closePanel(); }}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className={`
                                        aspect-square rounded-xl flex items-center justify-center font-mono text-sm transition-colors duration-200
                                        ${parseInt(currentChapter) === ch
                                            ? 'bg-brand-gold text-black font-bold shadow-[0_4px_20px_rgba(212,175,55,0.4)] border border-brand-gold'
                                            : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white'
                                        }
                                    `}
                                >
                                    {ch}
                                </motion.button>
                            ))}
                        </div>
                    </SpatialPanel>
                )}

                {/* SETTINGS PANEL */}
                {activeTab === 'settings' && (
                    <SpatialPanel key="settings" title="Settings" onClose={closePanel} isMobile={isMobile}>
                        <div className="p-4 space-y-4">

                            {/* Toggle Block: Restoration */}
                            <motion.div
                                variants={panelItemVariants}
                                onClick={toggleRestoration}
                                whileHover={{ scale: 1.01, y: -2 }}
                                whileTap={{ scale: 0.99 }}
                                className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-colors ${showRestored ? 'bg-brand-gold/20 text-brand-gold' : 'bg-black/40 text-gray-500'}`}>
                                        <Settings size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-200">Divine Names</h3>
                                        <p className="text-xs text-gray-500">Restore original Hebrew names</p>
                                    </div>
                                </div>
                                <motion.div
                                    className={`w-12 h-7 rounded-full relative transition-colors duration-300 ${showRestored ? 'bg-brand-gold' : 'bg-white/10'}`}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.div
                                        layout
                                        className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm"
                                        animate={{ left: showRestored ? '1.5rem' : '0.25rem' }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </motion.div>
                            </motion.div>

                            {/* Toggle Block: View Mode */}
                            <motion.div
                                variants={panelItemVariants}
                                onClick={() => setViewMode(viewMode === 'chapter' ? 'verse' : 'chapter')}
                                whileHover={{ scale: 1.01, y: -2 }}
                                whileTap={{ scale: 0.99 }}
                                className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-colors bg-black/40 text-gray-400 group-hover:text-white`}>
                                        <Eye size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-200">Reading Mode</h3>
                                        <p className="text-xs text-gray-500">{viewMode === 'chapter' ? 'Continuous Chapter' : 'Verse by Verse'}</p>
                                    </div>
                                </div>
                                <motion.div
                                    className="text-xs font-mono px-2 py-1 rounded bg-white/5 border border-white/5 text-gray-400"
                                    key={viewMode}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {viewMode === 'chapter' ? 'CHAP' : 'VRS'}
                                </motion.div>
                            </motion.div>
                        </div>
                    </SpatialPanel>
                )}

            </AnimatePresence>

            {/* Backdrop for Panels */}
            <AnimatePresence>
                {activeTab && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closePanel}
                        className="fixed inset-0 bg-black/60 backdrop-blur-[4px] z-40 transition-all duration-500"
                    />
                )}
            </AnimatePresence>

            {/* Scripture Navigator Modal (Miller Columns) */}
            <BibleNavigator
                isOpen={isNavigatorOpen}
                onClose={() => setIsNavigatorOpen(false)}
                currentSelection={{
                    book: currentBook,
                    chapter: currentChapter,
                    verse: currentVerse
                }}
                onSelectionChange={handleNavigatorSelect}
            />
        </>
    );
};
