/**
 * ManuscriptIcon - Medieval manuscript-style SVG icon component
 * Ornamental icons inspired by illuminated manuscripts
 *
 * Usage:
 *   <ManuscriptIcon name="scroll" size={24} color="var(--primary)" />
 */

import React from 'react';
import './manuscript-icons.css';

const ManuscriptIcon = ({
  name,
  size = 24,
  color = 'currentColor',
  className = '',
  ...props
}) => {
  // Base SVG properties
  const svgProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: `manuscript-icon manuscript-icon-${name} ${className}`,
    ...props
  };

  // Medieval manuscript-style icon paths
  const icons = {
    // 📜 Scroll icon - Unfurled manuscript
    scroll: (
      <>
        <path d="M4 6 C4 4, 5 3, 6 3 L18 3 C19 3, 20 4, 20 6" />
        <path d="M4 18 C4 20, 5 21, 6 21 L18 21 C19 21, 20 20, 20 18" />
        <path d="M6 3 L6 21" strokeWidth="2.5" />
        <path d="M18 3 L18 21" strokeWidth="2.5" />
        <rect x="6" y="7" width="12" height="1.5" fill={color} opacity="0.6" />
        <rect x="6" y="10" width="12" height="1.5" fill={color} opacity="0.6" />
        <rect x="6" y="13" width="9" height="1.5" fill={color} opacity="0.6" />
        <circle cx="4" cy="6" r="1.5" fill={color} />
        <circle cx="4" cy="18" r="1.5" fill={color} />
        <circle cx="20" cy="6" r="1.5" fill={color} />
        <circle cx="20" cy="18" r="1.5" fill={color} />
      </>
    ),

    // ✨ Divine sparkle - Four-pointed ornamental star
    divine: (
      <>
        <path d="M12 3 L12 21" strokeWidth="2" />
        <path d="M3 12 L21 12" strokeWidth="2" />
        <path d="M6.3 6.3 L17.7 17.7" strokeWidth="1.5" />
        <path d="M17.7 6.3 L6.3 17.7" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="3" fill={color} opacity="0.3" />
        <circle cx="12" cy="3" r="1.5" fill={color} />
        <circle cx="12" cy="21" r="1.5" fill={color} />
        <circle cx="3" cy="12" r="1.5" fill={color} />
        <circle cx="21" cy="12" r="1.5" fill={color} />
        <path d="M12 8 C10 8, 8 10, 8 12 C8 14, 10 16, 12 16 C14 16, 16 14, 16 12 C16 10, 14 8, 12 8"
              fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
      </>
    ),

    // 📚 Books - Stack of ancient codices
    books: (
      <>
        <rect x="4" y="14" width="10" height="7" rx="1" fill={color} opacity="0.2" />
        <path d="M4 14 L4 21 M14 14 L14 21" strokeWidth="2" />
        <path d="M6 14 L6 21 M12 14 L12 21" strokeWidth="1" opacity="0.5" />
        <rect x="6" y="8" width="12" height="6" rx="1" fill={color} opacity="0.25" />
        <path d="M6 8 L6 14 M18 8 L18 14" strokeWidth="2" />
        <path d="M8 8 L8 14 M16 8 L16 14" strokeWidth="1" opacity="0.5" />
        <rect x="8" y="3" width="10" height="5" rx="1" fill={color} opacity="0.3" />
        <path d="M8 3 L8 8 M18 3 L18 8" strokeWidth="2" />
        <path d="M10 3 L10 8 M16 3 L16 8" strokeWidth="1" opacity="0.5" />
      </>
    ),

    // 📖 Reference book - Open codex
    reference: (
      <>
        <path d="M4 4 C4 3, 4.5 2, 6 2 L11 2 L11 22 L6 22 C4.5 22, 4 21, 4 20 Z" fill={color} opacity="0.15" />
        <path d="M20 4 C20 3, 19.5 2, 18 2 L13 2 L13 22 L18 22 C19.5 22, 20 21, 20 20 Z" fill={color} opacity="0.15" />
        <path d="M4 4 C4 3, 4.5 2, 6 2 L11 2 L11 22 L6 22 C4.5 22, 4 21, 4 20 Z" />
        <path d="M20 4 C20 3, 19.5 2, 18 2 L13 2 L13 22 L18 22 C19.5 22, 20 21, 20 20 Z" />
        <line x1="6" y1="7" x2="10" y2="7" strokeWidth="1" opacity="0.6" />
        <line x1="6" y1="10" x2="10" y2="10" strokeWidth="1" opacity="0.6" />
        <line x1="14" y1="7" x2="18" y2="7" strokeWidth="1" opacity="0.6" />
        <line x1="14" y1="10" x2="18" y2="10" strokeWidth="1" opacity="0.6" />
        <path d="M11 2 L11 22 L13 22 L13 2 Z" fill={color} opacity="0.3" />
      </>
    ),

    // 🕸️ Network web - Interconnected nodes
    network: (
      <>
        <circle cx="12" cy="12" r="2" fill={color} />
        <circle cx="6" cy="6" r="1.5" fill={color} opacity="0.7" />
        <circle cx="18" cy="6" r="1.5" fill={color} opacity="0.7" />
        <circle cx="6" cy="18" r="1.5" fill={color} opacity="0.7" />
        <circle cx="18" cy="18" r="1.5" fill={color} opacity="0.7" />
        <line x1="12" y1="12" x2="6" y2="6" strokeWidth="1.5" opacity="0.4" />
        <line x1="12" y1="12" x2="18" y2="6" strokeWidth="1.5" opacity="0.4" />
        <line x1="12" y1="12" x2="6" y2="18" strokeWidth="1.5" opacity="0.4" />
        <line x1="12" y1="12" x2="18" y2="18" strokeWidth="1.5" opacity="0.4" />
        <path d="M6 6 L18 6 L18 18 L6 18 Z" strokeWidth="1" opacity="0.2" strokeDasharray="2 2" />
        <circle cx="12" cy="4" r="1" fill={color} opacity="0.5" />
        <circle cx="12" cy="20" r="1" fill={color} opacity="0.5" />
        <circle cx="4" cy="12" r="1" fill={color} opacity="0.5" />
        <circle cx="20" cy="12" r="1" fill={color} opacity="0.5" />
      </>
    ),

    // 🔍 Discovery magnifying glass - Ornamental search
    discovery: (
      <>
        <circle cx="10" cy="10" r="6" strokeWidth="2" />
        <circle cx="10" cy="10" r="4" strokeWidth="1" opacity="0.3" />
        <line x1="14.5" y1="14.5" x2="20" y2="20" strokeWidth="2.5" />
        <line x1="15" y1="15" x2="19.5" y2="19.5" strokeWidth="1.5" stroke="#fff" opacity="0.3" />
        <circle cx="20" cy="20" r="1.5" fill={color} />
        <path d="M7 8 C8 7, 9 7, 10 7" strokeWidth="1" opacity="0.5" />
        <circle cx="8" cy="9" r="0.5" fill={color} opacity="0.6" />
        <path d="M10 6 L10 7 M6 10 L7 10 M13 10 L14 10 M10 13 L10 14"
              strokeWidth="1" opacity="0.3" />
      </>
    ),

    // 📅 Timeline calendar - Historical scroll
    timeline: (
      <>
        <rect x="4" y="5" width="16" height="16" rx="2" strokeWidth="2" />
        <line x1="4" y1="9" x2="20" y2="9" strokeWidth="2" />
        <circle cx="8" cy="7" r="0.8" fill={color} />
        <circle cx="16" cy="7" r="0.8" fill={color} />
        <rect x="7" y="12" width="2" height="2" fill={color} opacity="0.6" />
        <rect x="11" y="12" width="2" height="2" fill={color} opacity="0.8" />
        <rect x="15" y="12" width="2" height="2" fill={color} opacity="0.6" />
        <rect x="7" y="16" width="2" height="2" fill={color} opacity="0.8" />
        <rect x="11" y="16" width="2" height="2" fill={color} />
        <rect x="15" y="16" width="2" height="2" fill={color} opacity="0.6" />
        <path d="M8 3 L8 5 M16 3 L16 5" strokeWidth="2" />
      </>
    ),

    // 🎧 Audio ear - Listening to Scripture
    audio: (
      <>
        <path d="M12 3 C8 3, 5 6, 5 10 L5 14 C5 15, 6 16, 7 16 L8 16 C8.5 16, 9 15.5, 9 15 L9 11 C9 10.5, 8.5 10, 8 10 L6 10 L6 10 C6 7, 8.5 4, 12 4 C15.5 4, 18 7, 18 10 L18 10 L16 10 C15.5 10, 15 10.5, 15 11 L15 15 C15 15.5, 15.5 16, 16 16 L17 16 C18 16, 19 15, 19 14 L19 10 C19 6, 16 3, 12 3 Z"
              fill={color} opacity="0.2" />
        <path d="M12 3 C8 3, 5 6, 5 10 L5 14 C5 15, 6 16, 7 16 L8 16 C8.5 16, 9 15.5, 9 15 L9 11 C9 10.5, 8.5 10, 8 10 L6 10"
              strokeWidth="2" />
        <path d="M12 3 C16 3, 19 6, 19 10 L19 14 C19 15, 18 16, 17 16 L16 16 C15.5 16, 15 15.5, 15 15 L15 11 C15 10.5, 15.5 10, 16 10 L18 10"
              strokeWidth="2" />
        <path d="M12 18 L15 18 C16 18, 17 19, 17 20 C17 21, 16 22, 15 22 L12 22" strokeWidth="2" />
      </>
    ),

    // ℹ️ Info circle - Information
    info: (
      <>
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <circle cx="12" cy="12" r="7" strokeWidth="1" opacity="0.2" />
        <path d="M12 11 L12 17" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1" fill={color} />
        <path d="M10 17 L14 17" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="11" strokeWidth="0.5" opacity="0.3" />
      </>
    ),

    // ⚙️ Settings gear - Configuration
    settings: (
      <>
        <circle cx="12" cy="12" r="3" strokeWidth="2" />
        <path d="M12 2 L12 6 M12 18 L12 22 M2 12 L6 12 M18 12 L22 12" strokeWidth="2" />
        <path d="M5 5 L8 8 M16 16 L19 19 M5 19 L8 16 M16 8 L19 5" strokeWidth="2" />
        <circle cx="12" cy="2" r="1.5" fill={color} />
        <circle cx="12" cy="22" r="1.5" fill={color} />
        <circle cx="2" cy="12" r="1.5" fill={color} />
        <circle cx="22" cy="12" r="1.5" fill={color} />
        <circle cx="5" cy="5" r="1.5" fill={color} opacity="0.6" />
        <circle cx="19" cy="19" r="1.5" fill={color} opacity="0.6" />
        <circle cx="5" cy="19" r="1.5" fill={color} opacity="0.6" />
        <circle cx="19" cy="5" r="1.5" fill={color} opacity="0.6" />
      </>
    ),

    // 🌍 Globe - Languages/World
    globe: (
      <>
        <circle cx="12" cy="12" r="9" strokeWidth="2" />
        <ellipse cx="12" cy="12" rx="4" ry="9" strokeWidth="1.5" />
        <path d="M3 12 L21 12" strokeWidth="1.5" />
        <path d="M4 8 C6 8, 8 8.5, 12 8.5 C16 8.5, 18 8, 20 8" strokeWidth="1" opacity="0.6" />
        <path d="M4 16 C6 16, 8 15.5, 12 15.5 C16 15.5, 18 16, 20 16" strokeWidth="1" opacity="0.6" />
        <path d="M7 5 C8 6, 10 7, 12 7 C14 7, 16 6, 17 5" strokeWidth="1" opacity="0.5" />
        <path d="M7 19 C8 18, 10 17, 12 17 C14 17, 16 18, 17 19" strokeWidth="1" opacity="0.5" />
      </>
    ),

    // ✦ Star ornament - Highlights/Special
    star: (
      <>
        <path d="M12 2 L14 9 L21 9 L15 14 L18 21 L12 16 L6 21 L9 14 L3 9 L10 9 Z"
              fill={color} opacity="0.3" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" fill="none" strokeWidth="1.5" />
        <circle cx="12" cy="2" r="1" fill={color} />
        <circle cx="21" cy="9" r="1" fill={color} />
        <circle cx="18" cy="21" r="1" fill={color} />
        <circle cx="6" cy="21" r="1" fill={color} />
        <circle cx="3" cy="9" r="1" fill={color} />
      </>
    )
  };

  return (
    <svg {...svgProps}>
      {icons[name] || icons.scroll}
    </svg>
  );
};

export default ManuscriptIcon;
