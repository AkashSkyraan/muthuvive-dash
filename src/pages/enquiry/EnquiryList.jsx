import React, { useEffect, useState } from "react";
import { Button, Card, Select, Table, Tag, message, Popconfirm } from "antd";
import { CloseOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import axiosInstance from "../../api/axios";

const EnquiryList = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("pending");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const getEnquiries = async (
    page = pagination.current,
    limit = pagination.pageSize,
    selectedStatus = status,
  ) => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/enquiry/get-enquiries", {
        params: {
          page,
          limit,
          status: selectedStatus,
        },
      });

      if (response?.data?.success === 1) {
        setEnquiries(response.data.data || []);

        setPagination((prev) => ({
          ...prev,
          current: page,
          pageSize: limit,
          total: response?.data?.total || 0,
        }));

        return;
      }

      message.error(response?.data?.message || "Failed to fetch enquiries");
    } catch (error) {
      console.error("Get enquiries error:", error);

      message.error(
        error?.response?.data?.message || "Failed to fetch enquiries",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEnquiries(1, pagination.pageSize, status);
  }, [status]);

  const handleClose = async (id) => {
    try {
      setLoading(true);

      const response = await axiosInstance.patch(`/enquiry/status`, {
        id: `${id}`,
        status: "closed",
      });

      if (response?.data?.success === 1) {
        message.success(
          response?.data?.message || "Enquiry closed successfully",
        );

        await getEnquiries(pagination.current, pagination.pageSize, status);

        return;
      }

      message.error(response?.data?.message || "Failed to close enquiry");
    } catch (error) {
      console.error("Close enquiry error:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to close enquiry",
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "S.No",
      width: 70,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Name",
       width: 170,
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mobile",
       width: 150,
      dataIndex: "mobile",
      key: "mobile",
    },
    {
      title: "Email",
       width: 170,
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Regarding",
       width: 150,
      dataIndex: "regarding",
      key: "regarding",
    },
    {
      title: "Property ID",
      dataIndex: "property_id",
       width: 150,
      key: "property_id",
      render: (value) => value || "-",
    },
    {
      title: "User ID",
       width: 120,
      dataIndex: "user_id",
      key: "user_id",
      render: (value) => value || "-",
    },
    {
      title: "Message",
       width: 300,
      dataIndex: "messages",
      key: "messages",
      ellipsis: true,
    },
    {
      title: "Status",
       width: 100,
      dataIndex: "status",
      key: "status",
      render: (value) => (
        <Tag color={value === "pending" ? "orange" : "green"}>
          {value?.toUpperCase()}
        </Tag>
      ),
    },

    {
      title: "Action",
      key: "action",
      width: 130,
      fixed: "right",
      render: (_, record) => (
        <Popconfirm
          title="Close this enquiry?"
          description="This enquiry will be marked as closed."
          okText="Yes"
          cancelText="No"
          onConfirm={() => handleClose(record.id)}
          disabled={record.status === "closed"}
        >
          <Button
            danger
            size="small"
            icon={<CloseOutlined />}
            disabled={record.status === "closed"}
          >
            Close
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Enquiries</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage property enquiries
          </p>
        </div>

        <Select
          value={status}
          onChange={setStatus}
          className="w-36"
          options={[
            {
              label: "Pending",
              value: "pending",
            },
            {
              label: "Closed",
              value: "closed",
            },
          ]}
        />
      </div>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={enquiries}
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} enquiries`,
          }}
          onChange={(paginationInfo) => {
            getEnquiries(
              paginationInfo.current,
              paginationInfo.pageSize,
              status,
            );
          }}
        />
      </Card>
    </div>
  );
};

export default EnquiryList;
