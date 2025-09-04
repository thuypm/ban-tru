import { BrowserMultiFormatReader } from "@zxing/library";
import { useEffect, useRef, useState } from "react";

import { useAppContext } from "Appcontext";
import Eated from "components/Eated";
import Header from "components/Header";
import Missing from "components/Missing";
import ResultInput from "components/ResultInput";
import jsQR from "jsqr";
import { Button } from "primereact/button";
export default function RollUp() {
  const videoRef = useRef(null);
  const [result, setResult] = useState("");
  const codeReader = new BrowserMultiFormatReader();
  const { loadData, loading, tickData } = useAppContext();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const startScanner = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;
    const video = videoRef.current;

    // Tạo canvas từ video
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // ---- Thử jsQR trước (nhanh) ----
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

    if (qrCode) {
      console.log("✅ jsQR result:", qrCode.data);
      setResult(qrCode.data);
      await tickData(qrCode.data);
      return;
    }

    // ---- Nếu không có QR → fallback qua ZXing ----
    try {
      const img = new Image();
      img.src = canvas.toDataURL("image/png");
      await img.decode();
      const result = await codeReader.decodeFromImageElement(img);
      if (result) {
        console.log("✅ ZXing result:", result.getText());
        setResult(result.getText());
        // await tickData(Number(result.getText()))
      }
    } catch (err) {
      console.warn("❌ Không tìm thấy mã:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-auto">
      {loading ? (
        <div className="w-screen h-screen z-20 opacity-55 bg-gray-100 fixed top-0 left-0 flex items-center justify-center">
          Đang tải....
        </div>
      ) : null}
      <Header />

      <div className="w-full">
        <div className="p-2 flex justify-center">
          <Button
            onClick={async () => {
              try {
                // Lấy danh sách thiết bị video
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(
                  (d) => d.kind === "videoinput"
                );

                // Ưu tiên camera sau (thường có label chứa "back" hoặc "environment")
                let preferredDeviceId = null;
                for (const device of videoDevices) {
                  if (/back|environment/i.test(device.label)) {
                    preferredDeviceId = device.deviceId;
                    break;
                  }
                }

                // Nếu không tìm thấy thì fallback: lấy camera đầu tiên
                if (!preferredDeviceId && videoDevices.length > 0) {
                  preferredDeviceId = videoDevices[0].deviceId;
                }

                // Xin quyền camera
                const stream = await navigator.mediaDevices.getUserMedia({
                  video: {
                    facingMode: { exact: "environment" }, // ép dùng camera sau
                  },
                });

                if (videoRef.current) {
                  videoRef.current.srcObject = stream;
                }
              } catch (err) {
                console.error("Lỗi truy cập camera:", err);
              }

              return () => {
                codeReader.reset();
              };
            }}
            stopCamera={() => {
              if (videoRef.current) {
                const stream = videoRef.current.srcObject;
                if (stream) {
                  const tracks = stream.getTracks();
                  tracks.forEach((track) => track.stop());
                }
                videoRef.current.srcObject = null;
              }
            }}>
            Bật camera
          </Button>
        </div>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            aspectRatio: "auto",
          }}
          className="w-full h-[200px] border-gray-300 aspect-video"
        />
      </div>
      <div>
        <Button className="w-full flex justify-center" onClick={startScanner}>
          Bấm nút này để chụp & quét
        </Button>
      </div>
      <ResultInput result={result} />
      <div className="grid grid-cols-2 gap-2 mt-4 px-2 overflow-auto">
        <Eated />
        <Missing />
      </div>
    </div>
  );
}
