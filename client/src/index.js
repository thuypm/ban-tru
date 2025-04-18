import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppProvider } from "./Appcontext";
import "./index.css";

import reportWebVitals from "./reportWebVitals";
import CustomRouter from "./router/CustomRouter";
import { history } from "./router/history";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <CustomRouter history={history}>
      <AppProvider>
        <App />
      </AppProvider>
    </CustomRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
