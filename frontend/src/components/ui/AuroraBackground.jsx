import React from 'react';
import { motion } from 'framer-motion';

/**
 * AuroraBackground - A living, breathing gradient mesh.
 * Replaces static backgrounds with slow-moving color shifts.
 */
export const AuroraBackground = ({ children, className }) => {
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
                    zIndex: 0
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
                    zIndex: 0
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
                    zIndex: 0
                }}
            />

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};
