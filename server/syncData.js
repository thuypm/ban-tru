const ExcelJS = require("exceljs");
const filePath = "E:/OneDrive - Marie Curie/11. bán trú/Diem danh ban tru.xlsx";
let jsonData = [];
let rootData = [];

let MC2JsonData = [];
const getMC2RootData = () => {
  return MC2JsonData;
};
const setMC2JSonData = (val) => {
  MC2JsonData = val;
};

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
  const MC2worksheet = workbook.getWorksheet("cs2");

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Bỏ qua tiêu đề
    const itemCode = row.getCell(1).value;

    jsonData.forEach((item) => {
      if (item.id === itemCode) item.isRegister = true;
    });
  });

  MC2worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Bỏ qua tiêu đề
    const itemCode = row.getCell(2).value;
    MC2JsonData.forEach((item) => {
      if (item.id === itemCode) item.isRegister = true;
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
    if (item.code === code) {
      const timeCurrent = new Date().valueOf();
      item.tick = true;
      item.lastedCheck = timeCurrent;
      item.time = item.time?.length
        ? [timeCurrent, ...item.time]
        : [timeCurrent];
    }
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
  getMC2RootData,
  setMC2JSonData,
};
