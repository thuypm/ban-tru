import { clsx } from "clsx";
import dayjs from "dayjs";
import { Button } from "primereact/button";
import { useMemo } from "react";
import { useAppContext } from "../Appcontext";

function Eated() {
  const { filterLocation, JSONBranchData } = useAppContext();

  // ?.sort((a, b) => b.lastedCheck - a.lastedCheck);

  const list = useMemo(() => {
    const registerData = JSONBranchData?.filter((e) => {
      return e.isRegister;
    });
    return filterLocation?.length
      ? registerData
          ?.filter((e) => e.diningRoom === filterLocation)
          .filter((e) => e.tick)
      : registerData?.filter((e) => e.tick);
  }, [JSONBranchData, filterLocation]);

  return (
    <div className="overflow-auto flex flex-col ">
      <div className="flex justify-center items-center pb-1">
        <Button className="flex-[0_0_auto] py-1" severity="success">
          Đã ăn:<b> {list?.length}</b>
        </Button>
      </div>
      <div className="overflow-auto h-fit">
        {list?.map((item) => (
          <div
            key={item.VNEDUID}
            className={clsx(
              "flex gap-2 border-b border-b-gray-300 py-1 px-0.5",
              item.checkTime?.length > 1 ? "bg-yellow-200" : "",
              !item.isRegister && item.tick ? "bg-red-200" : ""
            )}>
            {/* <div className="w-6">{item.code}</div> */}
            <div className="flex-1 overflow-hidden">
              {" "}
              {`${item.class} - ${item.fullName}`}
            </div>
            <div>
              {item.checkTime?.map((time) => (
                <div key={time}>{dayjs(time).format("HH:mm")}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Eated;
