import { createBrowserRouter } from "react-router";
import Homepage from "@/pages/Homepage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
]);
