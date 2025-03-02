import { useState } from "react";
import { useAppContext } from "../Appcontext";

function ResultInput() {
  const { dataJSON, tickData, loadData } = useAppContext();
  const [inputData, setInputData] = useState("");

  return (
    <div>
      <div className="flex items-center relative">
        <p className="mt-4 text-lg text-center my-6 flex-1">
          Số: <span className="font-semibold"> - Chưa có tên</span>
        </p>
        <div className="absolute top0 right-2">
          <button
            className="p-2 bg-green-400 rounded"
            type="button"
            onClick={loadData}>
            <img src="reload.svg" className="w-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-4 px-[8px] w-full">
        <div className=" flex-[1_1_auto]">
          <input
            type="number"
            pattern="\d*"
            onKeyDown={(e) => {
              if (!/[0-9]/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault();
              }
            }}
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="Nhập mã định danh"
            className="border border-gray-300 p-2 rounded flex-1 w-full"
          />
        </div>

        <button
          className="flex-[0_0_auto] bg-blue-400 px-4 rounded text-white"
          type="button"
          onClick={() => {
            if (inputData?.trim()) tickData(Number(inputData));
            setInputData("");
          }}>
          Điểm danh
        </button>
      </div>
    </div>
  );
}
export default ResultInput;
