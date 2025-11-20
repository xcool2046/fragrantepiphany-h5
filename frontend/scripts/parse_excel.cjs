
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = '/home/code/h5-web/assets/感情解析.xlsx';
const OUTPUT_PATH = '/home/code/h5-web/frontend/src/assets/tarot_data.json';
const START_IMG_ID = 4773;

try {
  const workbook = XLSX.readFile(EXCEL_PATH);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  // Use header: 1 to get array of arrays
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Skip header row (index 0)
  const dataRows = rawData.slice(1);

  const processedData = dataRows.map((row, index) => {
    // Stop if row is empty or doesn't have enough data
    if (!row || row.length < 2) return null;

    return {
      id: index, // 0-77
      image: `IMG_${START_IMG_ID + index}.JPG`,
      name_en: row[0],
      name_cn: row[1],
      meaning: {
        past: row[2],
        present: row[3],
        future: row[4]
      }
    };
  }).filter(item => item !== null);

  // Ensure directory exists
  const dir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(processedData, null, 2));
  console.log(`Successfully wrote ${processedData.length} cards to ${OUTPUT_PATH}`);

} catch (error) {
  console.error('Error parsing Excel:', error);
  process.exit(1);
}
