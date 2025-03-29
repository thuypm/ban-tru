const ExcelJS = require("exceljs");

/**
 * Hàm xử lý dữ liệu từ một worksheet
 *
 * @param {ExcelJS.Workbook} workbook - Sheet cần xử lý
 */
async function filterByTeacher(workbook) {
  const sheet = workbook.worksheets[0];

  const gvptColumnValues = [];
  let countTotal = 0;

  // Duyệt qua các hàng bắt đầu từ hàng thứ 4 (sau hàng tiêu đề)
  sheet.eachRow((row, rowIndex) => {
    if (rowIndex > 1) {
      countTotal++;
      const gvptValue = row.getCell(7).value; // Lấy giá trị ở cột GVPT
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
    const gvSheet = workbook.addWorksheet(item);

    // Sao chép tiêu đề và style của tiêu đề
    const headerRow = sheet.getRow(1); // Dòng tiêu đề (giả định là dòng 1)
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
    gvSheet.getColumn(3).width = 30;
    gvSheet.getColumn(7).width = 10;
    sheet.eachRow((row, rowIndex) => {
      if (rowIndex > 1) {
        // Bỏ qua tiêu đề
        const gvptValue = row.getCell(7).value; // Lấy giá trị ở cột GVPT
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

  sheet.getRow(1).getCell(10).value = "Tổng: ";
  sheet.getRow(1).getCell(11).value = countTotal;

  gvptColumnValues.forEach((gv, index) => {
    sheet.getRow(4 + index).getCell(10).value = gv;
    let cntGV = 0;
    sheet.eachRow((row) => {
      if (row.getCell(7).value?.trim() === gv) cntGV += 1;
    });
    sheet.getRow(4 + index).getCell(11).value = cntGV;
  });
}
module.exports = {
  filterByTeacher,
};
