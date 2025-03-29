import { PrimeReactProvider } from "primereact/api";
import { Route, Routes } from "react-router-dom";
import "./App.css";
import PublicLayout from "./layouts/PublicLayout";
import { publicRoutes } from "./router/public";
function App() {
  return (
    <>
      <PrimeReactProvider>
        <div id="app">
          <Routes>
            {publicRoutes.map((route) => (
              <Route
                key={route.key}
                path={route.path}
                element={<PublicLayout>{route.element}</PublicLayout>}></Route>
            ))}
          </Routes>
        </div>
      </PrimeReactProvider>
    </>
  );
}

export default App;
