import { Dropdown } from "primereact/dropdown";
import { useMemo } from "react";
import { useAppContext } from "../Appcontext";
export default function Header() {
  const { filterLocation, setFilterLocation, JSONBranchData } = useAppContext();
  const uniqueLocations = useMemo(() => {
    const uniqueLocations = [
      ...new Set(JSONBranchData?.map((item) => item.diningRoom)),
    ];
    return uniqueLocations;
  }, [JSONBranchData]);
  return (
    <div className="flex justify-between items-center">
      <div className="flex gap-4">
        <Dropdown
          className="w-40"
          options={uniqueLocations.map((e) => ({
            label: e,
            value: e,
          }))}
          value={filterLocation}
          onChange={(e) => {
            setFilterLocation(e.target.value);
          }}></Dropdown>
      </div>
    </div>
  );
}
