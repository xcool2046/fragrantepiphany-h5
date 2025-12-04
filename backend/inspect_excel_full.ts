
import * as XLSX from 'xlsx';
import * as path from 'path';

const excelPath = path.resolve('/home/projects/h5/master (1).xlsx');

try {
  const workbook = XLSX.readFile(excelPath);
  
  console.log('Sheets:', workbook.SheetNames);

  for (const sheetName of workbook.SheetNames) {
    console.log(`\n--- Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];
    console.log('All Headers:', JSON.stringify(headers));
    
    const tagHeaders = headers.filter(h => h && (h.includes('Tag') || h.includes('标签')));
    console.log('Tag Headers found:', tagHeaders);

    // Print first 10 rows of data to see values for these headers
    const data = XLSX.utils.sheet_to_json(sheet).slice(0, 10);
    if (data.length > 0) {
        const tagRows = data.map(row => {
            const tagValues = {};
            tagHeaders.forEach(h => tagValues[h] = (row as any)[h]);
            return tagValues;
        });
        console.log('Sample Tag Values (First 10 rows):', JSON.stringify(tagRows, null, 2));
    }
  }

} catch (error) {
  console.error('Error reading Excel file:', error);
}
