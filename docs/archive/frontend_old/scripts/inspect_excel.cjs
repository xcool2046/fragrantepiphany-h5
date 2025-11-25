
const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('/home/code/h5-web/assets/感情解析.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

console.log(JSON.stringify(jsonData[0]));
