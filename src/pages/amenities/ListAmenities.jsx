import React, { useEffect, useState } from "react";
import { Table, Select, Button, Popconfirm, message, Tag, Space } from "antd";
import {
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { getAmenity, postAmenity } from "../../api/amenities.api.js";

const ListAmenities = () => {
  const navigate = useNavigate();

  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("active");

  // Fetch amenities
  const fetchAmenities = async () => {
    try {
      setLoading(true);

      const response = await getAmenity();

      console.log("Amenities:", response);

      setAmenities(response || []);
    } catch (error) {
      console.error("Error fetching amenities:", error);

      message.error(
        error?.response?.data?.message || "Failed to load amenities",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  // Edit amenity
  const handleEdit = (record) => {
    navigate(`/dashboard/amenities/add`, {
      state: {
        amenity: record,
      },
    });
  };

  // Make amenity inactive
  const handleInactive = async (record) => {
    try {
      const payload = {
        id: record.id,
        name: record.name,
        status: "inactive",
      };

      await postAmenity(payload);

      message.success("Amenity marked as inactive");

      fetchAmenities();
    } catch (error) {
      console.error("Error updating amenity:", error);

      message.error(
        error?.response?.data?.message || "Failed to update amenity",
      );
    }
  };

  // Make amenity active
  const handleActive = async (record) => {
    try {
      const payload = {
        id: record.id,
        name: record.name,
        status: "active",
      };

      await postAmenity(payload);

      message.success("Amenity activated successfully");

      fetchAmenities();
    } catch (error) {
      console.error("Error updating amenity:", error);

      message.error(
        error?.response?.data?.message || "Failed to activate amenity",
      );
    }
  };

  // Filter amenities based on selected status
  const filteredAmenities = amenities.filter((item) => item.status === status);

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 80,
      align: "center",
      render: (_, __, index) => index + 1,
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value) => (
        <Tag color={value === "active" ? "success" : "default"}>
          {value?.toUpperCase()}
        </Tag>
      ),
    },

    {
      title: "Action",
      key: "action",
      width: 180,
      render: (_, record) => (
        <Space>
          {/* Edit */}
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />

          {/* Inactive */}
          {record.status === "active" && (
            <Popconfirm
              title="Make this amenity inactive?"
              description={`Are you sure you want to make "${record.name}" inactive?`}
              okText="Yes"
              cancelText="Cancel"
              onConfirm={() => handleInactive(record)}
            >
              <Button
                type="text"
                danger
                icon={<StopOutlined />}
                title="Inactive"
              />
            </Popconfirm>
          )}

          {/* Activate */}
          {record.status === "inactive" && (
            <Popconfirm
              title="Activate this amenity?"
              description={`Are you sure you want to activate "${record.name}"?`}
              okText="Yes"
              cancelText="Cancel"
              onConfirm={() => handleActive(record)}
            >
              <Button
                type="text"
                icon={<CheckCircleOutlined />}
                title="Activate"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Amenities
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage property amenities.
          </p>
        </div>

        {/* Status Filter */}
        <Select
          value={status}
          onChange={setStatus}
          className="w-32"
          options={[
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

      {/* Table */}
      <div className="w-full bg-white border border-gray-200 rounded-lg">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredAmenities}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} amenities`,
          }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default ListAmenities;
