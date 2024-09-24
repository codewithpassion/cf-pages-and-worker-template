import { createElement } from "react";
import { createHashRouter, RouterProvider } from "react-router-dom";
import {
  BaseLayout,
  BlankLayout,
  LandingPageLayout,
  MainLayout,
  RootError,
} from "../components";

/**
 * Application routes
 * https://reactrouter.com/en/main/routers/create-browser-router
 */
export const router = createHashRouter([
  {
    path: "",
    element: <BaseLayout />,
    errorElement: <RootError />,
    children: [],
  },
  {
    path: "",
    element: <MainLayout />,
    errorElement: <RootError />,
    children: [{ index: true, lazy: () => import("./start") }],
  },
  {
    path: "",
    element: <LandingPageLayout />,
    errorElement: <RootError />,
    children: [],
  },
  {
    path: "",
    element: <BlankLayout />,
    errorElement: <RootError />,
    children: [
      { index: false, path: "dashboard", lazy: () => import("./dashboard") },
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
