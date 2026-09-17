import React, { useState } from "react";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { Popover } from "antd";

const Header = () => {
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    // console.log("Logout clicked");
    setOpen(false);
  };

  const userMenu = (
    <div className="w-40">
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <LogoutOutlined />
        Logout
      </button>
    </div>
  );

  return (
    <header className="w-full h-16 shrink-0 bg-white px-4 sm:px-6 border-b border-gray-100 shadow-sm flex items-center justify-end">
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
          className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-lg hover:ring-2 hover:ring-blue-200 transition"
        >
          <UserOutlined />
        </button>
      </Popover>
    </header>
  );
};

export default Header;
