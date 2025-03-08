import dayjs from "dayjs";
import { useAppContext } from "../Appcontext";
export default function Header() {
  const { filterLocation, setFilterLocation } = useAppContext();

  return (
    <div className="flex justify-between">
      <h2 className="text-xl font-bold text-center">
        {dayjs().format("ddd, DD-MM-YY")}
      </h2>
      <div className="px-4">
        <select
          value={filterLocation}
          onChange={(e) => {
            setFilterLocation(e.target.value);
          }}
          id="countries"
          class="bg-gray-50 px-4 border border-gray-300 text-gray-900 text-sm rounded
             focus:ring-blue-500 focus:border-blue-500 
             block w-full py-2 dark:bg-gray-700
              dark:border-gray-600 dark:placeholder-gray-400 dark:text-white
               dark:focus:ring-blue-500 dark:focus:border-blue-500">
          <option value={""}>Toàn bộ</option>
          <option value={"TV"}>TV</option>
          <option value="P.ăn">P.ăn</option>
        </select>
      </div>
    </div>
  );
}
