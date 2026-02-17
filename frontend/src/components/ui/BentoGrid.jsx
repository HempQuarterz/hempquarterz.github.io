import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

/**
 * BentoGrid - A modular, auto-responsive grid layout.
 * Best used for dashboards and modern landing pages.
 *
 * Respects prefers-reduced-motion for accessibility.
 */
export const BentoGrid = ({ className, children }) => {
    const prefersReducedMotion = useReducedMotion();

    // Stagger animation variants for the grid container
    const gridVariants = prefersReducedMotion ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 }
    } : {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    return (
        <motion.div
            className={className || ''}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '2rem'
            }}
        >
            {children}
        </motion.div>
    );
};

/**
 * BentoItem - A single cell in the Bento Grid.
 * Supports row/col spanning and built-in hover effects.
 *
 * Respects prefers-reduced-motion for accessibility.
 */
export const BentoItem = ({
    className,
    title,
    description,
    header,
    icon,
    colSpan = 1,
    rowSpan = 1,
    onClick
}) => {
    const prefersReducedMotion = useReducedMotion();

    // Individual item entrance animation
    const itemVariants = prefersReducedMotion ? {
        hidden: { opacity: 1, y: 0, scale: 1 },
        visible: { opacity: 1, y: 0, scale: 1 }
    } : {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            whileHover={prefersReducedMotion ? {} : { y: -5, scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 20 }}
            className={className}
            onClick={onClick}
            style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`,
                background: 'rgba(14, 35, 59, 0.6)', // Glass Midnight Base
                backdropFilter: 'blur(12px)',
                borderRadius: '24px',
                padding: '1.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: onClick ? 'pointer' : 'default',
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            {/* Header / Graphic Area */}
            {header && (
                <div style={{ flex: 1, minHeight: '6rem', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                    {header}
                </div>
            )}

            {/* Content Area */}
            <div style={{ zIndex: 2 }}>
                {icon && <div style={{ marginBottom: '0.75rem', color: '#609CB4' }}>{icon}</div>}
                <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    color: '#F9E4A4', // Brand Gold
                    fontFamily: "'Cinzel', serif"
                }}>
                    {title}
                </h3>
                {description && (
                    <p style={{
                        fontSize: '0.9rem',
                        color: 'rgba(142, 147, 143, 0.9)', // Brand Grey
                        margin: 0,
                        lineHeight: '1.6'
                    }}>
                        {description}
                    </p>
                )}
            </div>

            {/* Glossy Gradient Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />
        </motion.div>
    );
};
