import React, { useEffect, useState } from "react";

import {
  Button,
  Card,
  Input,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";

import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axios";

const SubAdminList = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // =========================
  // GET SUB ADMINS
  // =========================
  const getSubAdmins = async (
    page = pagination.current,
    limit = pagination.pageSize,
    searchValue = search,
    statusValue = status,
  ) => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
      };

      // Name search
      if (searchValue?.trim()) {
        params.name = searchValue.trim();
      }

      // Status filter
      if (statusValue && statusValue !== "all") {
        params.status = statusValue;
      }

      const response = await axiosInstance.get("/admin/sub-admins", {
        params,
      });

      if (response?.status === 200 && response?.data?.success === 1) {
        setSubAdmins(response.data.data || []);

        setPagination({
          current: page,
          pageSize: limit,
          total: response.data.total || 0,
        });
      } else {
        setSubAdmins([]);

        setPagination({
          current: page,
          pageSize: limit,
          total: 0,
        });
      }
    } catch (error) {
      console.error("Get Sub Admin Error:", error?.response?.data || error);

      message.error(
        error?.response?.data?.message || "Failed to fetch sub admins",
      );

      setSubAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    getSubAdmins(1, 10, "", "all");
  }, []);

  // =========================
  // SEARCH
  // =========================
  const handleSearch = (value) => {
    const searchValue = value;

    setSearch(searchValue);

    // Search starts from page 1
    getSubAdmins(1, pagination.pageSize, searchValue, status);
  };

  // =========================
  // STATUS FILTER
  // =========================
  const handleStatusChange = (value) => {
    setStatus(value);

    // Filter starts from page 1
    getSubAdmins(1, pagination.pageSize, search, value);
  };

  // =========================
  // DELETE
  // =========================
  const handleDelete = async (id) => {
    try {
      setLoading(true);

      await axiosInstance.delete(`/admin/delete-admin/${id}`);

      message.success("Sub admin deleted successfully");

      // After delete, reload current page
      getSubAdmins(pagination.current, pagination.pageSize, search, status);
    } catch (error) {
      console.error("Delete Sub Admin Error:", error?.response?.data || error);

      message.error(
        error?.response?.data?.message || "Failed to delete sub admin",
      );

      setLoading(false);
    }
  };

  // =========================
  // TABLE COLUMNS
  // =========================
  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 60,
      render: (_, __, index) => {
        return (pagination.current - 1) * pagination.pageSize + index + 1;
      },
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 350,
      render: (name) => (
        <span className="font-medium text-gray-800">{name}</span>
      ),
    },

  

    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (role) => <Tag color="blue">{role?.toUpperCase()}</Tag>,
    },

      {
      title: "Password",
      dataIndex: "password",
      key: "password",
      width: 150,
      render: (password) => (
        <span className="font-medium text-gray-800">{password}</span>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },

    {
      title: "Action",
      key: "action",
      width: 70,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() =>
              navigate(`/admin/dashboard/sub-admin/edit/${record.id}`)
            }
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* =========================
          HEADER
      ========================= */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Sub Admin List
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage all sub admin accounts
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/dashboard/sub-admin/create")}
        >
          Create Sub Admin
        </Button>
      </div>

      {/* =========================
          CARD
      ========================= */}
      <Card>
        {/* =========================
            FILTERS
        ========================= */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          {/* SEARCH */}
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search by name"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 280 }}
          />

          {/* STATUS */}
          <Select
            value={status}
            onChange={handleStatusChange}
            style={{ width: 150 }}
            options={[
              {
                value: "all",
                label: "All Status",
              },
              {
                value: "active",
                label: "Active",
              },
              {
                value: "inactive",
                label: "Inactive",
              },
            ]}
          />
        </div>

        {/* =========================
            TABLE
        ========================= */}
        <Table
          rowKey="id"
          loading={loading}
          dataSource={subAdmins}
          columns={columns}
           scroll={{ x: 800 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,

            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],

            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} sub admins`,

            onChange: (page, pageSize) => {
              getSubAdmins(page, pageSize, search, status);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default SubAdminList;
