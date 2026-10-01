import React, { useEffect, useState } from "react";
import {
  PictureOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HighlightOutlined,
  AppstoreOutlined,
  UserOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Popover } from "antd";

const ADMIN_PREFIX = "admin/dashboard";

const menuItems = [
  {
    key: "amenities",
    label: "Amenities",
    icon: <AppstoreOutlined />,
    children: [
      {
        key: `${ADMIN_PREFIX}/amenities/add`,
        label: "Add Amenities",
        icon: <PlusOutlined />,
      },
      {
        key: `${ADMIN_PREFIX}/amenities/list`,
        label: "List Amenities",
        icon: <UnorderedListOutlined />,
      },
    ],
  },

  {
    key: "highlights",
    label: "Property Highlights",
    icon: <HighlightOutlined />,
    children: [
      {
        key: `${ADMIN_PREFIX}/highlights/add`,
        label: "Add Property Highlights",
        icon: <PlusOutlined />,
      },
      {
        key: `${ADMIN_PREFIX}/highlights/list`,
        label: "List Property Highlights",
        icon: <UnorderedListOutlined />,
      },
    ],
  },

  {
    key: "gallery",
    label: "Gallery",
    icon: <PictureOutlined />,
    children: [
      {
        key: `${ADMIN_PREFIX}/gallery/add`,
        label: "Add Gallery Images",
        icon: <PlusOutlined />,
      },
      {
        key: `${ADMIN_PREFIX}/gallery/list`,
        label: "List Gallery Images",
        icon: <UnorderedListOutlined />,
      },
    ],
  },

  {
    key: "sub-admin",
    label: "Sub Admin",
    icon: <UserOutlined />,
    children: [
      {
        key: `${ADMIN_PREFIX}/sub-admin/create`,
        label: "Create Sub Admin",
        icon: <PlusOutlined />,
      },
      {
        key: `${ADMIN_PREFIX}/sub-admin/list`,
        label: "Sub Admin List",
        icon: <UnorderedListOutlined />,
      },
    ],
  },

  {
    key: "plan",
    label: "Plan Area",
    icon: <DollarOutlined />,
    children: [
      {
        key: `${ADMIN_PREFIX}/plans/create`,
        label: "Create Plan",
        icon: <PlusOutlined />,
      },
      {
        key: `${ADMIN_PREFIX}/plans/list`,
        label: "Plan List",
        icon: <UnorderedListOutlined />,
      },
    ],
  },

  {
    key: "property-area",
    label: "Property Area",
    icon: <EnvironmentOutlined />,
    children: [
      {
        key: `${ADMIN_PREFIX}/property-area/create`,
        label: "Create Property Area",
        icon: <PlusOutlined />,
      },
      {
        key: `${ADMIN_PREFIX}/property-area/list`,
        label: "Property Area List",
        icon: <UnorderedListOutlined />,
      },
    ],
  },

  {
    key: "aboutus",
    label: "About Us",
    icon: <InfoCircleOutlined />,
    children: [
      {
        key: `${ADMIN_PREFIX}/aboutus/create`,
        label: "Create About Us",
        icon: <PlusOutlined />,
      },
      {
        key: `${ADMIN_PREFIX}/aboutus/list`,
        label: "About Us List",
        icon: <UnorderedListOutlined />,
      },
    ],
  },

  {
    key: "enquiry",
    label: "Enquiry",
    icon: <MessageOutlined />,
    children: [
      {
        key: `${ADMIN_PREFIX}/enquiry/list`,
        label: "Enquiry List",
        icon: <UnorderedListOutlined />,
      },
    ],
  },

  {
    key: "construction-consultants",
    label: "Const. Consultants",
    icon: <UserOutlined />,
    children: [
      {
        key: `${ADMIN_PREFIX}/const-consultants/create`,
        label: "Add Consultant",
        icon: <PlusOutlined />,
      },
      {
        key: `${ADMIN_PREFIX}/const-consultants/list`,
        label: "Consultant List",
        icon: <UnorderedListOutlined />,
      },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  const isActive = (path) => {
    return location.pathname === `/${path}`;
  };

  const isParentActive = (item) => {
    return item.children?.some(
      (child) => location.pathname === `/${child.key}`,
    );
  };

  const handleNavigate = (path) => {
    navigate(`/${path}`);
  };

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    const activeParent = menuItems.find((item) =>
      item.children?.some((child) => location.pathname === `/${child.key}`),
    );

    if (activeParent) {
      setOpenMenus((prev) => ({
        ...prev,
        [activeParent.key]: true,
      }));
    }
  }, [location.pathname]);

  return (
    <aside
      className={`
        shrink-0
        h-screen
        bg-white
        border-r
        border-gray-200
        transition-all
        duration-300
        ${collapsed ? "w-20" : "w-72"}
      `}
    >
      {/* Header */}
      <div
        className="
          h-16
          flex
          items-center
          justify-between
          px-5
          border-b
          border-gray-200
        "
      >
        {!collapsed && (
          <span
            className="
              text-xl
              font-semibold
              text-gray-800
              whitespace-nowrap
            "
          >
            {user?.role?.toUpperCase()}
          </span>
        )}

        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          className={`
            flex
            items-center
            justify-center
            w-8
            h-8
            shrink-0
            rounded-md
            text-gray-500
            hover:bg-gray-100
            hover:text-gray-700
            transition-colors
            ${collapsed ? "mx-auto" : ""}
          `}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* Menu */}
      <nav className="p-3  sidebar-scrollbar">
        {menuItems.map((item) => {
          const parentActive = isParentActive(item);

          return (
            <div key={item.key} className="mb-1">
              {/* ================= COLLAPSED ================= */}
              {collapsed ? (
                <Popover
                  placement="rightTop"
                  trigger="hover"
                  arrow={false}
                  content={
                    <div className="w-52">
                      <div
                        className="
                          mb-2
                          border-b
                          border-gray-100
                          px-2
                          pb-2
                        "
                      >
                        <span className="text-sm font-semibold text-gray-700">
                          {item.label}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {item.children.map((child) => (
                          <button
                            key={child.key}
                            type="button"
                            onClick={() => handleNavigate(child.key)}
                            className={`
                              flex
                              w-full
                              items-center
                              gap-3
                              rounded-md
                              px-3
                              py-2
                              text-left
                              text-sm
                              transition-colors

                              ${
                                isActive(child.key)
                                  ? "bg-blue-50 text-blue-600 font-medium"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                              }
                            `}
                          >
                            <span className="text-sm shrink-0">
                              {child.icon}
                            </span>

                            <span>{child.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  }
                >
                  <button
                    type="button"
                    className={`
                      flex
                      h-11
                      w-full
                      items-center
                      justify-center
                      rounded-md
                      text-lg
                      transition-colors

                      ${
                        parentActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      }
                    `}
                  >
                    {item.icon}
                  </button>
                </Popover>
              ) : (
                <>
                  {/* ================= PARENT ================= */}
                  <button
                    type="button"
                    onClick={() => toggleMenu(item.key)}
                    className={`
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-md
                      px-3
                      py-2.5
                      text-left
                      text-sm
                      transition-colors

                      ${
                        parentActive
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                      }
                    `}
                  >
                    <span className="shrink-0 text-lg">{item.icon}</span>

                    <span className="flex-1 text-base">{item.label}</span>

                    <DownOutlined
                      className={`
                        text-xs
                        transition-transform
                        duration-200
                        ${openMenus[item.key] ? "rotate-180" : ""}
                      `}
                    />
                  </button>

                  {/* ================= CHILDREN ================= */}
                  {openMenus[item.key] && (
                    <div
                      className="
                        ml-4
                        mt-1
                        border-l
                        border-gray-200
                        pl-4
                      "
                    >
                      {item.children.map((child) => (
                        <button
                          key={child.key}
                          type="button"
                          onClick={() => handleNavigate(child.key)}
                          className={`
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-md
                            px-3
                            py-2
                            mb-1
                            text-left
                            text-sm
                            transition-colors

                            ${
                              isActive(child.key)
                                ? "bg-blue-50 text-blue-600 font-medium"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }
                          `}
                        >
                          <span className="text-sm shrink-0">{child.icon}</span>

                          <span>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
