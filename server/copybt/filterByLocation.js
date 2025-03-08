const ExcelJS = require("exceljs");

/**
 * Hàm xử lý dữ liệu từ một worksheet
 *
 * @param {ExcelJS.Workbook} workbook - Sheet cần xử lý
 */
async function filterByLocation(workbook) {
  const sheet = workbook.worksheets[0];

  const locationColumnValues = [];
  let countTotal = 0;

  // Duyệt qua các hàng bắt đầu từ hàng thứ 4 (sau hàng tiêu đề)
  sheet.eachRow((row, rowIndex) => {
    if (rowIndex > 1) {
      countTotal++;
      const gvptValue = row.getCell(7).value; // Lấy giá trị ở cột location
      if (gvptValue && !locationColumnValues.includes(gvptValue.trim())) {
        locationColumnValues.push(gvptValue.trim()); // Thêm giá trị vào mảng
      }
    }
  });

  locationColumnValues.forEach((item) => {
    let countGv = 0;
    const locationSheet = workbook.addWorksheet(item);

    // Sao chép tiêu đề và style của tiêu đề
    const headerRow = sheet.getRow(1); // Dòng tiêu đề (giả định là dòng 1)
    const newHeaderRow = locationSheet.getRow(1); // Dòng tiêu đề trong sheet mới
    headerRow.eachCell((cell, colIndex) => {
      const newCell = newHeaderRow.getCell(colIndex + 5);
      newCell.value = cell.value;
      newCell.style = { ...cell.style }; // Sao chép style
    });
    newHeaderRow.commit(); // Lưu lại dòng mới

    // Lọc và sao chép dữ liệu (bao gồm style)
    locationSheet.getColumn(2 + 5).width = 30;
    locationSheet.getColumn(6 + 5).width = 10;
    sheet.eachRow((row, rowIndex) => {
      if (rowIndex > 1) {
        // Bỏ qua tiêu đề
        const gvptValue = row.getCell(7).value; // Lấy giá trị ở cột GVPT
        if (gvptValue?.toString().trim() === item) {
          countGv++;

          const newRow = locationSheet.getRow(locationSheet.lastRow.number + 1); // Dòng mới trong sheet đích
          row.eachCell({ includeEmpty: true }, (cell, colIndex) => {
            //sao chép giá trị
            const newCell = newRow.getCell(colIndex + 5);
            newCell.value = cell.value; // Sao chép giá trị
            newCell.style = { ...cell.style }; // Sao chép style
          });
          const lookupCell = newRow.getCell(2);
          lookupCell.value = {
            formula: `=VLOOKUP(A${locationSheet.lastRow.number},$F$2:$G$400, 2,0)`,
          };
          newRow.commit(); // Lưu dòng mới
        }
      }
    });
    // locationSheet.getRow(1).getCell(10).value = "Tổng: ";
    // locationSheet.getRow(1).getCell(11).value = countTotal;
  });
  sheet.getRow(1).getCell(10).value = "Tổng: ";
  sheet.getRow(1).getCell(11).value = countTotal;
  locationColumnValues.forEach((gv, index) => {
    sheet.getRow(2 + index).getCell(10).value = gv;
    let cntGV = 0;
    sheet.eachRow((row) => {
      if (row.getCell(7).value?.trim() === gv) cntGV += 1;
    });
    sheet.getRow(2 + index).getCell(11).value = cntGV;
  });
}
module.exports = {
  filterByLocation,
};
