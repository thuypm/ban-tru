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
const setJSonData = (val) => {
  return (jsonData = val);
};

const syncData = async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet("cs1");

  if (!worksheet) {
    console.error(`Sheet "cs1" không tồn tại.`);
    process.exit(1);
  }

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Bỏ qua tiêu đề
    const itemCode = row.getCell(1).value;

    jsonData.forEach((item) => {
      if (item.code === itemCode) item.isRegister = true;
    });
  });

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
  setJSonData,
};
