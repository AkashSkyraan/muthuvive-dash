import React from "react";
import { BrowserRouter, useRoutes, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../layout/dashboardLayout";
import SellPropertyLayout from "../layout/SellPropertyLayout";
import AuthLayout from "../layout/AuthLayout";

import amenitiesRoutes from "./Amenities.routes";
import highlightsRoutes from "./Highlights.routes";
import galleryRoutes from "./Gallery.routes";
import testimonialsRoutes from "./Testimonials.routes";
import addpropertiesRoutes from "./SellPropertyForm.routes";
import subAdminRoutes from "./subadmin.routes";
import planRoutes from "./plan.routes";
import propertyAreaRoutes from "./propertyArea.routes";
import aboutUsRoutes from "./Aboutus.routes";
import enquiryRoutes from "./Enquiry.routes";
import constructionConsultantRoutes from "./construct.routes";

import { AuthProvider } from "../context/AuthContext";
import propertyListRoutes from "./propertylist.routes";

const appRoutes = [
  // =========================
  // AUTH ROUTES
  // =========================
  {
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
    ],
  },

  // =========================
  // PROTECTED ADMIN ROUTES
  // =========================
  {
    path: "/",
    element: <Dashboard />,
    children: [
      ...amenitiesRoutes,
      ...highlightsRoutes,
      ...galleryRoutes,
      ...testimonialsRoutes,
      ...aboutUsRoutes,
      ...enquiryRoutes,
      ...propertyAreaRoutes,
      ...constructionConsultantRoutes,
      ...subAdminRoutes,
      ...planRoutes,
      ...propertyListRoutes
    ],
  },

  // =========================
  // SELL PROPERTY
  // =========================
  {
    path: "/",
    element: <SellPropertyLayout />,
    children: [...addpropertiesRoutes],
  },

  // =========================
  // DEFAULT ROUTE
  // =========================
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
];

const AppRouter = () => {
  return useRoutes(appRoutes);
};

const AppRoutes = () => {
  return (
    <AuthProvider>
      <BrowserRouter  basename="/admin">
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default AppRoutes;
