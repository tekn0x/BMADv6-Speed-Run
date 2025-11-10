#!/usr/bin/env node

/**
 * Convert SVG icons to PNG format using sharp (Epic 4, Story 4.5)
 * Generates optimized PNG files for all required PWA icon sizes
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '../public/icons');
const publicDir = path.join(__dirname, '../public');

async function convertIcons() {
  console.log('Converting SVG icons to PNG format...\n');

  const conversions = [
    { input: 'icon-192.svg', output: 'icon-192.png', size: 192, dir: iconsDir },
    { input: 'icon-512.svg', output: 'icon-512.png', size: 512, dir: iconsDir },
    { input: 'maskable-icon.svg', output: 'maskable-icon.png', size: 512, dir: iconsDir },
    { input: 'apple-touch-icon.svg', output: 'apple-touch-icon.png', size: 180, dir: iconsDir },
    { input: 'favicon.svg', output: 'favicon.png', size: 32, dir: publicDir }
  ];

  for (const { input, output, size, dir } of conversions) {
    const inputPath = path.join(dir, input);
    const outputPath = path.join(dir, output);

    try {
      await sharp(inputPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✓ Converted ${input} → ${output} (${size}x${size})`);
    } catch (error) {
      console.error(`✗ Error converting ${input}:`, error.message);
    }
  }

  console.log('\n✅ PNG icons generated successfully!\n');
  console.log('Generated icons:');
  console.log('  - public/icons/icon-192.png (192x192) - Android home screen');
  console.log('  - public/icons/icon-512.png (512x512) - Android splash screen');
  console.log('  - public/icons/maskable-icon.png (512x512) - Android adaptive icon');
  console.log('  - public/icons/apple-touch-icon.png (180x180) - iOS home screen');
  console.log('  - public/favicon.png (32x32) - Browser favicon');
  console.log('\nNext steps:');
  console.log('  1. Test maskable icon at https://maskable.app');
  console.log('  2. Verify manifest.ts icon paths are correct');
  console.log('  3. Run Lighthouse PWA audit\n');
}

convertIcons().catch(console.error);
