import clsx from "clsx";
import { useState } from "react";

function BedRollUp({ data }) {
  const [tickData, setTickData] = useState([]);
  return (
    <div className="overflow-y-auto flex-1 mt-2">
      {data.map((item) => (
        <div
          key={item.id}
          className={clsx(
            "flex gap-2 border-b border-b-gray-500 py-2 px-0.5",

            tickData.includes(item.id) ? "bg-red-200" : ""
          )}
          onClick={() => {
            tickData.includes(item.id)
              ? setTickData(tickData.filter((e) => e !== item.id))
              : setTickData([...tickData, item.id]);
          }}>
          <div className="w-6">{item.code}</div>
          <div className="flex-1 overflow-hidden"> {`${item.name}`}</div>
          <div className="w-10"> {`${item.class}`}</div>
          <div>
            <button className="border border-blue-500 bg-blue-100 px-2 rounded text-xs">
              Tick
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
export default BedRollUp;
