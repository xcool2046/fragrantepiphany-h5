
import * as XLSX from 'xlsx';
import * as path from 'path';

const excelPath = path.resolve('/home/projects/h5/master (1).xlsx');

try {
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets['Perfume master'];
  const data = XLSX.utils.sheet_to_json(sheet);

  const tags = new Set<string>();

  for (const row of data as any[]) {
    if (row['Tag1']) tags.add(row['Tag1'].trim());
    if (row['Tag2']) tags.add(row['Tag2'].trim());
    if (row['Tag3']) tags.add(row['Tag3'].trim());
  }

  console.log('Unique Tags:', Array.from(tags).sort());

} catch (error) {
  console.error('Error reading Excel file:', error);
}
