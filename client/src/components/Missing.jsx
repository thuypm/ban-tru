import { Button } from "primereact/button";
import { useMemo } from "react";
import { useAppContext } from "../Appcontext";

function Missing() {
  const { rootData, selectBranch, filterLocation, JSONBranchData } =
    useAppContext();

  const list = useMemo(() => {
    const registerData = JSONBranchData?.filter((e) => {
      return e.isRegister;
    });
    return filterLocation?.length
      ? registerData
          ?.filter((e) => e.diningRoom === filterLocation)
          .filter((e) => !e.tick)
      : registerData?.filter((e) => !e.tick);
  }, [JSONBranchData, filterLocation]);
  return (
    <div className="overflow-auto flex flex-col ">
      <div className="flex justify-center items-center pb-1">
        <Button severity="danger py-1">
          Chưa ăn:<b> {list?.length}</b>
        </Button>
      </div>
      <div className="overflow-auto h-fit">
        {list?.map((item) => (
          <div
            key={item.VNEDUID}
            className="flex gap-2 border-b border-b-gray-300 py-1">
            {/* <div className="w-6">{item.code}</div> */}
            <div className="flex-1 overflow-hidden">
              {" "}
              {`${item.class} - ${item.fullName}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Missing;
