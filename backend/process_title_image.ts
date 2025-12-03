import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const inputPath = path.join(__dirname, '../frontend/src/assets/home-title-zh.jpg');
const outputPath = path.join(__dirname, '../frontend/src/assets/home-title-zh.png');

async function processImage() {
  try {
    console.log(`Processing ${inputPath}...`);
    
    if (!fs.existsSync(inputPath)) {
      console.error('Input file not found!');
      process.exit(1);
    }

    await sharp(inputPath)
      .toFormat('png')
      .ensureAlpha() // Ensure alpha channel exists
      .raw() // Get raw pixel data
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Iterate through pixels and make white transparent
        // Assuming 4 channels (R, G, B, Alpha)
        const threshold = 240; // White threshold (0-255)

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If pixel is close to white
          if (r > threshold && g > threshold && b > threshold) {
            data[i + 3] = 0; // Set alpha to 0 (transparent)
          }
        }

        return sharp(data, {
          raw: {
            width: info.width,
            height: info.height,
            channels: 4
          }
        })
        .png()
        .toFile(outputPath);
      });

    console.log(`Successfully created ${outputPath}`);
  } catch (error) {
    console.error('Error processing image:', error);
    process.exit(1);
  }
}

processImage();
