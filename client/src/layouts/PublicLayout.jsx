import { useAppContext } from "Appcontext";
import { Dropdown } from "primereact/dropdown";
import { Link } from "react-router";
const CS_ENUM = {
  MC1: "MC1",
  MC2: "MC2",
};

const PublicLayout = ({ children }) => {
  const { selectBranch, setSelectBranch, setFilterLocation } = useAppContext();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex-grow-0 flex gap-2 px-4 items-center justify-between">
        <Link to={"/roll-up"} className="text-xl">
          Phòng ăn
        </Link>
        <Dropdown
          className="w-fit"
          placeholder="Chọn cơ sở"
          value={selectBranch}
          onChange={(e) => {
            setSelectBranch(e.target.value);
            setFilterLocation("");
          }}
          options={Object.keys(CS_ENUM).map((key) => ({
            label: key,
            value: CS_ENUM[key],
          }))}
        />

        <Link to={"/"} className="text-xl">
          Phòng ngủ
        </Link>
      </div>
      <div className="relative flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};

export default PublicLayout;
