import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";

const AppContext = createContext();
// const ting = new Audio("/ding.mp3");
// const wrong = new Audio("/wrong.mp3");

export function AppProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [rootData, setRootData] = useState([]);
  const [selectBranch, setSelectBranch] = useState("MC1");
  const [filterLocation, setFilterLocation] = useState("TV");
  const [currentValueInput, setCurrentValueInput] = useState("");
  const socketRef = useRef(null);
  const JSONBranchData = useMemo(() => {
    return rootData?.filter((item) => item.branch === selectBranch);
  }, [rootData, selectBranch]);

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
    // socketRef.current = io("http://localhost:5000");
    socketRef.current.on("get-all", (data) => {
      setRootData(data);
      setLoading(false);
    });
    socketRef.current.on("tick-a-item", (data) => {
      setRootData((prev) =>
        prev.map((item) => {
          if (item.VNEDUID === data) {
            return {
              ...item,
              tick: true,
              checkTime: [...item.checkTime, new Date()],
            };
          }
          return item;
        })
      );
    });

    socketRef.current.on("connect_error", () => {
      socketRef.current.connect();
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const loadData = useCallback(() => {
    if (socketRef.current) socketRef.current.emit("get-all");
  }, []);

  const tickData = useCallback((num) => {
    if (socketRef.current) socketRef.current.emit("tick", num?.trim());
    setCurrentValueInput(`${num?.trim()}`);
  }, []);

  return (
    <AppContext.Provider
      value={{
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
        selectBranch,
        setSelectBranch,
        JSONBranchData,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
