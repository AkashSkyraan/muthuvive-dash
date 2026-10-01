import React, { useState } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../layout/dashboardLayout";

import amenitiesRoutes from "./Amenities.routes";
import highlightsRoutes from "./Highlights.routes";
import galleryRoutes from "./Gallery.routes";

import SellPropertyLayout from "../layout/SellPropertyLayout";
import amenitiesRoutes from "./Amenities.routes";
import addpropertiesRoutes from "./SellPropertyForm.routes";
import AuthLayout from "../layout/AuthLayout";

import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoutes";
import subAdminRoutes from "./subadmin.routes";
import planRoutes from "./plan.routes";
import propertyAreaRoutes from "./propertyArea.routes";
import aboutUsRoutes from "./Aboutus.routes";
import enquiryRoutes from "./Enquiry.routes";
import constructionConsultantRoutes from "./construct.routes";

const appRoutes = [
  // =========================
  // AUTH ROUTES
  // =========================
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },

  // =========================
  // PROTECTED ADMIN ROUTES
  // =========================
  {
    path: "/dashboard",
    element: <Dashboard />,
    children: [
      ...amenitiesRoutes,
      ...highlightsRoutes,
      ...galleryRoutes,
      ...testimonialsRoutes,
      ...aboutUsRoutes,
      ...enquiryRoutes,
      propertyAreaRoutes,
      ...constructionConsultantRoutes,
      ...subAdminRoutes,
      ...planRoutes,
    ],
  },
  {
    path: "/dashboard",
    element: <SellPropertyLayout />,
    children: [...addpropertiesRoutes],
  },
];

const AppRouter = () => {
  return useRoutes(appRoutes);
};

const AppRoutes = () => {
  const [user, setUser] = useState(null);
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;
