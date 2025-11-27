
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const cards = [
  { id: 1, code: 'IMG_4773', image_url: '/assets/cards/IMG_4773.jpg' },
  { id: 2, code: 'IMG_4774', image_url: '/assets/cards/IMG_4774.jpg' },
  { id: 3, code: 'IMG_4775', image_url: '/assets/cards/IMG_4775.jpg' },
  { id: 4, code: 'IMG_4776', image_url: '/assets/cards/IMG_4776.jpg' },
  { id: 5, code: 'IMG_4777', image_url: '/assets/cards/IMG_4777.jpg' },
  { id: 6, code: 'IMG_4778', image_url: '/assets/cards/IMG_4778.jpg' },
  { id: 7, code: 'IMG_4779', image_url: '/assets/cards/IMG_4779.jpg' },
  { id: 8, code: 'IMG_4780', image_url: '/assets/cards/IMG_4780.jpg' },
  { id: 9, code: 'IMG_4781', image_url: '/assets/cards/IMG_4781.jpg' },
  { id: 10, code: 'IMG_4782', image_url: '/assets/cards/IMG_4782.jpg' },
  { id: 11, code: 'IMG_4783', image_url: '/assets/cards/IMG_4783.jpg' },
  { id: 12, code: 'IMG_4784', image_url: '/assets/cards/IMG_4784.jpg' },
  { id: 13, code: 'IMG_4785', image_url: '/assets/cards/IMG_4785.jpg' },
  { id: 14, code: 'IMG_4786', image_url: '/assets/cards/IMG_4786.jpg' },
  { id: 15, code: 'IMG_4787', image_url: '/assets/cards/IMG_4787.jpg' },
  { id: 16, code: 'IMG_4788', image_url: '/assets/cards/IMG_4788.jpg' },
  { id: 17, code: 'IMG_4789', image_url: '/assets/cards/IMG_4789.jpg' },
  { id: 18, code: 'IMG_4790', image_url: '/assets/cards/IMG_4790.jpg' },
  { id: 19, code: 'IMG_4791', image_url: '/assets/cards/IMG_4791.jpg' },
  { id: 20, code: 'IMG_4792', image_url: '/assets/cards/IMG_4792.jpg' },
  { id: 21, code: 'IMG_4793', image_url: '/assets/cards/IMG_4793.jpg' },
  { id: 22, code: 'IMG_4794', image_url: '/assets/cards/IMG_4794.jpg' },
  { id: 23, code: 'IMG_4795', image_url: '/assets/cards/IMG_4795.jpg' },
  { id: 24, code: 'IMG_4796', image_url: '/assets/cards/IMG_4796.jpg' },
  { id: 25, code: 'IMG_4797', image_url: '/assets/cards/IMG_4797.jpg' },
  { id: 26, code: 'IMG_4798', image_url: '/assets/cards/IMG_4798.jpg' },
  { id: 27, code: 'IMG_4799', image_url: '/assets/cards/IMG_4799.jpg' },
  { id: 28, code: 'IMG_4800', image_url: '/assets/cards/IMG_4800.jpg' },
  { id: 29, code: 'IMG_4801', image_url: '/assets/cards/IMG_4801.jpg' },
  { id: 30, code: 'IMG_4802', image_url: '/assets/cards/IMG_4802.jpg' },
  { id: 31, code: 'IMG_4803', image_url: '/assets/cards/IMG_4803.jpg' },
  { id: 32, code: 'IMG_4804', image_url: '/assets/cards/IMG_4804.jpg' },
  { id: 33, code: 'IMG_4805', image_url: '/assets/cards/IMG_4805.jpg' },
  { id: 34, code: 'IMG_4806', image_url: '/assets/cards/IMG_4806.jpg' },
  { id: 35, code: 'IMG_4807', image_url: '/assets/cards/IMG_4807.jpg' },
  { id: 36, code: 'IMG_4808', image_url: '/assets/cards/IMG_4808.jpg' },
  { id: 37, code: 'IMG_4809', image_url: '/assets/cards/IMG_4809.jpg' },
  { id: 38, code: 'IMG_4810', image_url: '/assets/cards/IMG_4810.jpg' },
  { id: 39, code: 'IMG_4811', image_url: '/assets/cards/IMG_4811.jpg' },
  { id: 40, code: 'IMG_4812', image_url: '/assets/cards/IMG_4812.jpg' },
  { id: 41, code: 'IMG_4813', image_url: '/assets/cards/IMG_4813.jpg' },
  { id: 42, code: 'IMG_4814', image_url: '/assets/cards/IMG_4814.jpg' },
  { id: 43, code: 'IMG_4815', image_url: '/assets/cards/IMG_4815.jpg' },
  { id: 44, code: 'IMG_4816', image_url: '/assets/cards/IMG_4816.jpg' },
  { id: 45, code: 'IMG_4817', image_url: '/assets/cards/IMG_4817.jpg' },
  { id: 46, code: 'IMG_4818', image_url: '/assets/cards/IMG_4818.jpg' },
  { id: 47, code: 'IMG_4819', image_url: '/assets/cards/IMG_4819.jpg' },
  { id: 48, code: 'IMG_4820', image_url: '/assets/cards/IMG_4820.jpg' },
  { id: 49, code: 'IMG_4821', image_url: '/assets/cards/IMG_4821.jpg' },
  { id: 50, code: 'IMG_4822', image_url: '/assets/cards/IMG_4822.jpg' },
  { id: 51, code: 'IMG_4823', image_url: '/assets/cards/IMG_4823.jpg' },
  { id: 52, code: 'IMG_4824', image_url: '/assets/cards/IMG_4824.jpg' },
  { id: 53, code: 'IMG_4825', image_url: '/assets/cards/IMG_4825.jpg' },
  { id: 54, code: 'IMG_4826', image_url: '/assets/cards/IMG_4826.jpg' },
  { id: 55, code: 'IMG_4827', image_url: '/assets/cards/IMG_4827.jpg' },
  { id: 56, code: 'IMG_4828', image_url: '/assets/cards/IMG_4828.jpg' },
  { id: 57, code: 'IMG_4829', image_url: '/assets/cards/IMG_4829.jpg' },
  { id: 58, code: 'IMG_4830', image_url: '/assets/cards/IMG_4830.jpg' },
  { id: 59, code: 'IMG_4831', image_url: '/assets/cards/IMG_4831.jpg' },
  { id: 60, code: 'IMG_4832', image_url: '/assets/cards/IMG_4832.jpg' },
  { id: 61, code: 'IMG_4833', image_url: '/assets/cards/IMG_4833.jpg' },
  { id: 62, code: 'IMG_4834', image_url: '/assets/cards/IMG_4834.jpg' },
  { id: 63, code: 'IMG_4835', image_url: '/assets/cards/IMG_4835.jpg' },
  { id: 64, code: 'IMG_4836', image_url: '/assets/cards/IMG_4836.jpg' },
  { id: 65, code: 'IMG_4837', image_url: '/assets/cards/IMG_4837.jpg' },
  { id: 66, code: 'IMG_4838', image_url: '/assets/cards/IMG_4838.jpg' },
  { id: 67, code: 'IMG_4839', image_url: '/assets/cards/IMG_4839.jpg' },
  { id: 68, code: 'IMG_4840', image_url: '/assets/cards/IMG_4840.jpg' },
  { id: 69, code: 'IMG_4841', image_url: '/assets/cards/IMG_4841.jpg' },
  { id: 70, code: 'IMG_4842', image_url: '/assets/cards/IMG_4842.jpg' },
  { id: 71, code: 'IMG_4843', image_url: '/assets/cards/IMG_4843.jpg' },
  { id: 72, code: 'IMG_4844', image_url: '/assets/cards/IMG_4844.jpg' },
  { id: 73, code: 'IMG_4845', image_url: '/assets/cards/IMG_4845.jpg' },
  { id: 74, code: 'IMG_4846', image_url: '/assets/cards/IMG_4846.jpg' },
  { id: 75, code: 'IMG_4847', image_url: '/assets/cards/IMG_4847.jpg' },
  { id: 76, code: 'IMG_4848', image_url: '/assets/cards/IMG_4848.jpg' },
  { id: 77, code: 'IMG_4849', image_url: '/assets/cards/IMG_4849.jpg' },
  { id: 78, code: 'IMG_4850', image_url: '/assets/cards/IMG_4850.jpg' },
];

const ASSETS_DIR = '/home/code/h5-web/frontend/public/assets/cards';

async function main() {
  console.log('Starting card renaming...');

  let sqlUpdates = '';

  for (const card of cards) {
    const newCode = card.id.toString().padStart(2, '0');
    const oldFilename = path.basename(card.image_url);
    const newFilename = `${newCode}.jpg`;
    
    const oldPath = path.join(ASSETS_DIR, oldFilename);
    const newPath = path.join(ASSETS_DIR, newFilename);

    // 1. Rename file
    if (fs.existsSync(oldPath)) {
      fs.renameSync(oldPath, newPath);
      console.log(`Renamed: ${oldFilename} -> ${newFilename}`);
    } else {
      console.warn(`File not found: ${oldPath}`);
      // If new file exists, assume it was already renamed
      if (!fs.existsSync(newPath)) {
        console.error(`Neither old nor new file exists for ID ${card.id}`);
      }
    }

    // 2. Generate SQL update
    const newImageUrl = `/assets/cards/${newFilename}`;
    sqlUpdates += `UPDATE cards SET code = '${newCode}', image_url = '${newImageUrl}' WHERE id = ${card.id};\n`;
  }

  // 3. Execute SQL updates
  if (sqlUpdates) {
    console.log('Updating database...');
    // Write SQL to a temp file
    fs.writeFileSync('update_cards.sql', sqlUpdates);
    
    // Execute via docker
    try {
      execSync('docker compose exec -T db psql -U tarot -d tarot -f /dev/stdin < update_cards.sql');
      console.log('Database updated successfully.');
    } catch (err) {
      console.error('Failed to update database:', err);
    } finally {
      fs.unlinkSync('update_cards.sql');
    }
  }

  console.log('Done.');
}

main();
