import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import '../../styles/bento-grid.css';

/**
 * BentoGrid — modular auto-responsive grid layout. Visual styling lives in
 * bento-grid.css so themes/tokens drive appearance.
 */
export const BentoGrid = ({ className, children }) => {
    const prefersReducedMotion = useReducedMotion();

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
            className={`bento-grid ${className || ''}`.trim()}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
};

/**
 * BentoItem — single cell. Span/click are still props; visuals come from
 * .bento-item in bento-grid.css.
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

    const classes = ['bento-item', onClick ? 'is-clickable' : '', className]
        .filter(Boolean)
        .join(' ');

    return (
        <motion.div
            variants={itemVariants}
            whileHover={prefersReducedMotion ? {} : { y: -5, scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 20 }}
            className={classes}
            onClick={onClick}
            style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${rowSpan}`
            }}
        >
            {header && <div className="bento-item-header">{header}</div>}

            <div className="bento-content">
                {icon && <div className="bento-icon">{icon}</div>}
                <h2 className="bento-title">{title}</h2>
                {description && (
                    <p className="bento-description">{description}</p>
                )}
            </div>

            <div className="bento-item-glaze" aria-hidden="true" />
        </motion.div>
    );
};
