const ExcelJS = require("exceljs");
const filePath = "E:/OneDrive - Marie Curie/11. bán trú/Diem danh ban tru.xlsx";
let jsonData = [];
let rootData = [];

const setRootData = (val) => {
  rootData = val;
};
const getRootData = (val) => {
  return rootData;
};

const syncData = async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet("cs1");

  if (!worksheet) {
    console.error(`Sheet "cs1" không tồn tại.`);
    process.exit(1);
  }

  const data = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Bỏ qua tiêu đề

    const rowData = {
      code: row.getCell(1).value, // Cột A
      name: row.getCell(2).value, // Cột B
      class: row.getCell(3).value, // Cột C
      teacher: row.getCell(6).value, // Cột F
      location: row.getCell(7).value, // Cột G
      tick: false,
      time: new Date().valueOf(),
    };

    if (rowData.code) {
      data.push(rowData);
    }
  });

  jsonData = data;
  console.log("Dữ liệu đã được trích xuất thành công");
};

const getJsonData = () => jsonData;

const resetData = () => {
  jsonData.forEach((e) => (e.tick = false));
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
  resetData,
  setRootData,
  getRootData,
};
