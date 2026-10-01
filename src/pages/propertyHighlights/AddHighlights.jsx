import React, { useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";

import { postHighlights } from "../../api/highlights.api";

const AddPropertyHighlight = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const location = useLocation();

  // Selected record coming from List Property Highlights
  const record = location.state?.highlight;

  useEffect(() => {
    if (record?.id) {
      form.setFieldsValue({
        name: record.name,
      });
    }
  }, [record, form]);

  const handleFinish = async (values) => {
    try {
      setLoading(true);

      let payload;

      if (record?.id) {
        // Update
        payload = {
          id: record.id,
          name: values.name,
          status: "active",
        };
      } else {
        // Add
        payload = {
          name: values.name,
          status: "active",
        };
      }

      const response = await postHighlights(payload);

      //   console.log(
      //     record?.id
      //       ? "Property highlight updated:"
      //       : "Property highlight added:",
      //     response,
      //   );

      message.success(
        record?.id
          ? "Property highlight updated successfully"
          : "Property highlight added successfully",
      );

      form.resetFields();
    } catch (error) {
      console.error(
        record?.id
          ? "Error updating property highlight:"
          : "Error adding property highlight:",
        error,
      );

      message.error(
        error?.response?.data?.message ||
          (record?.id
            ? "Failed to update property highlight"
            : "Failed to add property highlight"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 sm:p-6">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          {record?.id ? "Update Property Highlight" : "Add Property Highlight"}
        </h1>

        <p className="mt-1 text-base text-gray-500">
          {record?.id
            ? "Update the property highlight."
            : "Add a new property highlight."}
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg p-5 sm:p-6">
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label={<span className="text-lg">Property Highlights</span>}
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter property highlight",
              },
              {
                whitespace: true,
                message: "Property highlight cannot be empty",
              },
            ]}
          >
            <Input placeholder="Enter property highlight" size="large" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={record?.id ? <EditOutlined /> : <PlusOutlined />}
              size="large"
            >
              {record?.id
                ? "Update Property Highlight"
                : "Add Property Highlight"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddPropertyHighlight;
