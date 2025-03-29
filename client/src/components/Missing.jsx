import { Button } from "primereact/button";
import { useMemo } from "react";
import { useAppContext } from "../Appcontext";

function Missing() {
  const { dataJSON, filterLocation } = useAppContext();

  const list = useMemo(() => {
    return filterLocation?.length
      ? dataJSON
          .filter((e) => e.location === filterLocation)
          .filter((e) => !e.tick)
      : dataJSON.filter((e) => !e.tick);
  }, [dataJSON, filterLocation]);
  return (
    <div className="overflow-auto flex flex-col">
      <div className="flex justify-center items-center pb-1">
        <Button severity="danger">
          Chưa ăn:<b> {list.length}</b>
        </Button>
      </div>
      <div className="overflow-auto h-fit">
        {list.map((item) => (
          <div
            key={item.code}
            className="flex gap-2 border-b border-b-gray-300 py-1">
            <div className="w-6">{item.code}</div>
            <div className="flex-1 overflow-hidden">
              {" "}
              {`${item.class} - ${item.name}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Missing;
