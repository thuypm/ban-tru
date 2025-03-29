import { BrowserMultiFormatReader } from "@zxing/library";
import { useEffect, useRef, useState } from "react";

import { useAppContext } from "Appcontext";
import Eated from "components/Eated";
import Header from "components/Header";
import Missing from "components/Missing";
import ResultInput from "components/ResultInput";
import { Button } from "primereact/button";
export default function RollUp() {
  const videoRef = useRef(null);
  const [result, setResult] = useState("");
  const codeReader = new BrowserMultiFormatReader();
  const { loadData, loading, tickData } = useAppContext();

  useEffect(() => {
    loadData();
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
          startScanner(); // Quét lại sau 1 giây
        }
      }
    );
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
            onClick={() => {
              navigator.mediaDevices
                .getUserMedia({
                  video: { facingMode: "environment" },
                })
                .then((stream) => {
                  if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    startScanner();
                  }
                })
                .catch((err) => console.error("Lỗi truy cập camera:", err));
              return () => {
                codeReader.reset();
              };
            }}>
            Bật camera
          </Button>
        </div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full border-gray-300 aspect-video h-[120px]"
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
