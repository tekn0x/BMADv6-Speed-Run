#!/usr/bin/env node

/**
 * Convert SVG icons to PNG format using sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const iconsDir = path.join(__dirname, '../public/icons');

async function convertIcons() {
  console.log('Converting SVG icons to PNG...\n');

  const conversions = [
    { input: 'icon-192.svg', output: 'icon-192.png', size: 192 },
    { input: 'icon-512.svg', output: 'icon-512.png', size: 512 },
    { input: 'maskable-icon.svg', output: 'maskable-icon.png', size: 512 }
  ];

  for (const { input, output, size } of conversions) {
    const inputPath = path.join(iconsDir, input);
    const outputPath = path.join(iconsDir, output);

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

  console.log('\n✅ PNG conversion complete!\n');
}

convertIcons().catch(console.error);
