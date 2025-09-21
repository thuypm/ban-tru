const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const fileMC1 = path.join(__dirname, "copybt", "BT_MC1.xlsx");
const fileMC2 = path.join(__dirname, "copybt", "BT_MC2.xlsx");

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
  "PHÒNG NGỦ": "sleepRoom",
  "PHÒNG ĂN": "diningRoom",
  "Ngày Đăng ký": "registerDate",
  "Ngày Hủy": "cancelDate",
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

  // Hàm format ngày dd/MM/yyyy
  function formatDate(d, m, y) {
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  }

  function formatExcelDate(value) {
    if (!value) return null;
    if (value instanceof Date) {
      return formatDate(
        value.getDate(),
        value.getMonth() + 1,
        value.getFullYear()
      );
    }
    if (typeof value === "object" && value.text) {
      return value.text;
    }
    return String(value).trim();
  }

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

    // ---- Thêm cột K, L ----
    const registerDateCell = row.getCell(11); // cột K
    const cancelDateCell = row.getCell(12); // cột L

    obj.registerDate = formatExcelDate(registerDateCell.value);

    let cancelDate = formatExcelDate(cancelDateCell.value);
    if (!cancelDate) {
      cancelDate = "31/06/2026";
    }
    obj.cancelDate = cancelDate;

    // ---- Xử lý các cột sau L (từ M trở đi) ----
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();

    const registers = [];

    const headerRow = ws.getRow(1);
    for (let colIndex = 13; colIndex <= headerRow.cellCount; colIndex++) {
      const headerCell = headerRow.getCell(colIndex);
      const headerText = headerCell.value
        ? String(headerCell.value).trim()
        : "";

      if (!headerText) continue;

      // Giả sử header dạng "dd/MM (T2)" → tách dd/MM
      const datePart = headerText.split(" ")[0];
      const [day, month] = datePart.split("/").map((n) => parseInt(n, 10));

      // 👉 Chỉ lấy từ tháng 9 → tháng hiện tại
      if (!(month >= 9 && month <= currentMonth)) continue;

      const dateStr = formatDate(day, month, currentYear);

      const dateCell = row.getCell(colIndex);
      let rawValue =
        dateCell.result !== undefined
          ? dateCell.result
          : dateCell.value !== null && typeof dateCell.value === "object"
          ? dateCell.value.text || dateCell.value.result || null
          : dateCell.value;

      rawValue = rawValue ? String(rawValue).trim().toLowerCase() : "";
      registers.push({
        date: dateStr,
        isRegister: rawValue === "1" ? true : rawValue !== null ? false : null,
      });
    }

    obj.registers = registers;
    // obj.tick = false;
    // obj.checkTime = [];
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
  // exportJsonToExcel(
  //   [...rootMC1, ...rootMC2],
  //   path.join(__dirname, "output.xlsx")
  // );
  const workbook = await exportJsonToExcel(
    [...rootMC1, ...rootMC2],
    null, // bỏ filePath
    true // flag để trả buffer
  );
  return workbook;
  // console.log("Đã sync rootMC1 & rootMC2 thành công");
};

async function exportJsonToExcel(data, filePath, returnBuffer = false) {
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Report");

  // === Lấy tất cả tháng từ registers ===
  const monthSet = new Set();
  data.forEach((row) => {
    row.registers.forEach((r) => {
      const [d, m, y] = r.date.split("/").map((x) => parseInt(x, 10));
      monthSet.add(`${m}/${y}`);
    });
  });
  const months = Array.from(monthSet).sort((a, b) => {
    const [ma, ya] = a.split("/").map(Number);
    const [mb, yb] = b.split("/").map(Number);
    return ya - yb || ma - mb;
  });

  // === Tạo reverse map EN -> VN ===
  const reverseHeaderMap = Object.fromEntries(
    Object.entries(headerMap).map(([vn, en]) => [en, vn])
  );

  // === Header hàng 1 ===
  const baseKeys = Object.keys(data[0]).filter((k) => k !== "registers");
  const headerRow1 = [];
  const headerRow2 = [];

  baseKeys.forEach((k) => {
    headerRow1.push(reverseHeaderMap[k] || k); // map ngược
    headerRow2.push(""); // hàng 2 để trống
  });

  months.forEach((m) => {
    headerRow1.push(m);
    headerRow1.push("");
    headerRow1.push("");
    headerRow2.push("Tổng ngày");
    headerRow2.push("ĐK");
    headerRow2.push("Hủy");
  });

  ws.addRow(headerRow1);
  ws.addRow(headerRow2);

  // Merge cell cho header tháng
  let colIndex = baseKeys.length + 1;
  months.forEach((m) => {
    ws.mergeCells(1, colIndex, 1, colIndex + 1);
    colIndex += 2;
  });

  // === Ghi dữ liệu ===
  data.forEach((row) => {
    const arr = [];
    baseKeys.forEach((k) => {
      arr.push(row[k]);
    });

    const map = {};
    months.forEach((m) => {
      map[m] = { total: row.registers.length, tick: 0, cancel: 0 };
    });
    row.registers.forEach((r) => {
      const [d, mm, yy] = r.date.split("/").map(Number);
      const key = `${mm}/${yy}`;
      if (map[key]) {
        if (r.isRegister) map[key].tick++;
        else map[key].cancel++;
      }
    });

    months.forEach((m) => {
      arr.push(map[m].total);

      arr.push(map[m].tick);
      arr.push(map[m].cancel);
    });

    ws.addRow(arr);
  });

  // format...
  ws.eachRow((row, rowNumber) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
    });
    if (rowNumber === 1 || rowNumber === 2) {
      row.font = { bold: true };
      row.alignment = { vertical: "middle", horizontal: "center" };
    }
  });

  ws.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const cellValue = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, cellValue.length + 2);
    });
    column.width = maxLength;
  });
  if (filePath) await workbook.xlsx.writeFile(filePath);
  if (returnBuffer) {
    return workbook;
  }
  console.log("Xuất Excel thành công:", filePath);
}

module.exports = {
  syncDataMonth,
  // getRootMC1,
  // getRootMC2,
  // getJsonData,
};
