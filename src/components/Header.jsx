import React, { useState } from "react";
import {
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { Popover, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const userName = user?.name || "User";

  // First letter of username
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      setOpen(false);

      await logout();

      message.success("Logged out successfully");

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout Error:", error);

      navigate("/admin/login", {
        replace: true,
      });
    }
  };

  const userMenu = (
    <div className="w-52">
      {/* User info */}
      <div className="border-b border-gray-100 px-4 py-3">
        <p className="truncate text-sm font-semibold text-gray-800">
          {userName}
        </p>

        <p className="mt-0.5 text-xs font-medium uppercase text-gray-400">
          {user?.role || "User"}
        </p>
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-2.5
          text-sm
          text-gray-700
          transition
          hover:bg-red-50
          hover:text-red-600
        "
      >
        <LogoutOutlined />
        <span>Logout</span>
      </button>
    </div>
  );

  return (
    <header
      className="
        flex
        h-16
        w-full
        shrink-0
        items-center
        justify-between
        border-b
        border-gray-100
        bg-white
        px-4
        shadow-sm
        sm:px-6
      "
    >
      {/* Project Name */}
      <div className="flex items-center">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-gray-800">
            Muthu Vive's Properties
          </h1>

          <p className="hidden text-xs text-gray-400 sm:block">
            Property Management Dashboard
          </p>
        </div>
      </div>

      {/* User */}
      <Popover
        content={userMenu}
        trigger="click"
        placement="bottomRight"
        open={open}
        onOpenChange={setOpen}
        arrow={false}
      >
        <button
          type="button"
          className="
            flex
            items-center
            gap-2
            rounded-full
            p-1
            pr-2
            transition
            hover:bg-gray-50
          "
        >
          {/* Initial */}
          <span
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-[#165BEF]
              text-sm
              font-semibold
              text-white
              shadow-sm
            "
          >
            {userInitial}
          </span>

          {/* Name */}
          <span className="hidden max-w-[140px] truncate text-sm font-medium text-gray-700 sm:block">
            {userName}
          </span>

          <DownOutlined className="hidden text-[10px] text-gray-400 sm:block" />
        </button>
      </Popover>
    </header>
  );
};

export default Header;