import BaseLayout from "@/components/BaseLayout";
import { RouterProvider } from "react-router";
import { router } from "@/router";
function App() {
  return (
    <BaseLayout>
      <RouterProvider router={router} />
    </BaseLayout>
  );
}

export default App;
