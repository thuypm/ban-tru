import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { useAppContext } from "../Appcontext";
function ResultInput() {
  const { dataJSON, tickData, loadData, currentValueInput } = useAppContext();
  const [inputData, setInputData] = useState("");
  const findStudent = useMemo(() => {
    return dataJSON?.find((item) => item.code === Number(currentValueInput));
  }, [dataJSON, currentValueInput]);

  return (
    <div>
      <div className="flex items-center relative">
        {/* <div class="checkmark absolute">✔</div> */}
        <p
          className={clsx(
            "mt-4 text-lg text-center my-2 py-2 flex-1",
            currentValueInput
              ? findStudent
                ? "bg-green-100"
                : "bg-red-100"
              : ""
          )}>
          Số: {currentValueInput}{" "}
          <span className="font-semibold">
            {" "}
            - {findStudent ? findStudent.name : `Chưa có tên`}{" "}
          </span>
        </p>
        <div className="absolute top0 right-2 top-5">
          <button
            className="p-2 bg-yellow-400 rounded"
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
              if (
                !/[0-9]/.test(e.key) &&
                e.key !== "Backspace" &&
                e.key !== "Enter"
              ) {
                e.preventDefault();
              }
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                if (e.target.value?.trim()) tickData(Number(e.target.value));
                setInputData("");
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
