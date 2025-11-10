#!/usr/bin/env node

/**
 * Icon generator for "Will It Rain" PWA (Epic 4, Story 4.5)
 * Generates all required icon sizes for PWA compliance:
 * - 192x192, 512x512: Android PWA standard icons
 * - 512x512 maskable: Android adaptive icon with 80% safe zone
 * - 180x180: Apple touch icon for iOS
 * - 32x32: Favicon
 *
 * Design: Simple raindrop icon representing the "Will It Rain" app
 */

const fs = require('fs');
const path = require('path');

// Enhanced raindrop icon design
const createIconSVG = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background matching app theme (#000000) -->
  <rect width="${size}" height="${size}" fill="#000000"/>

  <!-- Raindrop with modern gradient -->
  <defs>
    <linearGradient id="dropGradient-${size}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#60A5FA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="highlight-${size}" cx="30%" cy="30%">
      <stop offset="0%" style="stop-color:#93C5FD;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#60A5FA;stop-opacity:0" />
    </radialGradient>
  </defs>

  <g transform="translate(${size/2}, ${size/2})">
    <!-- Main raindrop shape -->
    <path
      d="M 0,-${size*0.25}
         C -${size*0.15},-${size*0.25} -${size*0.15},${size*0.05} 0,${size*0.25}
         C ${size*0.15},${size*0.05} ${size*0.15},-${size*0.25} 0,-${size*0.25}
         Z"
      fill="url(#dropGradient-${size})"
      stroke="#2563EB"
      stroke-width="${Math.max(2, size/100)}"
    />

    <!-- Highlight -->
    <ellipse
      cx="-${size*0.06}"
      cy="-${size*0.12}"
      rx="${size*0.05}"
      ry="${size*0.08}"
      fill="url(#highlight-${size})"
    />
  </g>
</svg>`;

// Create maskable icon with 80% safe zone (40px padding on 512px canvas)
const createMaskableIconSVG = (size) => {
  // Maskable icons must keep content within 80% safe zone
  const scale = 0.8;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <!-- Dark background matching app theme (#000000) -->
  <rect width="${size}" height="${size}" fill="#000000"/>

  <!-- Raindrop with modern gradient - scaled for safe zone -->
  <defs>
    <linearGradient id="dropGradient-maskable-${size}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#60A5FA;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
    </linearGradient>
    <radialGradient id="highlight-maskable-${size}" cx="30%" cy="30%">
      <stop offset="0%" style="stop-color:#93C5FD;stop-opacity:0.8" />
      <stop offset="100%" style="stop-color:#60A5FA;stop-opacity:0" />
    </radialGradient>
  </defs>

  <g transform="translate(${size/2}, ${size/2})">
    <!-- Main raindrop shape - scaled to fit safe zone -->
    <path
      d="M 0,-${size*0.25*scale}
         C -${size*0.15*scale},-${size*0.25*scale} -${size*0.15*scale},${size*0.05*scale} 0,${size*0.25*scale}
         C ${size*0.15*scale},${size*0.05*scale} ${size*0.15*scale},-${size*0.25*scale} 0,-${size*0.25*scale}
         Z"
      fill="url(#dropGradient-maskable-${size})"
      stroke="#2563EB"
      stroke-width="${Math.max(2, size/100)}"
    />

    <!-- Highlight -->
    <ellipse
      cx="-${size*0.06*scale}"
      cy="-${size*0.12*scale}"
      rx="${size*0.05*scale}"
      ry="${size*0.08*scale}"
      fill="url(#highlight-maskable-${size})"
    />
  </g>
</svg>`;
};

// Output directories
const iconsDir = path.join(__dirname, '../public/icons');
const publicDir = path.join(__dirname, '../public');

// Ensure directories exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA icons for "Will It Rain" (Epic 4, Story 4.5)...\n');

// All required icons for PWA compliance
const icons = [
  { name: 'icon-192.png', size: 192, isMaskable: false, dir: iconsDir },
  { name: 'icon-512.png', size: 512, isMaskable: false, dir: iconsDir },
  { name: 'maskable-icon.png', size: 512, isMaskable: true, dir: iconsDir },
  { name: 'apple-touch-icon.png', size: 180, isMaskable: false, dir: iconsDir },
  { name: 'favicon.png', size: 32, isMaskable: false, dir: publicDir }
];

// Generate SVG files
icons.forEach(({ name, size, isMaskable, dir }) => {
  const svgContent = isMaskable ? createMaskableIconSVG(size) : createIconSVG(size);
  const svgPath = path.join(dir, name.replace('.png', '.svg'));

  fs.writeFileSync(svgPath, svgContent);
  console.log(`✓ Created ${name.replace('.png', '.svg')} (${size}x${size})`);
});

console.log('\n📝 SVG icons created. Converting to PNG...\n');
console.log('   Run: npm run convert-icons (uses sharp for PNG conversion)\n');
console.log('Icon locations:');
console.log('  - public/icons/icon-192.svg → .png (192x192)');
console.log('  - public/icons/icon-512.svg → .png (512x512)');
console.log('  - public/icons/maskable-icon.svg → .png (512x512 with safe zone)');
console.log('  - public/icons/apple-touch-icon.svg → .png (180x180)');
console.log('  - public/favicon.svg → .png (32x32)');
console.log('\nNext steps:');
console.log('  1. Convert SVGs to PNGs: npm run convert-icons');
console.log('  2. Test maskable icon at https://maskable.app');
console.log('  3. Verify manifest.ts references correct icon paths');
console.log('  4. Run Lighthouse PWA audit\n');
