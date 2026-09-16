const xlsx = require('xlsx');
const workbook = xlsx.readFile('uploads/6db1308f6ae5bd8fe0a71b66b255d7c0');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet);
console.log('Headers:', Object.keys(data[0]));
console.log('Sample Row 1:', data[0]);
