import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, Select, Space, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import axiosInstance from "../../api/axios";

const CreateSubAdmin = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  // ============================================
  // GET SUB ADMIN
  // ============================================

  const getSubAdmin = async () => {
    try {
      setFetchLoading(true);

      const response = await axiosInstance.get("/admin/sub-admins", {
        params: {
          id,
        },
      });

      if (response?.data?.success === 1 && response?.data?.data) {
        const admin = Array.isArray(response.data.data)
          ? response.data.data[0]
          : response.data.data;

        form.setFieldsValue({
          name: admin.name,
          password: admin.password,
          status: admin.status,
        });
      } else {
        message.error(response?.data?.message || "Failed to fetch sub admin");

        navigate("/admin/dashboard/sub-admin/list");
      }
    } catch (error) {
      console.error("Get Sub Admin Error:", error?.response?.data || error);

      message.error(
        error?.response?.data?.message || "Failed to fetch sub admin",
      );

      navigate("/admin/dashboard/sub-admin/list");
    } finally {
      setFetchLoading(false);
    }
  };

  // ============================================
  // EDIT → FETCH DATA
  // ============================================

  useEffect(() => {
    if (isEdit) {
      getSubAdmin();
    }
  }, [id]);

  // ============================================
  // CREATE / UPDATE
  // ============================================

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const payload = {
        ...(isEdit ? { id: Number(id) } : {}),
        role: "subadmin",
        name: values.name.trim(),
        status: values.status,
        ...(values.password ? { password: values.password } : {}),
      };

      console.log(isEdit ? "UPDATE SUB ADMIN:" : "CREATE SUB ADMIN:", payload);

      const response = await axiosInstance.post("/admin/create-admin", payload);

      console.log(
        isEdit ? "UPDATE SUB ADMIN RESPONSE:" : "CREATE SUB ADMIN RESPONSE:",
        response.data,
      );

      if (response?.data?.success === 1) {
        message.success(
          response?.data?.message ||
            (isEdit
              ? "Sub admin updated successfully"
              : "Sub admin created successfully"),
        );

        form.resetFields();

        navigate("/admin/dashboard/sub-admin/list");
      } else {
        message.error(
          response?.data?.message ||
            (isEdit
              ? "Failed to update sub admin"
              : "Failed to create sub admin"),
        );
      }
    } catch (error) {
      console.error(
        "Create/Update Sub Admin Error:",
        error?.response?.data || error,
      );

      message.error(
        error?.response?.data?.message ||
          (isEdit
            ? "Failed to update sub admin"
            : "Failed to create sub admin"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEdit ? "Edit Sub Admin" : "Create Sub Admin"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? "Update sub admin details"
              : "Create a new sub admin account"}
          </p>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/admin/dashboard/sub-admin/list")}
        >
          Back to List
        </Button>
      </div>

      {/* FORM */}

      <Card loading={fetchLoading} className="w-full">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "active",
          }}
          autoComplete="off"
        >
          {/* NAME */}

          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter sub admin name",
              },
              {
                min: 3,
                message: "Name must be at least 3 characters",
              },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Enter sub admin name"
              maxLength={100}
            />
          </Form.Item>

          {/* PASSWORD */}

          <Form.Item
            label={isEdit ? "New Password" : "Password"}
            name="password"
            rules={[
              ...(isEdit
                ? []
                : [
                    {
                      required: true,
                      message: "Please enter password",
                    },
                  ]),
              {
                min: 8,
                message: "Password must be at least 8 characters",
              },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder={
                isEdit
                  ? "Leave empty to keep current password"
                  : "Enter password"
              }
            />
          </Form.Item>

          {/* STATUS */}

          <Form.Item
            label="Status"
            name="status"
            rules={[
              {
                required: true,
                message: "Please select status",
              },
            ]}
          >
            <Select
              size="large"
              suffixIcon={<CheckCircleOutlined />}
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
          </Form.Item>

          {/* BUTTONS */}

          <Form.Item className="mb-0 mt-8">
            <Space>
              <Button
                size="large"
                onClick={() => navigate("/admin/dashboard/sub-admin/list")}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                {isEdit ? "Update Sub Admin" : "Create Sub Admin"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateSubAdmin;
