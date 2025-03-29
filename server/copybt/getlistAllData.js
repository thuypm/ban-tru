const ExcelJS = require("exceljs");
const path = require("path");
const { setJSonData, setMC2JSonData } = require("../syncData");

// Đường dẫn file Excel nguồn
const sourceUrl = path.resolve(
  "E:/OneDrive - Marie Curie/11. bán trú/đăng ký bán trú hằng ngày.xlsx"
);

// Hàm đọc và chuyển đổi dữ liệu
async function copyAllRootData() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(sourceUrl);
  const worksheet = workbook.worksheets[0]; // Lấy sheet đầu tiên

  const jsonData = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < 4) return; // Bỏ qua dòng tiêu đề

    const item = {
      id: row.getCell(2).value,
      code: row.getCell(3).value, // Cột B
      name: row.getCell(4).value, // Cột C
      class: row.getCell(5).value, // Cột D
      teacher: row.getCell(8).value?.trim(), // Cột G
      location: row.getCell(9).value?.trim(), // Cột H
      tick: false,
      time: [],
      lastedCheck: null,
      isRegister: false,
    };
    if (item.id) jsonData.push(item);
  });
  setJSonData(jsonData.filter((user) => user.code));

  const worksheetMC2 = workbook.worksheets[1]; // Lấy sheet đầu tiên

  const MC2JsonData = [];

  worksheetMC2.eachRow((row, rowNumber) => {
    if (rowNumber < 4) return; // Bỏ qua dòng tiêu đề
    const item = {
      id: row.getCell(2).value,
      code: row.getCell(1).value, // Cột B
      name: row.getCell(3).value, // Cột C
      class: row.getCell(4).value, // Cột D
      teacher: row.getCell(6).value?.trim(), // Cột G
      location: null, // Cột H
      tick: false,
      time: [],
      lastedCheck: null,
      isRegister: false,
    };
    if (item.id) MC2JsonData.push(item);
  });

  setMC2JSonData(MC2JsonData);
}
module.exports = {
  copyAllRootData,
};
