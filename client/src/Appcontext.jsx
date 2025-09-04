import { data } from "data";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const AppContext = createContext();
// const ting = new Audio("/ding.mp3");
// const wrong = new Audio("/wrong.mp3");

export function AppProvider({ children }) {
  const [dataJSON, setDataJSON] = useState([]);
  const [mc2dataJSON, setMC2DataJSON] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rootData, setRootData] = useState([]);
  const [filterLocation, setFilterLocation] = useState("10C5");
  const [currentValueInput, setCurrentValueInput] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    const dataRoot = localStorage.getItem("data");
    if (!dataRoot) localStorage.setItem("data", JSON.stringify(data));
    setRootData(dataRoot ? JSON.parse(dataRoot) : data);
    setDataJSON(dataRoot ? JSON.parse(dataRoot) : data);
  }, []);

  const loadData = useCallback(() => {
    if (socketRef.current) socketRef.current.emit("get-all");
  }, []);

  const tickData = useCallback((num) => {
    setDataJSON((data) => {
      const newData = data.map((item) => {
        if (item.code === `${num}`) {
          const now = new Date();
          return {
            ...item,
            tick: true,
            time: item.time?.length ? [...item.time, now] : [now],
            lastedCheck: now,
          };
        }
        return item;
      });
      localStorage.setItem("data", JSON.stringify(newData));
      return newData;
    });
    setRootData((data) => {
      return data.map((item) => {
        if (item.code === `${num}`) {
          const now = new Date();
          return {
            ...item,
            tick: true,
            time: item.time?.length ? [...item.time, now] : [now],
            lastedCheck: now,
          };
        }
        return item;
      });
    });
    setCurrentValueInput(`${num}`);
  }, []);

  return (
    <AppContext.Provider
      value={{
        dataJSON,
        setDataJSON,
        loading,
        setLoading,
        loadData,
        tickData,
        currentValueInput,
        setCurrentValueInput,
        filterLocation,
        setFilterLocation,
        rootData,
        setRootData,
        mc2dataJSON,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
