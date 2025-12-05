
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const files = ['master.xlsx', 'master (1).xlsx', 'master (2).xlsx'];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }

  console.log(`\n--- Inspecting ${file} ---`);
  const workbook = XLSX.readFile(filePath);
  const sheetName = 'Perfume master';
  if (!workbook.Sheets[sheetName]) {
    console.log(`Sheet "${sheetName}" not found.`);
    // Try first sheet
    const firstSheet = workbook.SheetNames[0];
    console.log(`Using first sheet: ${firstSheet}`);
    const data = XLSX.utils.sheet_to_json<any>(workbook.Sheets[firstSheet]);
    findRow(data);
    return;
  }

  const data = XLSX.utils.sheet_to_json<any>(workbook.Sheets[sheetName]);
  findRow(data);
});

function findRow(data: any[]) {
  const row74 = data.find(r => r['UNIQUE ID'] == 74);
  if (row74) {
    console.log('Row with UNIQUE ID 74:', JSON.stringify(row74, null, 2));
  } else {
    console.log('Row with UNIQUE ID 74 not found.');
  }

  const diptyque = data.find(r => r['Brand'] === 'Diptyque' && r['Name'] === 'Eau des Sens');
  if (diptyque) {
    console.log('Row with Brand "Diptyque" and Name "Eau des Sens":', JSON.stringify(diptyque, null, 2));
  }
}
