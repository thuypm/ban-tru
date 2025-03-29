import Home from "../pages/Home";
import RollUp from "../pages/RollUp";

export const publicRoutes = [
  {
    key: "forgot-password",
    path: "/",
    element: <Home />,
    label: "Trang chủ",
    icon: <></>,
  },
  {
    key: "forgot-password",
    path: "/roll-up",
    element: <RollUp />,
    label: "Đăng nhập",
    icon: <></>,
  },
];
