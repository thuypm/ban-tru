const ExcelJS = require("exceljs");
const dayjs = require("dayjs");
/**
 * Hàm xử lý dữ liệu từ một worksheet
 *
 * @param {ExcelJS.Workbook} oldWorkBook - Sheet cần xử lý
 *  * @param {ExcelJS.Workbook} newWorkbook - Sheet cần xử lý
 */
function dayjsToExcelDate(dayjsDate) {
  const baseDate = dayjs("1900-01-01"); // Ngày gốc của Excel
  const diffDays = dayjsDate.diff(baseDate, "day"); // Số ngày giữa hai mốc
  return diffDays + 2; // Cộng thêm 2 do lỗi lịch sử của Excel
}
async function filterCS2(oldWorkBook, newWorkbook) {
  const sourceSheet = oldWorkBook.worksheets[1]; // Lấy sheet đầu tiên
  const newSheet = newWorkbook.addWorksheet("cs2");

  // Ngày hiện tại
  const today = dayjs();

  // Sao chép tiêu đề (hàng 3)
  const headerRow = sourceSheet.getRow(2);
  const newHeaderRow = newSheet.getRow(1);

  let todayColumnIndex = -1;
  headerRow.eachCell((cell, colIndex) => {
    // So sánh nếu tiêu đề cột là ngày hiện tại

    if (
      dayjsToExcelDate(dayjs(cell.value)) === dayjsToExcelDate(today) ||
      dayjsToExcelDate(dayjs(cell.value?.result)) === dayjsToExcelDate(today)
    ) {
      todayColumnIndex = colIndex; // Lưu index của cột ngày hiện tại
    }
  });

  for (let col = 1; col <= 6; col++) {
    const cell = headerRow.getCell(col); // Cột B đến H
    const newCell = newHeaderRow.getCell(col); // Cột 1 đến 7 trong file mới
    newCell.value = cell.value; // Sao chép giá trị
    newCell.style = { ...cell.style }; // Sao chép style
  }

  // Thêm cột tiêu đề mới: Ngày hiện tại
  const newTodayCell = newHeaderRow.getCell(7);
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
        for (let col = 1; col <= 6; col++) {
          const cell = row.getCell(col); // Lấy ô trong file gốc
          const newCell = newRow.getCell(col); // Tương ứng cột mới
          newCell.value = cell.value; // Sao chép giá trị
          newCell.style = { ...cell.style }; // Sao chép style
        }
        // Thêm giá trị ngày hiện tại vào cột mới
        const newTodayCell = newRow.getCell(7);
        newTodayCell.value = "x";
        newTodayCell.style = {
          font: { italic: true, color: { argb: "FF00FF" } }, // Font tím nghiêng
          alignment: { horizontal: "center" },
        };
        newSheet.getColumn(2).width = 30;
        newSheet.autoFilter = {
          from: "A1", // Bắt đầu từ cột A
          to: "E1", // Kết thúc ở cột G
        };
        newRow.commit(); // Xác nhận ghi hàng
      }
    }
  });

  // lọc bởi giáo viên

  const gvptColumnValues = [];
  let countTotal = 0;

  // Duyệt qua các hàng bắt đầu từ hàng thứ 4 (sau hàng tiêu đề)
  newSheet.eachRow((row, rowIndex) => {
    if (rowIndex > 1) {
      countTotal++;
      const gvptValue = row.getCell(5).value; // Lấy giá trị ở cột GVPT
      if (
        gvptValue &&
        gvptValue.trim()?.length &&
        !gvptColumnValues.includes(gvptValue.trim())
      ) {
        gvptColumnValues.push(gvptValue.trim()); // Thêm giá trị vào mảng
      }
    }
  });

  gvptColumnValues.forEach(async (item) => {
    let countGv = 0;
    const gvSheet = newWorkbook.addWorksheet(item);

    // Sao chép tiêu đề và style của tiêu đề
    const headerRow = newSheet.getRow(1); // Dòng tiêu đề (giả định là dòng 1)
    const newHeaderRow = gvSheet.getRow(1); // Dòng tiêu đề trong sheet mới

    headerRow.eachCell((cell, colIndex) => {
      if (colIndex < 9) {
        const newCell = newHeaderRow.getCell(colIndex);
        newCell.value = cell.value;
        newCell.style = { ...cell.style }; // Sao chép style
      }
    });
    newHeaderRow.commit(); // Lưu lại dòng mới

    // Lọc và sao chép dữ liệu (bao gồm style)
    gvSheet.getColumn(2).width = 30;
    newSheet.eachRow((row, rowIndex) => {
      if (rowIndex > 1) {
        // Bỏ qua tiêu đề
        const gvptValue = row.getCell(5).value; // Lấy giá trị ở cột GVPT
        if (gvptValue?.toString()?.trim() === item.trim()) {
          countGv++;
          const newRow = gvSheet.getRow(gvSheet.lastRow.number + 1); // Dòng mới trong sheet đích
          row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
            if (colIndex < 9) {
              const newCell = newRow.getCell(colIndex);
              newCell.value = cell.value; // Sao chép giá trị
              newCell.style = { ...cell.style }; // Sao chép style
            }
          });
          newRow.commit(); // Lưu dòng mới
        }
      }
    });
    try {
      await gvSheet.protect("", {
        selectLockedCells: true, // Cho phép chọn ô đã khóa
        selectUnlockedCells: true, // Cho phép chọn ô không khóa
        formatCells: false, // Không cho phép định dạng ô
        formatColumns: false, // Không cho phép thay đổi cột
        formatRows: false, // Không cho phép thay đổi hàng
      });
    } catch (error) {
      console.log(error);
    }
    // gvSheet.getRow(1).getCell(10).value = "Tổng: ";
    // gvSheet.getRow(1).getCell(11).value = countTotal;
  });

  newSheet.getRow(1).getCell(10).value = "Tổng: ";
  newSheet.getRow(1).getCell(11).value = countTotal;

  gvptColumnValues.forEach((gv, index) => {
    newSheet.getRow(4 + index).getCell(10).value = gv;
    let cntGV = 0;
    newSheet.eachRow((row) => {
      if (row.getCell(5).value?.trim() === gv) cntGV += 1;
    });
    newSheet.getRow(4 + index).getCell(11).value = cntGV;
  });
}
module.exports = {
  filterCS2,
};
