import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";

const AppContext = createContext();
// const ting = new Audio("/ding.mp3");
// const wrong = new Audio("/wrong.mp3");

export function AppProvider({ children }) {
  const [dataJSON, setDataJSON] = useState([]);
  const [mc2dataJSON, setMC2DataJSON] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rootData, setRootData] = useState([]);
  const [filterLocation, setFilterLocation] = useState("TV");
  const [currentValueInput, setCurrentValueInput] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
    // socketRef.current = io("http://localhost:5000");
    socketRef.current.on("get-all", (data) => {
      setRootData(data);
      setDataJSON(data?.filter((e) => e.isRegister));
    });
    socketRef.current.on("get-all-mc2", (data) => {
      setMC2DataJSON(data);
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
    if (socketRef.current) socketRef.current.emit("tick", num);
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
