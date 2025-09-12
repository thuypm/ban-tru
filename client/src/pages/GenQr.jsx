import JsBarcode from "jsbarcode";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { useState } from "react";
import * as XLSX from "xlsx";

export default function Label10x4() {
  const [rows, setRows] = useState([]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);
    setRows(json);
  };

  const generatePDF = async () => {
    const CM_TO_PT = 28.35;
    const CARD_W_CM = 5;
    const CARD_H_CM = 2;
    const CARD_W_PT = CARD_W_CM * CM_TO_PT;
    const CARD_H_PT = CARD_H_CM * CM_TO_PT;

    const PAGE_W_PT = CARD_W_PT * 2; // 10 cm
    const PAGE_H_PT = CARD_H_PT; // 4 cm
    const PADDING = 2; // pt ≈ 2mm

    const pdf = new jsPDF({
      unit: "pt",
      format: [PAGE_W_PT, PAGE_H_PT],
      orientation: "landscape",
    });

    for (let i = 0; i < rows.length; i += 2) {
      if (i !== 0) pdf.addPage();

      const label1 = await renderLabelToCanvas(rows[i], CARD_W_CM, CARD_H_CM);
      pdf.addImage(
        label1,
        "PNG",
        PADDING,
        PADDING,
        CARD_W_PT - 2 * PADDING,
        CARD_H_PT - 2 * PADDING
      );

      if (rows[i + 1]) {
        const label2 = await renderLabelToCanvas(
          rows[i + 1],
          CARD_W_CM,
          CARD_H_CM
        );
        pdf.addImage(
          label2,
          "PNG",
          CARD_W_PT + PADDING,
          PADDING,
          CARD_W_PT - 2 * PADDING,
          CARD_H_PT - 2 * PADDING
        );
      }
    }

    pdf.save("labels_10x4.pdf");
  };

  const renderLabelToCanvas = async (row, wCm, hCm) => {
    // 300 DPI: 1 inch = 2.54 cm -> 118 px/cm
    const PX_PER_CM = 300 / 2.54;
    const wPx = Math.round(wCm * PX_PER_CM);
    const hPx = Math.round(hCm * PX_PER_CM);

    const canvas = document.createElement("canvas");
    canvas.width = wPx;
    canvas.height = hPx;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, wPx, hPx);
    ctx.fillStyle = "#000";
    ctx.font = `${Math.round(hPx * 0.12)}px Arial`;

    const id = row["ID"];
    const name = row["Tên sản phẩm"];

    ctx.fillText(`ID: ${id}`, 20, 40);
    ctx.fillText(`Tên: ${name}`, 20, 80);

    // Barcode
    const barcodeCanvas = document.createElement("canvas");
    JsBarcode(barcodeCanvas, String(id), {
      format: "CODE128",
      width: 2,
      height: 60,
      displayValue: false,
      fontSize: 10,
    });
    ctx.drawImage(barcodeCanvas, 20, hPx - 120, wPx / 2, 100);

    // QR code
    const qrUrl = await QRCode.toDataURL(String(id), { width: 120 });
    const qrImg = new Image();
    qrImg.src = qrUrl;
    await new Promise((resolve) => {
      qrImg.onload = () => {
        ctx.drawImage(qrImg, wPx - 150, 20, 120, 120);
        resolve();
      };
    });

    return canvas.toDataURL("image/png");
  };

  return (
    <div>
      <h2>Xuất PDF 2 label (5x4cm) = 1 trang (10x4cm) @300dpi</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFile} />
      <button onClick={generatePDF} disabled={rows.length === 0}>
        Xuất PDF
      </button>
    </div>
  );
}
