import axios from "axios";
import { createContext, useCallback, useContext, useState } from "react";
const AppContext = createContext();
const ting = new Audio("/ding.mp3");
const wrong = new Audio("/wrong.mp3");
export function AppProvider({ children }) {
  const [dataJSON, setDataJSON] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterLocation, setFilterLocation] = useState("TV");
  const [currentValueInput, setCurrentValueInput] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.request({
        baseURL: process.env.REACT_APP_API,
        url: "api/get-all",
      });
      setDataJSON(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  const tickData = useCallback(async (num) => {
    setLoading(true);
    try {
      const { data } = await axios.request({
        baseURL: process.env.REACT_APP_API,
        url: "api/tick",
        method: "POST",
        data: {
          code: num,
        },
      });
      setCurrentValueInput(`${num}`);
      setDataJSON(data);
      if (data?.find((e) => e.code === num)) ting.play();
      else wrong.play();
    } catch (error) {
    } finally {
      setLoading(false);
    }
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
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
