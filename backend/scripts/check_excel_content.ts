
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const EXCEL_DIR = '/home/code/h5-web/assets/excel_files';
const FILES = ['自我正式.xlsx', '感情正式.xlsx'];

async function checkExcelFiles() {
  console.log(`Checking Excel files in ${EXCEL_DIR}...`);

  for (const file of FILES) {
    const filePath = path.join(EXCEL_DIR, file);
    if (!fs.existsSync(filePath)) {
      console.error(`[MISSING] ${file} not found at ${filePath}`);
      continue;
    }

    console.log(`\nAnalyzing ${file}...`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    if (data.length === 0) {
      console.log(`[EMPTY] ${file} is empty.`);
      continue;
    }

    const headers = data[0] as string[];
    console.log(`Headers: ${headers.join(', ')}`);

    const pastEnIndex = headers.findIndex(h => h && h.includes('past_en'));
    const presentEnIndex = headers.findIndex(h => h && h.includes('present_en'));
    const futureEnIndex = headers.findIndex(h => h && h.includes('future_en'));
    const sentenceEnIndex = headers.findIndex(h => h && h.includes('sentence_en'));

    console.log(`Column Indices: past_en=${pastEnIndex}, present_en=${presentEnIndex}, future_en=${futureEnIndex}, sentence_en=${sentenceEnIndex}`);

    if (pastEnIndex === -1 && presentEnIndex === -1 && futureEnIndex === -1) {
      console.log(`[FAIL] No English columns found in ${file}.`);
    } else {
      // Check first few rows for data
      let populatedCount = 0;
      const checkRows = Math.min(data.length, 6); // Check first 5 data rows
      for (let i = 1; i < checkRows; i++) {
        const row = data[i];
        const hasData = (pastEnIndex > -1 && row[pastEnIndex]) || 
                        (presentEnIndex > -1 && row[presentEnIndex]) || 
                        (futureEnIndex > -1 && row[futureEnIndex]);
        if (hasData) populatedCount++;
      }
      
      if (populatedCount > 0) {
        console.log(`[SUCCESS] Found English data in ${populatedCount}/${checkRows-1} checked rows.`);
        console.log('Sample Data (First 2 rows):');
        console.log(JSON.stringify(data.slice(1, 3), null, 2));
        console.log('First column sample:', data[1][0], data[2][0]);
      } else {
        console.log(`[FAIL] English columns exist but appear empty in first few rows.`);
      }
    }
  }
}

checkExcelFiles();
