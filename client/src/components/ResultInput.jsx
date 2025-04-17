import { clsx } from "clsx";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../Appcontext";
function ResultInput() {
  const { dataJSON, tickData, loadData, currentValueInput } = useAppContext();
  const [inputData, setInputData] = useState("");
  const findStudent = useMemo(() => {
    return dataJSON?.find((item) => item.code === Number(currentValueInput));
  }, [dataJSON, currentValueInput]);
  const timeoutAnimation = useRef(null);
  const [showTick, setShowTick] = useState(false);
  useEffect(() => {
    setShowTick(true);
    if (timeoutAnimation) clearTimeout(timeoutAnimation);
    timeoutAnimation.current = setTimeout(() => {
      setShowTick(false);
    }, [1000]);
  }, [findStudent]);

  const inputRef = useRef(null);
  return (
    <div>
      <div className="flex items-center relative">
        <div
          className={clsx(
            " absolute top-8 left-4 opacity-0",
            showTick ? "checkmark" : ""
          )}>
          ✔
        </div>
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
        <div className="absolute top0 right-1 top-4">
          <Button
            className=""
            severity="warning"
            type="button"
            onClick={loadData}>
            <img src="reload.svg" className="w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 px-[8px] w-full">
        <div className="flex-[1_1_auto]">
          <InputText
            pattern="\d*"
            inputMode="numeric"
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
            ref={inputRef}
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="Nhập mã định danh"
            className="border flex-1 w-full"
          />
        </div>

        <Button
          severity="success"
          type="button"
          onClick={() => {
            if (inputData?.trim()) tickData(Number(inputData));
            setInputData("");
            inputRef?.current?.focus();
          }}>
          Điểm danh
        </Button>
      </div>
    </div>
  );
}
export default ResultInput;
