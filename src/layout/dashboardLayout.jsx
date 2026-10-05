import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/sideBar";

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Right Side */}
      <div
        className={`
          flex
          min-h-screen
          min-w-0
          flex-col
          transition-all
          duration-300
          ${collapsed ? "ml-20" : "ml-72"}
        `}
      >
        {/* Header */}
        <div className="sticky top-0 z-40 shrink-0">
          <Header />
        </div>

        {/* Content */}
        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
