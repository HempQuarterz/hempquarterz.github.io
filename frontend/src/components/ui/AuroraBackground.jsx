import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * AuroraBackground - A living, breathing gradient mesh.
 * Replaces static backgrounds with slow-moving color shifts.
 *
 * Performance optimizations:
 * - Respects prefers-reduced-motion for accessibility
 * - Uses static gradients when motion is reduced
 * - GPU-accelerated with willChange hints
 */
export const AuroraBackground = ({ children, className }) => {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);

        const handleChange = (e) => setPrefersReducedMotion(e.matches);
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Static gradient styles (no animation)
    const staticGradientBase = {
        position: 'absolute',
        zIndex: 0
    };

    // When reduced motion is preferred, render static gradients
    if (prefersReducedMotion) {
        return (
            <div className={`relative w-full h-full bg-[#0E233B] overflow-hidden ${className}`}>
                {/* Static Gold Gradient */}
                <div
                    style={{
                        ...staticGradientBase,
                        top: '-10%',
                        left: '-10%',
                        width: '50vw',
                        height: '50vh',
                        background: 'radial-gradient(circle, rgba(249, 228, 164, 0.35) 0%, transparent 70%)',
                        filter: 'blur(60px)',
                        opacity: 0.4
                    }}
                />
                {/* Static Teal Gradient */}
                <div
                    style={{
                        ...staticGradientBase,
                        top: '20%',
                        right: '-10%',
                        width: '60vw',
                        height: '60vh',
                        background: 'radial-gradient(circle, rgba(96, 156, 180, 0.3) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                        opacity: 0.3
                    }}
                />
                {/* Static Purple Gradient */}
                <div
                    style={{
                        ...staticGradientBase,
                        bottom: '-20%',
                        left: '20%',
                        width: '70vw',
                        height: '50vh',
                        background: 'radial-gradient(circle, rgba(106, 27, 154, 0.3) 0%, transparent 70%)',
                        filter: 'blur(100px)',
                        opacity: 0.2
                    }}
                />
                {/* Content Layer */}
                <div className="relative z-10 w-full h-full">
                    {children}
                </div>
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full bg-[#0E233B] overflow-hidden ${className}`}>
            {/* Mesh Gradients 1 - Gold (Majesty) */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '50vw',
                    height: '50vh',
                    background: 'radial-gradient(circle, rgba(249, 228, 164, 0.4) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    zIndex: 0,
                    willChange: 'transform, opacity'
                }}
            />

            {/* Mesh Gradients 2 - Teal (Wisdom) */}
            <motion.div
                animate={{
                    x: [0, -80, 0],
                    y: [0, 100, 0],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 2
                }}
                style={{
                    position: 'absolute',
                    top: '20%',
                    right: '-10%',
                    width: '60vw',
                    height: '60vh',
                    background: 'radial-gradient(circle, rgba(96, 156, 180, 0.3) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    zIndex: 0,
                    willChange: 'transform, opacity'
                }}
            />

            {/* Mesh Gradients 3 - Deep Purple (Spirit) */}
            <motion.div
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    repeatType: "reverse",
                    ease: "easeInOut",
                    delay: 5
                }}
                style={{
                    position: 'absolute',
                    bottom: '-20%',
                    left: '20%',
                    width: '70vw',
                    height: '50vh',
                    background: 'radial-gradient(circle, rgba(106, 27, 154, 0.3) 0%, transparent 70%)',
                    filter: 'blur(100px)',
                    zIndex: 0,
                    willChange: 'transform, opacity'
                }}
            />

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};
