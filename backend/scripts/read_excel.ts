import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = '/home/code/h5-web/perfume.xlsx';
console.log('Reading file:', filePath);

if (!fs.existsSync(filePath)) {
  console.error('File not found');
  process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const SCENE_MAP: Record<string, string> = {
  "A. 玫瑰": "初夏清晨的玫瑰园",
  "B. 暖木": "午后被阳光烘暖的木质家具",
  "C. 咖啡馆": "夜晚咖啡馆飘出的烘焙香气",
  "D. 白皂": "海边度假时的白色香皂"
};

const rawData = XLSX.utils.sheet_to_json(sheet);
const processedData = rawData.map((row: any) => {
  const sceneKey = row['氣息選擇']?.trim();
  const sceneChoice = SCENE_MAP[sceneKey] || sceneKey;
  
  // Extract brand (simple heuristic: first word)
  const fullName = row['推薦香水']?.trim() || '';
  const firstSpace = fullName.indexOf(' ');
  const brandName = firstSpace > 0 ? fullName.substring(0, firstSpace) : fullName;
  
  return {
    card_name: row['塔羅牌'],
    scene_choice: sceneChoice,
    brand_name: brandName,
    product_name: fullName,
    tags: [row['香調特點']], // Put notes in tags for now
    description: row['感情方向推薦理由'],
    notes_top: row['香調特點'], // Also put in notes_top
    image_url: '/assets/perfume/perfume_sample.png' // Placeholder
  };
});

const outputPath = path.resolve(__dirname, '../src/migrations/perfumes_data.json');
fs.writeFileSync(outputPath, JSON.stringify(processedData, null, 2));
console.log(`Wrote ${processedData.length} records to ${outputPath}`);
