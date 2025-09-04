const ExcelJS = require("exceljs");
const filePath = "E:/OneDrive - Marie Curie/11. bán trú/Diem danh ban tru.xlsx";
let jsonData = [
  {
    id: "S001",
    code: "113001",
    name: "Nguyễn Văn A",
    class: "10A1",
    teacher: "Cô Lan",
    location: "Phòng 101",
    tick: false,
    time: [],
    lastedCheck: null,
    isRegister: false,
  },
  {
    id: "S002",
    code: "113002",
    name: "Trần Thị B",
    class: "10A2",
    teacher: "Thầy Minh",
    location: "Phòng 102",
    tick: false,
    time: [],
    lastedCheck: null,
    isRegister: false,
  },
  {
    id: "S003",
    code: "113003",
    name: "Lê Văn C",
    class: "10A3",
    teacher: "Cô Hằng",
    location: "Phòng 103",
    tick: false,
    time: [],
    lastedCheck: null,
    isRegister: false,
  },
  {
    id: "S004",
    code: "113004",
    name: "Phạm Thị D",
    class: "10A4",
    teacher: "Thầy Sơn",
    location: "Phòng 104",
    tick: false,
    time: [],
    lastedCheck: null,
    isRegister: false,
  },
  {
    id: "S005",
    code: "113005",
    name: "Hoàng Văn E",
    class: "10A5",
    teacher: "Cô Mai",
    location: "Phòng 105",
    tick: false,
    time: [],
    lastedCheck: null,
    isRegister: false,
  },
  {
    id: "S006",
    code: "113006",
    name: "Ngô Thị F",
    class: "11A1",
    teacher: "Thầy Quân",
    location: "Phòng 201",
    tick: false,
    time: [],
    lastedCheck: null,
    isRegister: false,
  },
  {
    id: "S007",
    code: "113007",
    name: "Đỗ Văn G",
    class: "11A2",
    teacher: "Cô Hương",
    location: "Phòng 202",
    tick: false,
    time: [],
    lastedCheck: null,
    isRegister: false,
  },
  {
    id: "S008",
    code: "113008",
    name: "Bùi Thị H",
    class: "11A3",
    teacher: "Thầy Nam",
    location: "Phòng 203",
    tick: false,
    time: [],
    lastedCheck: null,
    isRegister: false,
  },
  {
    id: "S009",
    code: "113009",
    name: "Phan Văn I",
    class: "12A1",
    teacher: "Cô Yến",
    location: "Phòng 301",
    tick: false,
    time: [],
    lastedCheck: null,
    isRegister: false,
  },
  {
    id: "S010",
    code: "113010",
    name: "Vũ Thị K",
    class: "12A2",
    teacher: "Thầy Phúc",
    location: "Phòng 302",
    tick: false,
    time: [],
    lastedCheck: null,
    isRegister: false,
  },
];
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
