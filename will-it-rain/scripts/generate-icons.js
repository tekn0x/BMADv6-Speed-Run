#!/usr/bin/env node

/**
 * Simple icon generator for Epic 1 placeholder icons
 * Generates SVG-based PNG icons without external dependencies
 *
 * This creates basic placeholder icons for Story 1.4
 * Professional icons will be created in Epic 4 Story 4.5
 */

const fs = require('fs');
const path = require('path');

// SVG template for a simple umbrella/rain icon
const createIconSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background matching theme -->
  <rect width="${size}" height="${size}" fill="#0a0a0a"/>

  <!-- Simple umbrella icon in light gray -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Umbrella arc -->
    <path d="M -${size/3} 0 Q -${size/3} -${size/3} 0 -${size/3} Q ${size/3} -${size/3} ${size/3} 0"
          fill="none"
          stroke="#e5e5e5"
          stroke-width="${size/30}"
          stroke-linecap="round"/>

    <!-- Handle -->
    <path d="M 0 -${size/12} L 0 ${size/4} Q ${size/8} ${size/3} ${size/6} ${size/4}"
          fill="none"
          stroke="#e5e5e5"
          stroke-width="${size/30}"
          stroke-linecap="round"/>

    <!-- Rain drops -->
    <circle cx="-${size/6}" cy="${size/8}" r="${size/40}" fill="#a1a1aa"/>
    <circle cx="0" cy="${size/6}" r="${size/40}" fill="#a1a1aa"/>
    <circle cx="${size/6}" cy="${size/8}" r="${size/40}" fill="#a1a1aa"/>
  </g>
</svg>`;

// Create maskable icon with safe zone (80% content in center)
const createMaskableIconSVG = (size) => {
  const safeSize = size * 0.8;
  const offset = size * 0.1;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background matching theme -->
  <rect width="${size}" height="${size}" fill="#0a0a0a"/>

  <!-- Content in safe zone (80% center) -->
  <g transform="translate(${size/2}, ${size/2})">
    <!-- Umbrella arc - scaled to fit safe zone -->
    <path d="M -${safeSize/3} 0 Q -${safeSize/3} -${safeSize/3} 0 -${safeSize/3} Q ${safeSize/3} -${safeSize/3} ${safeSize/3} 0"
          fill="none"
          stroke="#e5e5e5"
          stroke-width="${safeSize/30}"
          stroke-linecap="round"/>

    <!-- Handle -->
    <path d="M 0 -${safeSize/12} L 0 ${safeSize/4} Q ${safeSize/8} ${safeSize/3} ${safeSize/6} ${safeSize/4}"
          fill="none"
          stroke="#e5e5e5"
          stroke-width="${safeSize/30}"
          stroke-linecap="round"/>

    <!-- Rain drops -->
    <circle cx="-${safeSize/6}" cy="${safeSize/8}" r="${safeSize/40}" fill="#a1a1aa"/>
    <circle cx="0" cy="${safeSize/6}" r="${safeSize/40}" fill="#a1a1aa"/>
    <circle cx="${safeSize/6}" cy="${safeSize/8}" r="${safeSize/40}" fill="#a1a1aa"/>
  </g>
</svg>`;
};

// Output directory
const iconsDir = path.join(__dirname, '../public/icons');

// Ensure directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating placeholder PWA icons for Epic 1...\n');

// Generate SVG files (browsers can use these directly as PNGs aren't needed for basic testing)
const icons = [
  { name: 'icon-192.png', size: 192, isMaskable: false },
  { name: 'icon-512.png', size: 512, isMaskable: false },
  { name: 'maskable-icon.png', size: 512, isMaskable: true }
];

// For Epic 1, we'll create SVG versions that can be converted to PNG later
// This avoids dependency on canvas/sharp packages
icons.forEach(({ name, size, isMaskable }) => {
  const svgContent = isMaskable ? createMaskableIconSVG(size) : createIconSVG(size);
  const svgPath = path.join(iconsDir, name.replace('.png', '.svg'));

  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created ${name.replace('.png', '.svg')} (${size}x${size})`);
});

console.log('\nℹ️  Note: SVG icons created for Epic 1 foundation');
console.log('   For production (Epic 4), convert these to PNG format');
console.log('   or use professional icon design tools.\n');

// Also create PNG versions using data URLs (for immediate testing)
// This creates actual PNG files using canvas if available
try {
  const { createCanvas } = require('canvas');

  icons.forEach(({ name, size, isMaskable }) => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, size, size);

    const scale = isMaskable ? 0.8 : 1.0;
    const iconSize = size * scale;
    const offset = (size - iconSize) / 2;

    ctx.save();
    ctx.translate(size / 2, size / 2);

    // Draw umbrella arc
    ctx.strokeStyle = '#e5e5e5';
    ctx.lineWidth = iconSize / 30;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, 0, iconSize / 3, Math.PI, 0, true);
    ctx.stroke();

    // Draw handle
    ctx.beginPath();
    ctx.moveTo(0, -iconSize / 12);
    ctx.lineTo(0, iconSize / 4);
    ctx.quadraticCurveTo(iconSize / 8, iconSize / 3, iconSize / 6, iconSize / 4);
    ctx.stroke();

    // Draw rain drops
    ctx.fillStyle = '#a1a1aa';
    ctx.beginPath();
    ctx.arc(-iconSize / 6, iconSize / 8, iconSize / 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, iconSize / 6, iconSize / 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(iconSize / 6, iconSize / 8, iconSize / 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Save PNG
    const buffer = canvas.toBuffer('image/png');
    const pngPath = path.join(iconsDir, name);
    fs.writeFileSync(pngPath, buffer);
    console.log(`✓ Created PNG: ${name} (${size}x${size})`);
  });

  console.log('\n✅ PNG icons generated successfully using canvas!\n');
} catch (err) {
  console.log('\nℹ️  Canvas package not available - SVG icons created instead');
  console.log('   Rename .svg files to .png for basic PWA testing');
  console.log('   Or install canvas: npm install canvas --save-dev\n');
}
