const ExcelJS = require("exceljs");
const dayjs = require("dayjs");
const path = require("path");
const { filterByTeacher } = require("./filterByTeacher");
const { filterByLocation } = require("./filterByLocation");
const { filterCS2 } = require("./filterCS2");
// Chạy hàm
const sourceUrl = path.resolve(
  `E:/OneDrive - Marie Curie/11. bán trú/đăng ký bán trú hằng ngày.xlsx`
); // Đường dẫn file Excel nguồn
const targeUrl = path.resolve(
  `E:/OneDrive - Marie Curie/11. bán trú/Diem danh ban tru.xlsx`
); // File đích

function dayjsToExcelDate(dayjsDate) {
  const baseDate = dayjs("1900-01-01"); // Ngày gốc của Excel
  const diffDays = dayjsDate.diff(baseDate, "day"); // Số ngày giữa hai mốc
  return diffDays + 2; // Cộng thêm 2 do lỗi lịch sử của Excel
}
// Hàm sao chép dữ liệu kèm style
// Hàm sao chép dữ liệu từ file gốc
async function copyExcelDataWithStyle(
  sourceFile = sourceUrl,
  targetFile = targeUrl
) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(sourceFile); // Đọc file nguồn
  const sourceSheet = workbook.worksheets[0]; // Lấy sheet đầu tiên

  // Tạo workbook và worksheet mới
  const newWorkbook = new ExcelJS.Workbook();
  const newSheet = newWorkbook.addWorksheet("cs1");

  // Ngày hiện tại
  const today = dayjs();

  // Sao chép tiêu đề (hàng 3)
  const headerRow = sourceSheet.getRow(2);
  const newHeaderRow = newSheet.getRow(1);

  let todayColumnIndex = -1;
  headerRow.eachCell((cell, colIndex) => {
    // So sánh nếu tiêu đề cột là ngày hiện tại
    if (
      cell.value?.result
        ? dayjsToExcelDate(dayjs(cell.value?.result)) ===
          dayjsToExcelDate(today)
        : dayjsToExcelDate(dayjs(cell.value)) === dayjsToExcelDate(today)
    ) {
      todayColumnIndex = colIndex; // Lưu index của cột ngày hiện tại
    }
  });

  for (let col = 2; col <= 8; col++) {
    const cell = headerRow.getCell(col); // Cột B đến H
    const newCell = newHeaderRow.getCell(col - 1); // Cột 1 đến 7 trong file mới

    newCell.value = cell.value; // Sao chép giá trị
    newCell.style = { ...cell.style }; // Sao chép style
  }

  // Thêm cột tiêu đề mới: Ngày hiện tại
  const newTodayCell = newHeaderRow.getCell(8);
  newTodayCell.value = `${today.format("DD-MMM")}`;
  newTodayCell.style = {
    font: { bold: true, color: { argb: "FF0000" } }, // Font đỏ đậm
    alignment: { horizontal: "center" },
  };

  newHeaderRow.commit(); // Xác nhận ghi hàng tiêu đề

  if (todayColumnIndex === -1) {
    console.log("Không tìm thấy cột ngày hiện tại.");
    return;
  }

  // Sao chép dữ liệu từ hàng 4 trở đi
  sourceSheet.eachRow((row, rowIndex) => {
    if (rowIndex >= 4) {
      // Bắt đầu từ hàng 4
      const todayCell = row.getCell(todayColumnIndex); // Lấy giá trị cột ngày hiện tại
      if (todayCell.value?.toString().trim()?.toLowerCase() === "x") {
        // Kiểm tra nếu giá trị là "x"
        const newRow = newSheet.addRow(); // Tạo hàng mới trong file đích
        for (let col = 2; col <= 9; col++) {
          const cell = row.getCell(col); // Lấy ô trong file gốc
          const newCell = newRow.getCell(col - 1); // Tương ứng cột mới
          newCell.value = cell.value; // Sao chép giá trị
          newCell.style = { ...cell.style }; // Sao chép style
        }
        // Thêm giá trị ngày hiện tại vào cột mới
        const newTodayCell = newRow.getCell(9);
        newTodayCell.value = "x";
        newTodayCell.style = {
          font: { italic: true, color: { argb: "FF00FF" } }, // Font tím nghiêng
          alignment: { horizontal: "center" },
        };
        newSheet.getColumn(3).width = 30;
        newSheet.getColumn(7).width = 10;
        newSheet.autoFilter = {
          from: "A1", // Bắt đầu từ cột A
          to: "G1", // Kết thúc ở cột G
        };
        newRow.commit(); // Xác nhận ghi hàng
      }
    }
  });

  filterCS2(workbook, newWorkbook);
  filterByLocation(newWorkbook);
  filterByTeacher(newWorkbook);

  // Ghi file mới
  await newWorkbook.xlsx.writeFile(targetFile);
  console.log(
    `Đã sao chép dữ liệu sang file mới: ${targetFile} ${dayjs().format(
      "HH:MM, DD-MM-YYYY"
    )}`
  );
}

module.exports = {
  copyExcelDataWithStyle,
};
