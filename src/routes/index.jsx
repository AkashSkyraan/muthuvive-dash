import React from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../layout/dashboardLayout";
import amenitiesRoutes from "./Amenities.routes";
import highlightsRoutes from "./Highlights.routes";
import galleryRoutes from "./Gallery.routes";
import AuthLayout from "../layout/AuthLayout";

const appRoutes = [
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
     
    ],
  },

  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [...amenitiesRoutes, ...highlightsRoutes, ...galleryRoutes],
  },
];

const AppRouter = () => {
  return useRoutes(appRoutes);
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
};

export default AppRoutes;
