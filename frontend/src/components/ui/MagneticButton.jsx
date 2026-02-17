
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * MagneticButton Component
 * A "Living Interface" element that physically responds to the user's presence.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Context to wrap
 * @param {Function} props.onClick - Click handler
 * @param {string} props.className - Additional classes
 * @param {number} props.strength - How strong the pull is (default: 0.5)
 */
const MagneticButton = ({ children, onClick, className = "", strength = 0.5, ...rest }) => {
    const ref = useRef(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        if (!ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();

        const centerX = left + width / 2;
        const centerY = top + height / 2;

        // Calculate distance from center
        const deltaX = (clientX - centerX) * strength;
        const deltaY = (clientY - centerY) * strength;

        setPosition({ x: deltaX, y: deltaY });
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.button
            type="button"
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            onClick={onClick}
            className={className}
            style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            {...rest}
        >
            {children}
        </motion.button>
    );
};

export default MagneticButton;
