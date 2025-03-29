import { useAppContext } from "Appcontext";
import dayjs from "dayjs";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { useMemo, useState } from "react";
import { Link } from "react-router";
import BedRollUp from "./BedRollUp";
const CS_ENUM = {
  MC1: "MC1",
  MC2: "MC2",
};
function Home() {
  const { mc2dataJSON, rootData } = useAppContext();
  const registerData = useMemo(() => {
    return rootData.filter((e) => e.isRegister);
  }, [rootData]);
  const mc2RegisterData = useMemo(() => {
    return mc2dataJSON.filter((e) => e.isRegister);
  }, [mc2dataJSON]);
  const uniqueTeachers = useMemo(() => {
    const uniqueTeachers = [
      ...new Set(registerData.map((item) => item.teacher)),
    ];
    return uniqueTeachers;
  }, [registerData]);
  const mc2UniqueTeachers = useMemo(() => {
    const uniqueTeachers = [
      ...new Set(mc2RegisterData.map((item) => item.teacher)),
    ];
    return uniqueTeachers;
  }, [mc2RegisterData]);
  const uniqueLocations = useMemo(() => {
    const uniqueLocations = [
      ...new Set(registerData.map((item) => item.location)),
    ];
    return uniqueLocations;
  }, [registerData]);
  const [csValue, setCSValue] = useState(CS_ENUM.MC1);
  const [teacherSelection, setTeacherSelection] = useState("");

  const dataFilterBedRollup = useMemo(() => {
    const currentArray =
      csValue === CS_ENUM.MC1 ? registerData : mc2RegisterData;
    if (teacherSelection?.trim())
      return currentArray.filter((item) => item.teacher === teacherSelection);
    else return currentArray;
  }, [teacherSelection, csValue, mc2RegisterData, registerData]);
  return (
    <div className="relative h-screen bg-gray-50 w-full overflow-y-auto flex flex-col p-2">
      <div className="mb-2">
        <div className="text-center font-bold mb-2">
          <span>{dayjs().format("HH:MM, DD/MM/YYYY")}</span>
          <Link to="/roll-up" className="ml-4">
            Roll up
          </Link>
        </div>
        <div className="flex gap-2">
          <DataTable
            className="w-full thin-table"
            value={[
              ...uniqueLocations.map((item) => ({
                label: item,
                count: registerData.filter((e) => e.location === item)?.length,
              })),
              ...uniqueTeachers.map((item) => ({
                label: item,
                count: registerData.filter((e) => e.teacher === item)?.length,
              })),
            ]}>
            <Column header="Vị trí" field="label" />
            <Column header="Số lượng" field="count" />
          </DataTable>
          <DataTable
            className="w-full thin-table"
            value={[
              ...mc2UniqueTeachers.map((item) => ({
                label: item,
                count: mc2RegisterData.filter((e) => e.teacher === item)
                  ?.length,
              })),
            ]}>
            <Column header="Vị trí" field="label" />
            <Column header="Số lượng" field="count" />
          </DataTable>
        </div>
      </div>
      <div className="flex gap-4">
        <Dropdown
          className="w-full"
          placeholder="CS"
          value={csValue}
          onChange={(e) => setCSValue(e.target.value)}
          options={Object.keys(CS_ENUM).map((key) => ({
            label: key,
            value: CS_ENUM[key],
          }))}
        />
        <Dropdown
          className="w-full"
          placeholder="GVPT"
          value={teacherSelection}
          onChange={(e) => setTeacherSelection(e.target.value)}
          options={(csValue === CS_ENUM.MC1
            ? uniqueTeachers
            : mc2UniqueTeachers
          )?.map((item) => ({
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
