
import * as fs from 'fs';
import * as path from 'path';

const files = ['perfume_translations_final.json', 'perfume_translations_batch1.json'];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`Checking ${file}...`);
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    
    // Search for Oud Satin Mood in 'zh' or 'en'
    const found = json.find((item: any) => 
      (item.zh && item.zh.includes('Oud Satin Mood')) || 
      (item.en && item.en.includes('Oud Satin Mood'))
    );

    if (found) {
      console.log(`Found in ${file}:`);
      console.log(JSON.stringify(found, null, 2));
    } else {
      console.log(`Not found in ${file}`);
    }
  } else {
    console.log(`${file} not found`);
  }
});
