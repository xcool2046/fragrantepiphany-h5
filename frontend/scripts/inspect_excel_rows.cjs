
const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('/home/code/h5-web/assets/感情解析.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log('Row 0:', JSON.stringify(rawData[0]));
console.log('Row 1:', JSON.stringify(rawData[1]));
console.log('Row 2:', JSON.stringify(rawData[2]));
