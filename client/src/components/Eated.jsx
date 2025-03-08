import { clsx } from "clsx";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useAppContext } from "../Appcontext";

function Eated() {
  const { rootData, filterLocation } = useAppContext();
  const list = useMemo(() => {
    return filterLocation?.length
      ? rootData
          .filter((e) => e.location === filterLocation)
          .filter((e) => e.tick)
      : rootData.filter((e) => e.tick);
  }, [rootData, filterLocation]);

  return (
    <div className="overflow-auto flex flex-col">
      <div className="flex justify-center items-center pb-1">
        <button className="flex-[0_0_auto] bg-green-400 px-4 py-2 rounded text-white">
          Đã ăn:<b> {list.length}</b>
        </button>
      </div>
      <div className="overflow-auto h-fit">
        {list.map((item) => (
          <div
            key={item.code}
            className={clsx(
              "flex gap-2 border-b border-b-gray-300 py-1 px-0.5",
              !item.isRegister && item.tick ? "bg-red-200" : ""
            )}>
            <div className="w-6">{item.code}</div>
            <div className="flex-1 overflow-hidden">
              {" "}
              {`${item.class} - ${item.name}`}
            </div>
            <div>{dayjs(item.time).format("HH:mm")}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Eated;
