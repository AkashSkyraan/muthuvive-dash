import React, { useEffect, useState } from "react";
import { Button, Card, Table, message } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import axiosInstance from "../../api/axios";

const AboutUsList = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [aboutUs, setAboutUs] = useState([]);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // ==========================================
  // GET ABOUT US LIST
  // ==========================================

  const getAboutUs = async (page = 1, limit = 10) => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/about/about-data", {});

      console.log("ABOUT US LIST:", response);

      if (response?.data?.success === 1) {
        setAboutUs(response?.data?.data || []);

        setPagination({
          current: page,
          pageSize: limit,
          total: Number(response?.data?.total) || 0,
        });
      } else {
        message.error(response?.data?.message || "Failed to fetch About Us");
      }
    } catch (error) {
      console.error("Get About Us error:", error);

      message.error(
        error?.response?.data?.message || "Failed to fetch About Us",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    getAboutUs();
  }, []);

  // ==========================================
  // COLUMNS
  // ==========================================

  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 70,
      fixed: "left",

      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },

    {
      title: "YOE",
      dataIndex: "yoe",
      key: "yoe",
      width: 100,

      render: (value) => <span className="font-medium">{value ?? 0}</span>,
    },

    {
      title: "Projects",
      dataIndex: "projects",
      key: "projects",
      width: 110,

      render: (value) => <span className="font-medium">{value ?? 0}</span>,
    },

    {
      title: "Clients",
      dataIndex: "clients",
      key: "clients",
      width: 110,

      render: (value) => <span className="font-medium">{value ?? 0}</span>,
    },

    {
      title: "Users",
      dataIndex: "users",
      key: "users",
      width: 110,

      render: (value) => <span className="font-medium">{value ?? 0}</span>,
    },

    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: 250,

      render: (value) => <span className="text-gray-700">{value || "-"}</span>,
    },

    {
      title: "Mobile",
      dataIndex: "mobile",
      key: "mobile",
      width: 150,

      render: (value) => <span>{value || "-"}</span>,
    },

    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 220,

      render: (value) => <span>{value || "-"}</span>,
    },

    {
      title: "Construction YOE",
      dataIndex: "c_yoe",
      key: "c_yoe",
      width: 130,

      render: (value) => <span className="font-medium">{value ?? 0}</span>,
    },

    {
      title: "Construction Projects",
      dataIndex: "c_projects",
      key: "c_projects",
      width: 150,

      render: (value) => <span className="font-medium">{value ?? 0}</span>,
    },

    {
      title: "Construction Clients",
      dataIndex: "c_clients",
      key: "c_clients",
      width: 150,

      render: (value) => <span className="font-medium">{value ?? 0}</span>,
    },

    {
      title: "Construction Built",
      dataIndex: "c_built",
      key: "c_built",
      width: 140,

      render: (value) => <span className="font-medium">{value ?? 0}</span>,
    },

    // ========================================
    // ACTION
    // ========================================

    {
      title: "Action",
      key: "action",
      width: 80,
      fixed: "right",

      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() =>
            navigate(`/admin/dashboard/aboutus/edit/${record.id}`)
          }
        />
      ),
    },
  ];

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="w-full">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">About Us</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage About Us information
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/dashboard/about-us/create")}
        >
          Create About Us
        </Button>
      </div>

      {/* ======================================
          TABLE CARD
      ====================================== */}

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          dataSource={aboutUs}
          columns={columns}
          scroll={{ x: 2200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,

            showSizeChanger: true,

            pageSizeOptions: ["10", "20", "50"],

            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} About Us records`,

            onChange: (page, pageSize) => {
              getAboutUs(page, pageSize);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default AboutUsList;
