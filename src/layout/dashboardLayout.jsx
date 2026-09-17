import React from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/sideBar";

const Dashboard = () => {
  return (
    <div className="flex w-full min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Section */}
      <div className="flex flex-1 min-w-0 flex-col">
        {/* Header */}
        <Header />

        {/* Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
