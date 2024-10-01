import { createElement } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import {
  BaseLayout,
  BlankLayout,
  LandingPageLayout,
  MainLayout,
  RootError,
} from "../components";
import { DashboardLayout, InventoryPage } from "@/components/dashboard.layout";

/**
 * Application routes
 * https://reactrouter.com/en/main/routers/create-browser-router
 */
export const router = createHashRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    errorElement: <RootError />,
    children: [
      {
        index: true,
        element: <InventoryPage />,
      },
      {
        path: "inventory",
        element: <InventoryPage />,
      },
      // Add more routes for other pages (orders, products, customers, analytics)
    ],
  },
  // {
  //   path: "",
  //   element: <BaseLayout />,
  //   errorElement: <RootError />,
  //   children: [],
  // },
  // {
  //   path: "",
  //   element: <MainLayout />,
  //   errorElement: <RootError />,
  //   children: [{ index: true, lazy: () => import("./start") }],
  // },
  // {
  //   path: "",
  //   element: <LandingPageLayout />,
  //   errorElement: <RootError />,
  //   children: [],
  // },
  // {
  //   path: "",
  //   element: <BlankLayout />,
  //   errorElement: <RootError />,
  //   children: [
  //     { index: false, path: "dashboard", lazy: () => import("./dashboard") },
  //   ],
  // },
]);

export function Router(): JSX.Element {
  return createElement(RouterProvider, { router });
}

// Clean up on module reload (HMR)
// https://vitejs.dev/guide/api-hmr
if (import.meta.hot) {
  import.meta.hot.dispose(() => router.dispose());
}
