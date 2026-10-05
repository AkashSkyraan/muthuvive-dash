import React from "react";
import { Outlet } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/sideBar";

const Dashboard = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Sidebar - Fixed / Separate Scroll */}
      <div className="h-screen shrink-0 overflow-y-auto">
        <Sidebar />
      </div>

      {/* Right Section */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="shrink-0">
          <Header />
        </div>

        {/* Right Content - Separate Scroll */}
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
