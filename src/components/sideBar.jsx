import React, { useState } from "react";
import {
  PictureOutlined,
  PlusOutlined,
  UnorderedListOutlined,
  DownOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HighlightOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    key: "amenities",
    label: "Amenities",
    children: [
      {
        key: "/dashboard/amenities/add",
        label: "Add Amenities",
        icon: <PlusOutlined />,
      },
      {
        key: "/dashboard/amenities/list",
        label: "List Amenities",
        icon: <UnorderedListOutlined />,
      },
    ],
  },
  {
    key: "highlights",
    label: "Property Highlights",
    children: [
      {
        key: "/dashboard/highlights/add",
        label: "Add Property Highlights",
        icon: <PlusOutlined />,
      },
      {
        key: "/dashboard/highlights/list",
        label: "List Property Highlights",
        icon: <UnorderedListOutlined />,
      },
    ],
  },
  {
    key: "gallery",
    label: "Gallery",
    children: [
      {
        key: "/dashboard/gallery/add",
        label: "Add Gallery Images",
        icon: <PlusOutlined />,
      },
      {
        key: "/dashboard/gallery/list",
        label: "List Gallery Images",
        icon: <UnorderedListOutlined />,
      },
    ],
  },
  {
    key: "testimonials",
    label: "Testimonials",
    children: [
      {
        key: "/dashboard/testimonial/add",
        label: "Add Testimonials",
        icon: <PlusOutlined />,
      },
      {
        key: "/dashboard/testimonial/list",
        label: "List Testimonials",
        icon: <UnorderedListOutlined />,
      },
    ],
  },
  {
    key: "add-property",
    label: "Properties",
    children: [
      {
        key: "/dashboard/add-property",
        label: "Add Property",
        icon: <PlusOutlined />,
      },
      {
        key: "/dashboard/list-property",
        label: "List Properties",
        icon: <UnorderedListOutlined />,
      },
    ],
  },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  const [openMenus, setOpenMenus] = useState({
    amenities: true,
  });

  // Navigate to page
  const handleNavigate = (path) => {
    navigate(path);
  };

  // Open / close dropdown
  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Check whether a menu item is active
  const isActive = (path) => {
    return location.pathname === path;
  };

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
      {/* Logo + Collapse toggle */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-gray-200">
        {!collapsed && (
          <span className="text-xl font-semibold text-gray-800 whitespace-nowrap">
            My Admin
          </span>
        )}

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={`
            flex
            items-center
            justify-center
            w-8
            h-8
            shrink-0
            rounded-md
            text-gray-500
            hover:bg-blue-50
            hover:text-blue-600
            transition-colors
            ${collapsed ? "mx-auto" : ""}
          `}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3">
        {menuItems.map((item) => {
          const hasChildren = item.children?.length > 0;

          /*
           * Normal menu item
           */
          if (!hasChildren) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleNavigate(item.key)}
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  mb-1
                  rounded-md
                  text-sm
                  text-left
                  transition-colors
                  ${
                    isActive(item.key)
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <span className="text-lg shrink-0">{item.icon}</span>

                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          }

          /*
           * Dropdown menu
           */
          return (
            <div key={item.key} className="mb-1">
              {/* Parent */}
              <button
                type="button"
                onClick={() => toggleMenu(item.key)}
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-3
                  py-2.5
                  rounded-md
                  text-sm
                  text-left
                  text-gray-600
                  hover:bg-blue-50
                  hover:text-blue-600
                  transition-colors
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <span className="text-lg shrink-0">{item.icon}</span>

                {!collapsed && (
                  <>
                    <span className="flex-1 text-base">{item.label}</span>

                    <DownOutlined
                      className={`
                        text-xs
                        transition-transform
                        duration-200
                        ${openMenus[item.key] ? "rotate-180" : ""}
                      `}
                    />
                  </>
                )}
              </button>

              {/* Children */}
              {!collapsed && openMenus[item.key] && (
                <div className="ml-4 mt-1 pl-4 border-l border-gray-200">
                  {item.children.map((child) => (
                    <button
                      key={child.key}
                      type="button"
                      onClick={() => handleNavigate(child.key)}
                      className={`
                        w-full
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2
                        mb-1
                        rounded-md
                        text-sm
                        text-left
                        transition-colors
                        ${
                          isActive(child.key)
                            ? "bg-blue-600 text-white"
                            : "text-gray-500 hover:bg-blue-50 hover:text-blue-600"
                        }
                      `}
                    >
                      {child.icon && (
                        <span className="text-sm">{child.icon}</span>
                      )}

                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
