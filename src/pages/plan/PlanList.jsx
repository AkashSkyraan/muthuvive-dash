import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Tag,
  message,
  Popconfirm,
} from "antd";

import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";

const PlanList = () => {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // ==========================================
  // GET PLANS
  // ==========================================

  const getPlans = async (
    page = 1,
    limit = 10,
    searchValue = search,
    statusValue = status,
  ) => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/plan/plans", {
        params: {
          page,
          limit,
          ...(searchValue.trim()
            ? {
                duration: searchValue.trim(),
              }
            : {}),
          ...(statusValue !== "all"
            ? {
                status: statusValue,
              }
            : {}),
        },
      });

      console.log("PLAN RESPONSE:", response.data);

      if (response?.data?.success === 1) {
        setPlans(response.data.data || []);

        setPagination({
          current: page,
          pageSize: limit,
          total: Number(response.data.total || 0),
        });
      } else {
        setPlans([]);

        message.error(response?.data?.message || "Failed to fetch plans");
      }
    } catch (error) {
      console.error("Get Plans Error:", error?.response?.data || error);

      message.error(error?.response?.data?.message || "Failed to fetch plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPlans();
  }, []);

  // ==========================================
  // STATUS FILTER
  // ==========================================

  const handleStatusChange = (value) => {
    setStatus(value);

    getPlans(1, pagination.pageSize, search, value);
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const handleSearch = () => {
    getPlans(1, pagination.pageSize, search, status);
  };

  // ==========================================
  // DELETE
  // ==========================================

  const handleDelete = async (id) => {
    try {
      const response = await axiosInstance.delete(`/admin/plans/${id}`);

      if (response?.data?.success === 1) {
        message.success(response?.data?.message || "Plan deleted successfully");

        getPlans(pagination.current, pagination.pageSize, search, status);
      } else {
        message.error(response?.data?.message || "Failed to delete plan");
      }
    } catch (error) {
      message.error(error?.response?.data?.message || "Failed to delete plan");
    }
  };

  // ==========================================
  // TABLE
  // ==========================================

  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 70,

      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },

    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: 160,

      render: (duration) => (
        <span className="font-medium text-gray-800">{duration}</span>
      ),
    },

    {
      title: "Old Amount",
      dataIndex: "old_amount",
      key: "old_amount",
      width: 140,

      render: (amount) => (
        <span className="text-gray-400 line-through">₹{amount}</span>
      ),
    },

    {
      title: "New Amount",
      dataIndex: "new_amount",
      key: "new_amount",
      width: 140,

      render: (amount) => (
        <span className="font-semibold text-gray-800">₹{amount}</span>
      ),
    },

    {
      title: "Features",
      dataIndex: "features",
      key: "features",
      width: 400,

      render: (features) => {
        let featureList = features;

        if (typeof features === "string") {
          try {
            featureList = JSON.parse(features);
          } catch {
            featureList = [features];
          }
        }

        return (
          <div className="flex flex-col gap-1">
            {featureList?.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="mt-1 text-gray-500">•</span>

                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        );
      },
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,

      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },

    {
      title: "Action",
      key: "action",
      width: 100,

      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/dashboard/plans/edit/${record.id}`)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Plans</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage subscription plans
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/dashboard/plans/create")}
        >
          Add Plan
        </Button>
      </div>

      {/* FILTER */}

      <Card className="mb-4">
        <div className="flex flex-end gap-3">
          <Select
            value={status}
            onChange={handleStatusChange}
            className="w-40"
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
      </Card>

      {/* TABLE */}

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={plans}
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,

            showSizeChanger: true,

            pageSizeOptions: ["10", "20", "50"],

            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} plans`,

            onChange: (page, pageSize) => {
              getPlans(page, pageSize, search, status);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default PlanList;
