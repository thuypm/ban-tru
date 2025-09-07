import { useAppContext } from "Appcontext";
import dayjs from "dayjs";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { useMemo, useState } from "react";
import BedRollUp from "./BedRollUp";

function Home() {
  const { JSONBranchData } = useAppContext();
  const registerData = useMemo(() => {
    return JSONBranchData?.filter((e) => e.isRegister);
  }, [JSONBranchData]);

  const uniqueLocations = useMemo(() => {
    const uniqueLocations = [
      ...new Set(registerData?.map((item) => item.sleepRoom)),
    ];
    return uniqueLocations;
  }, [registerData]);
  const [sleepRoomSelection, setSleepRoomSelection] = useState("");
  const dataFilterBedRollup = useMemo(() => {
    return registerData?.filter((e) => e.sleepRoom === sleepRoomSelection);
  }, [registerData, sleepRoomSelection]);
  return (
    <div className="relative h-full bg-gray-50 w-full overflow-y-auto flex flex-col p-2">
      <div className="mb-2">
        <div className="text-center font-bold mb-2">
          <span className="ml-4">{dayjs().format("HH:MM, DD/MM/YYYY")}</span>
        </div>
        <div className="flex gap-2">
          <DataTable
            className="w-full thin-table"
            value={[
              ...uniqueLocations.map((item) => ({
                label: item,
                count: registerData.filter((e) => e.sleepRoom === item)?.length,
              })),
              // ...uniqueTeachers.map((item) => ({
              //   label: item,
              //   count: registerData.filter((e) => e.teacher === item)?.length,
              // })),
            ]}>
            <Column header="Vị trí" field="label" />
            <Column header="Số lượng" field="count" />
          </DataTable>
        </div>
      </div>
      <div className="flex gap-4">
        <Dropdown
          className="w-full"
          placeholder="Phòng ngủ"
          value={sleepRoomSelection}
          onChange={(e) => setSleepRoomSelection(e.target.value)}
          options={uniqueLocations?.map((item) => ({
            label: item,
            value: item,
          }))}
        />
      </div>

      <BedRollUp data={dataFilterBedRollup} />
    </div>
  );
}
export default Home;
