const xlsx = require("xlsx");
const fs = require("fs");

// Đọc file Excel
const filePath = "E:/OneDrive - Marie Curie/11. bán trú/Diem danh ban tru.xlsx";
const workbook = xlsx.readFile(filePath);

// Chọn sheet 'cs1'
const sheetName = "cs1";
const worksheet = workbook.Sheets[sheetName];

if (!worksheet) {
  console.error(`Sheet "${sheetName}" không tồn tại.`);
  process.exit(1);
}
let jsonData = [];
const syncData = () => {
  // Chuyển đổi dữ liệu sang JSON
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

  // Lọc dữ liệu từ A đến G, bỏ qua dòng tiêu đề
  const json = data.slice(1).map((row) => ({
    code: row[0], // Cột A
    name: row[1], // Cột B
    class: row[2], // Cột C
    teacher: row[5], // Cột F
    location: row[6], // Cột G
    tick: false,
    time: new Date().valueOf(),
  }));

  // Ghi dữ liệu vào file JSON
  //   const outputFilePath = "./output.json";
  //   fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2), "utf-8");
  console.log(`Dữ liệu đã được trích xuất thành công `);
  jsonData = json.filter((e) => e.code);
};
const getJsonData = () => {
  return jsonData;
};
const tickUpdateData = (code) => {
  jsonData.forEach((item) => {
    if (item.code === code) item.tick = true;
  });
};
module.exports = {
  syncData,
  getJsonData,
  tickUpdateData,
};
