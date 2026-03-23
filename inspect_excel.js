const XLSX = require("xlsx");
const path = require("path");

const filePath = path.join(__dirname, "ارقام التليفونات.xlsx");
const wb = XLSX.readFile(filePath);

console.log("Sheets:", wb.SheetNames);

wb.SheetNames.forEach((sheetName) => {
  console.log(`\n=== Sheet: ${sheetName} ===`);
  const ws = wb.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  // Print first 30 rows
  data.slice(0, 30).forEach((row, i) => {
    console.log(`Row ${i}:`, JSON.stringify(row));
  });
  console.log(`Total rows: ${data.length}`);
});
