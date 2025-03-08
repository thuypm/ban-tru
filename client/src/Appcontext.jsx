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
  const [loading, setLoading] = useState(false);
  const [rootData, setRootData] = useState(false);
  const [filterLocation, setFilterLocation] = useState("TV");
  const [currentValueInput, setCurrentValueInput] = useState("");
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API);
    socketRef.current.on("get-all", (data) => {
      setRootData(data);
      setDataJSON(data?.filter((e) => e.isRegister));
    });
    socketRef.current.on("connect_error", () => {
      socketRef.current.auth.token = "abcd";
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
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
