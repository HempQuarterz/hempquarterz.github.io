import React from 'react';
import { motion } from 'framer-motion';

/**
 * BentoGrid - A modular, auto-responsive grid layout.
 * Best used for dashboards and modern landing pages.
 */
export const BentoGrid = ({ className, children }) => {
    return (
        <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto ${className}`}
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
        </div>
    );
};

/**
 * BentoItem - A single cell in the Bento Grid.
 * Supports row/col spanning and built-in hover effects.
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
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
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
