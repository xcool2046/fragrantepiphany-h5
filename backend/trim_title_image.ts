import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const inputPath = path.join(__dirname, '../frontend/src/assets/home-title-zh.png');
const outputPath = path.join(__dirname, '../frontend/src/assets/home-title-zh-trimmed.png');

async function trimImage() {
  try {
    console.log(`Trimming ${inputPath}...`);
    
    if (!fs.existsSync(inputPath)) {
      console.error('Input file not found!');
      process.exit(1);
    }

    await sharp(inputPath)
      .trim() // Automatically removes transparent/solid background border
      .toFile(outputPath);

    console.log(`Successfully created ${outputPath}`);
    
    // Get dimensions of original and trimmed
    const originalMeta = await sharp(inputPath).metadata();
    const trimmedMeta = await sharp(outputPath).metadata();
    
    console.log(`Original: ${originalMeta.width}x${originalMeta.height}`);
    console.log(`Trimmed:  ${trimmedMeta.width}x${trimmedMeta.height}`);

  } catch (error) {
    console.error('Error processing image:', error);
    process.exit(1);
  }
}

trimImage();
