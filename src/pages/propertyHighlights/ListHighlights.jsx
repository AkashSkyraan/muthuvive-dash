import React, { useEffect, useState } from "react";
import { Table, Select, Button, Popconfirm, message, Tag, Space } from "antd";

import {
  EditOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import { getHighlights, postHighlights } from "../../api/highlights.api";

const ListPropertyHighlights = () => {
  const navigate = useNavigate();

  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("active");

  const fetchHighlights = async () => {
    try {
      setLoading(true);

      const response = await getHighlights();

      setHighlights(response || []);
    } catch (error) {
      console.error("Error fetching property highlights:", error);

      message.error(
        error?.response?.data?.message || "Failed to load property highlights",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, []);

  const handleEdit = (record) => {
    navigate("/highlights/add", {
      state: {
        highlight: record,
      },
    });
  };

  const handleInactive = async (record) => {
    try {
      const payload = {
        id: record.id,
        name: record.name,
        status: "inactive",
      };

      await postHighlights(payload);

      message.success("Property highlight marked as inactive");

      fetchHighlights();
    } catch (error) {
      console.error("Error updating property highlight:", error);

      message.error(
        error?.response?.data?.message || "Failed to update property highlight",
      );
    }
  };

  const handleActive = async (record) => {
    try {
      const payload = {
        id: record.id,
        name: record.name,
        status: "active",
      };

      await postPropertyHighlight(payload);

      message.success("Property highlight activated successfully");

      fetchHighlights();
    } catch (error) {
      console.error("Error activating property highlight:", error);

      message.error(
        error?.response?.data?.message ||
          "Failed to activate property highlight",
      );
    }
  };

  const filteredHighlights = highlights.filter(
    (item) => item.status === status,
  );

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 80,
      align: "center",
      render: (_, __, index) => index + 1,
    },

    {
      title: "Property Highlight",
      dataIndex: "name",
      key: "name",
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value) => (
        <Tag
          color={value === "active" ? "success" : "default"}
          className="font-semibold"
        >
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
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />

          {record.status === "active" && (
            <Popconfirm
              title="Make this property highlight inactive?"
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

          {record.status === "inactive" && (
            <Popconfirm
              title="Activate this property highlight?"
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Property Highlights
          </h1>

          <p className="mt-1 text-base text-gray-500">
            Manage property highlights.
          </p>
        </div>

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

      <div className="w-full bg-white border border-gray-200 rounded-lg">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredHighlights}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} property highlights`,
          }}
          scroll={{ x: "max-content" }}
        />
      </div>
    </div>
  );
};

export default ListPropertyHighlights;
