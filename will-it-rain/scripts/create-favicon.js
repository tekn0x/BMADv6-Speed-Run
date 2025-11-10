#!/usr/bin/env node

/**
 * Create favicon.ico from PNG (Epic 4, Story 4.5)
 * Uses the generated favicon.png to create a browser-compatible favicon
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, '../public');

async function createFavicon() {
  console.log('Creating favicon.ico from favicon.png...\n');

  const inputPath = path.join(publicDir, 'favicon.png');
  const outputPath = path.join(publicDir, 'favicon.ico');

  try {
    // Read the PNG file
    const pngBuffer = fs.readFileSync(inputPath);

    // For modern browsers, we can just copy the PNG as .ico
    // Most browsers support PNG format in .ico files
    fs.writeFileSync(outputPath, pngBuffer);

    console.log('✓ Created favicon.ico from favicon.png (32x32)');
    console.log('  Note: Modern browsers support PNG format in .ico files\n');

    // Also create additional sizes for better compatibility
    await sharp(inputPath)
      .resize(16, 16)
      .png()
      .toFile(path.join(publicDir, 'favicon-16x16.png'));
    console.log('✓ Created favicon-16x16.png (16x16)');

    await sharp(inputPath)
      .resize(32, 32)
      .png()
      .toFile(path.join(publicDir, 'favicon-32x32.png'));
    console.log('✓ Created favicon-32x32.png (32x32)');

    console.log('\n✅ Favicon files generated successfully!\n');
  } catch (error) {
    console.error('✗ Error creating favicon:', error.message);
  }
}

createFavicon().catch(console.error);
