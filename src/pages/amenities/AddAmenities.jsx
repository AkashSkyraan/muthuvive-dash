import React, { useEffect, useState } from "react";
import { Form, Input, Button, message } from "antd";
import { PlusOutlined, EditOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

import { postAmenity } from "../../api/amenities.api";

const AddAmenity = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Selected record coming from List Amenities
  const record = location.state?.amenity;

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
          status: record.status,
        };
      } else {
        // Add
        payload = {
          name: values.name,
        };
      }

      const response = await postAmenity(payload);

      // console.log(record?.id ? "Amenity updated:" : "Amenity added:", response);

      message.success(
        record?.id
          ? "Amenity updated successfully"
          : "Amenity added successfully",
      );

      form.resetFields();
      navigate("/amenities/list");
    } catch (error) {
      console.error(
        record?.id ? "Error updating amenity:" : "Error adding amenity:",
        error,
      );

      message.error(
        error?.response?.data?.message ||
          (record?.id ? "Failed to update amenity" : "Failed to add amenity"),
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
          {record?.id ? "Update Amenity" : "Add Amenity"}
        </h1>

        <p className="mt-1 text-base text-gray-500">
          {record?.id
            ? "Update the amenity for your property listings."
            : "Add a new amenity to your property listings."}
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg p-5 sm:p-6">
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label={<span className="text-lg">Amenity Name</span>}
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter amenity name",
              },
              {
                whitespace: true,
                message: "Amenity name cannot be empty",
              },
              {
                // min: 3,
                max: 60,
                message: "Amenity name must be maximum 60 characters",
              },
            ]}
          >
            <Input placeholder="Enter amenity name" size="large" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={record?.id ? <EditOutlined /> : <PlusOutlined />}
              size="large"
            >
              {record?.id ? "Update Amenity" : "Add Amenity"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddAmenity;
