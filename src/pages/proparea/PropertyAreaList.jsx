import React, { useEffect, useState } from "react";
import { Button, Card, Select, Table, Tag, message } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import axiosInstance from "../../api/axios";

const PropertyAreaList = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [propertyAreas, setPropertyAreas] = useState([]);

  const [status, setStatus] = useState("all");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // ==========================================
  // GET LIST
  // ==========================================

  const getPropertyAreas = async (
    page = 1,
    limit = 10,
    statusValue = "all",
  ) => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/property/property-area", {
        params: {
          page,
          limit,

          ...(statusValue !== "all"
            ? {
                status: statusValue,
              }
            : {}),
        },
      });

      console.log(response);
      if (response?.data?.success === 1) {
        setPropertyAreas(response?.data?.data || []);

        setPagination({
          current: page,
          pageSize: limit,
          total: Number(response?.data?.total) || 0,
        });
      } else {
        message.error(
          response?.data?.message || "Failed to fetch property areas",
        );
      }
    } catch (error) {
      console.error("Get property areas error:", error);

      message.error(
        error?.response?.data?.message || "Failed to fetch property areas",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPropertyAreas();
  }, []);

  // ==========================================
  // COLUMNS
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
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 120,
      render: (image) =>
        image ? (
          <img
            src={image}
            alt="Property Area"
            className="h-12 w-20 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-12 w-20 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
            No Image
          </div>
        ),
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 280,
      render: (name) => (
        <span className="font-medium text-gray-800">{name}</span>
      ),
    },

    {
      title: "Property Count",
      dataIndex: "property_count",
      key: "property_count",
      width: 150,
      render: (count) => <span className="font-medium">{count || 0}</span>,
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) =>
        status === "active" ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Inactive</Tag>
        ),
    },

    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() =>
            navigate(`/admin/dashboard/property-area/edit/${record.id}`)
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
      {/* HEADER */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Property Areas
          </h1>

          <p className="mt-1 text-sm text-gray-500">Manage property areas</p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/dashboard/property-area/create")}
        >
          Create Property Area
        </Button>
      </div>

      <Card>
        {/* STATUS FILTER */}

        <div className="mb-5 flex items-center gap-3">
          <Select
            size="large"
            value={status}
            onChange={(value) => {
              setStatus(value);

              getPropertyAreas(1, pagination.pageSize, value);
            }}
            className="w-40"
          >
            <Select.Option value="all">All Status</Select.Option>

            <Select.Option value="active">Active</Select.Option>

            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </div>

        {/* TABLE */}

        <Table
          rowKey="id"
          loading={loading}
          dataSource={propertyAreas}
          columns={columns}
          scroll={{ x: 900 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,

            showSizeChanger: true,

            pageSizeOptions: ["10", "20", "50"],

            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} property areas`,

            onChange: (page, pageSize) => {
              getPropertyAreas(page, pageSize, status);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default PropertyAreaList;
