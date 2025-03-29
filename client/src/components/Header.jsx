import dayjs from "dayjs";
import { Dropdown } from "primereact/dropdown";
import { useMemo } from "react";
import { Link } from "react-router";
import { useAppContext } from "../Appcontext";
export default function Header() {
  const { filterLocation, setFilterLocation, dataJSON } = useAppContext();
  const uniqueLocations = useMemo(() => {
    const uniqueLocations = [...new Set(dataJSON.map((item) => item.location))];
    return uniqueLocations;
  }, [dataJSON]);
  return (
    <div className="flex justify-between items-center px-2">
      <h2 className="text-xl font-bold text-center">
        <Link to={"/"}>{dayjs().format("ddd, DD-MM-YY")}</Link>
      </h2>
      <div className="px-4">
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
