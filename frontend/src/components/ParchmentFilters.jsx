/**
 * ParchmentFilters - SVG filter definitions for aged parchment texture
 * Creates authentic old paper feel with noise, spots, and wear
 */

import React from 'react';

const ParchmentFilters = () => {
  return (
    <svg
      style={{
        height: 0,
        width: 0,
        position: 'absolute',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <defs>
        {/* Main parchment texture filter - combines noise and spots */}
        <filter id="parchmentTexture" x="0%" y="0%" width="100%" height="100%">
          {/* Base fractal noise for paper fiber texture */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            result="noise"
          />

          {/* Desaturate the noise to grayscale */}
          <feColorMatrix
            in="noise"
            type="saturate"
            values="0"
            result="desaturatedNoise"
          />

          {/* Aging spots and stains */}
          <feTurbulence
            type="turbulence"
            baseFrequency="0.02"
            numOctaves="3"
            result="spots"
          />

          {/* Blend noise and spots */}
          <feBlend
            in="desaturatedNoise"
            in2="spots"
            mode="multiply"
            result="combined"
          />

          {/* Adjust opacity for subtlety */}
          <feComponentTransfer in="combined" result="final">
            <feFuncA type="linear" slope="0.08" />
          </feComponentTransfer>

          {/* Composite with source to preserve original colors */}
          <feComposite
            in="SourceGraphic"
            in2="final"
            operator="over"
            result="output"
          />
        </filter>

        {/* Ink stain filter - for interactive ink ripple effects */}
        <filter id="inkStain" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur" />

          {/* Create irregular ink spread */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.1"
            numOctaves="2"
            result="turbulence"
          />

          <feDisplacementMap
            in="blur"
            in2="turbulence"
            scale="15"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />

          {/* Color the ink */}
          <feFlood floodColor="rgba(62, 39, 35, 0.15)" result="inkColor" />

          <feComposite
            in="inkColor"
            in2="displaced"
            operator="in"
            result="coloredInk"
          />

          {/* Merge with original */}
          <feMerge>
            <feMergeNode in="coloredInk" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Paper edge wear filter - for scroll effects */}
        <filter id="paperWear" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05"
            numOctaves="3"
            result="edgeNoise"
          />

          <feDisplacementMap
            in="SourceGraphic"
            in2="edgeNoise"
            scale="8"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Gentle vignette for depth */}
        <filter id="parchmentVignette">
          <feGaussianBlur in="SourceAlpha" stdDeviation="30" result="blur" />
          <feOffset in="blur" dx="0" dy="0" result="offsetBlur" />
          <feFlood floodColor="#5D4037" floodOpacity="0.15" result="color" />
          <feComposite in="color" in2="offsetBlur" operator="in" result="shadow" />

          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="shadow" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
};

export default ParchmentFilters;
