const ExcelJS = require("exceljs");
const path = require("path");
const { setRootData } = require("../syncData");

// Đường dẫn file Excel nguồn
const sourceUrl = path.resolve(
  "E:/OneDrive - Marie Curie/11. bán trú/đăng ký bán trú hằng ngày 2.xlsx"
);

// Hàm đọc và chuyển đổi dữ liệu
async function copyAllRootData() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(sourceUrl);
  const worksheet = workbook.worksheets[0]; // Lấy sheet đầu tiên

  const jsonData = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Bỏ qua dòng tiêu đề

    const item = {
      code: row.getCell(2).value, // Cột B
      name: row.getCell(3).value, // Cột C
      class: row.getCell(4).value, // Cột D
      teacher: row.getCell(7).value, // Cột G
      location: row.getCell(8).value, // Cột H
    };

    jsonData.push(item);
  });

  setRootData(jsonData);
}
module.exports = {
  copyAllRootData,
};
