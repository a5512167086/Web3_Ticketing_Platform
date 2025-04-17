import { createBrowserRouter } from "react-router";
import BaseLayout from "@/components/BaseLayout";
import Homepage from "@/pages/Homepage";
import MyTicketPage from "@/pages/MyTicketPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <BaseLayout />, // ✅ 套用 layout
    children: [
      { index: true, element: <Homepage /> },
      { path: "my-tickets", element: <MyTicketPage /> },
    ],
  },
]);
