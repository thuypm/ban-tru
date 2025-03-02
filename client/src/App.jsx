import { BrowserMultiFormatReader } from "@zxing/library";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import "./App.css";
import { useAppContext } from "./Appcontext";
import Eated from "./components/Eated";
import Missing from "./components/Missing";
import ResultInput from "./components/ResultInput";
export default function BarcodeScanner() {
  const videoRef = useRef(null);
  const [result, setResult] = useState("");
  const codeReader = new BrowserMultiFormatReader();
  const { loadData, loading, tickData } = useAppContext();

  useEffect(() => {
    loadData();
    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "environment" },
      })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        startScanner();
      })
      .catch((err) => console.error("Lỗi truy cập camera:", err));
    return () => {
      codeReader.reset();
    };
  }, [loadData]);

  const startScanner = () => {
    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      async (result, err) => {
        if (result) {
          setResult(result.getText());
          codeReader.reset();
          await tickData(Number(result.getText()));
          setTimeout(() => startScanner(), 1000); // Quét lại sau 1 giây
        }
      }
    );
  };

  return (
    <div id="app" className="flex flex-col">
      {loading ? (
        <div className="w-screen h-screen z-20 opacity-55 bg-gray-100 fixed top-0 left-0 flex items-center justify-center">
          Đang tải....
        </div>
      ) : null}

      <h2 className="text-xl font-bold text-center">
        {dayjs().format("ddd, DD-MM-YY")} Quét mã vạch
      </h2>
      <div className="w-full ">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full border-gray-300 aspect-video"
        />
      </div>
      <ResultInput result={result} />
      <div className="grid grid-cols-2 gap-2 mt-4 px-2 overflow-auto">
        <Eated />
        <Missing />
      </div>
    </div>
  );
}
