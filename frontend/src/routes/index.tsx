import { createElement } from "react";
import {
  createBrowserRouter as createRouter,
  RouterProvider,
} from "react-router-dom";
import { BaseLayout, BlankLayout, RootError } from "../components";
import { DashboardLayout, InventoryPage } from "@/components/dashboard.layout";

import { Home, LineChart, Package, ShoppingCart, Users } from "lucide-react";
import { Login } from "./login";

/**
 * Application routes
 * https://reactrouter.com/en/main/routers/create-browser-router
 */
export const router = createRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    errorElement: <RootError />,
    children: [
      {
        index: true,
        element: <InventoryPage />,
        handle: { label: "Dashboard", icon: Home },
      },
      {
        path: "orders",
        element: <InventoryPage />,
        handle: { label: "Orders", icon: ShoppingCart, badge: "6" },
      },
      {
        path: "inventory",
        element: <InventoryPage />,
        handle: { label: "Inventory", icon: Package },
      },
      {
        path: "customers",
        element: <InventoryPage />,
        handle: { label: "Customers", icon: Users },
      },
      {
        path: "analytics",
        element: <InventoryPage />,
        handle: { label: "Analytics", icon: LineChart },
      },
    ],
  },
  {
    element: <BlankLayout />,
    errorElement: <RootError />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },
]);

export function Router(): JSX.Element {
  return createElement(RouterProvider, { router });
}

// Clean up on module reload (HMR)
// https://vitejs.dev/guide/api-hmr
if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
