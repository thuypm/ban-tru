import axios from "axios";
import { createContext, useCallback, useContext, useState } from "react";
const AppContext = createContext();

export function AppProvider({ children }) {
  const [dataJSON, setDataJSON] = useState([]);
  const [loading, setLoading] = useState(false);

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
      setDataJSON(data);
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
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
