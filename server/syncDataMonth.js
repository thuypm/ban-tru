const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const fileMC1 = path.join(__dirname, "copybt", "BT_MC1.xlsx");
const fileMC2 = path.join(__dirname, "copybt", "BT_MC2.xlsx");

function getDiffDays(base, current) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());
  const utc2 = Date.UTC(
    current.getFullYear(),
    current.getMonth(),
    current.getDate()
  );
  return Math.floor((utc2 - utc1) / msPerDay);
}

let rootMC1 = [];
let rootMC2 = [];

// Map header VN → EN
const headerMap = {
  VNEDUID: "VNEDUID",
  "HỌ TÊN HS": "fullName",
  "NGÀY SINH": "dob",
  "Giới tính": "gender",
  "CƠ SỞ": "branch",
  LỚP: "class",
  "SĐT PH": "parentPhone",
  "MÃ PHÒNG": "roomCode",
  "PHÒNG NGỦ": "sleepRoom",
  "PHÒNG ĂN": "diningRoom",
};

async function extractData(filePath, branch = "MC1") {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const ws = workbook.worksheets[0]; // sheet đầu tiên

  // Header từ A → J (trim trước khi map)
  const headers = ws
    .getRow(1)
    .values.slice(1, 11)
    .map((h) => (h ? String(h).trim() : ""));

  const result = [];

  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // bỏ header
    const obj = {};

    // Xử lý các cột A → J
    headers.forEach((vnHeader, idx) => {
      const enKey = headerMap[vnHeader];
      if (!enKey) return;

      const cell = row.getCell(idx + 1);
      obj[enKey] =
        cell.result !== undefined
          ? cell.result
          : cell.value !== null && typeof cell.value === "object"
          ? cell.value.text || cell.value.result || null
          : cell.value;
    });

    // Nếu không có VNEDUID thì bỏ qua
    if (!obj.VNEDUID) return;

    // ✅ Lấy tất cả cột ngày trong tháng hiện tại
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();

    const registers = [];

    // Bắt đầu từ cột K (index = 11) tới hết
    const headerRow = ws.getRow(1);
    for (let colIndex = 11; colIndex <= headerRow.cellCount; colIndex++) {
      const headerCell = headerRow.getCell(colIndex);
      const headerText = headerCell.value
        ? String(headerCell.value).trim()
        : "";

      if (!headerText) continue;

      // Giả sử header dạng "dd/MM (T2)" → tách dd/MM
      const datePart = headerText.split(" ")[0]; // "08/09"
      const [day, month] = datePart.split("/").map((n) => parseInt(n, 10));

      if (month - 1 !== currentMonth) continue; // chỉ lấy ngày trong tháng hiện tại

      const fullDate = new Date(currentYear, month - 1, day);

      const dateCell = row.getCell(colIndex);
      let rawValue =
        dateCell.result !== undefined
          ? dateCell.result
          : dateCell.value !== null && typeof dateCell.value === "object"
          ? dateCell.value.text || dateCell.value.result || null
          : dateCell.value;

      rawValue = rawValue ? String(rawValue).trim().toLowerCase() : "";

      registers.push({
        date: fullDate.toISOString().split("T")[0], // YYYY-MM-DD
        isRegister: rawValue === "x",
      });
    }

    // Thêm field mới
    obj.registers = registers;

    // Giữ các field cũ
    obj.tick = false;
    obj.checkTime = [];
    obj.branch = branch;

    result.push(obj);
  });

  return result;
}

const syncDataMonth = async () => {
  rootMC1 = await extractData(fileMC1, "MC1");
  rootMC2 = await extractData(fileMC2, "MC2");
  // fs.writeFileSync("rootMC1.json", JSON.stringify(rootMC1, null, 2), "utf8");
  //fs.writeFileSync("rootMC2.json", JSON.stringify(rootMC2, null, 2), "utf8");
  console.log("Đã sync rootMC1 & rootMC2 thành công");
};
const tickUpdateData = (code) => {
  rootMC1 = rootMC1.map((item) => {
    if (item.VNEDUID === code) {
      return {
        ...item,
        tick: true,
        checkTime: [...item.checkTime, new Date()],
      };
    }
    return item;
  });
  rootMC2 = rootMC2.map((item) => {
    if (item.VNEDUID === code) {
      return {
        ...item,
        tick: true,
        checkTime: [...item.checkTime, new Date()],
      };
    }
    return item;
  });
};
const getRootMC1 = () => rootMC1;
const getRootMC2 = () => rootMC2;
const getJsonData = () => {
  return [...getRootMC1(), ...getRootMC2()];
};
const exportToJson = (fileName, data) => {
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2), "utf8");
  console.log(`Đã ghi dữ liệu ra ${fileName}`);
};

// // Chạy thử để kiểm tra
// (async () => {
//   await syncRootData();

//   // exportToJson("rootMC1.json", getRootMC1());
//   // exportToJson("rootMC2.json", getRootMC2());
// })();

module.exports = {
  tickUpdateData,
  syncRootData,
  getRootMC1,
  getRootMC2,
  getJsonData,
};
