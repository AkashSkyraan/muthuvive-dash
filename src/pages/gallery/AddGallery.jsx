import React, { useState } from "react";
import { Form, Input, Button, Select, Upload, message } from "antd";
import { PlusOutlined, UploadOutlined } from "@ant-design/icons";

import { postUpload } from "../../api/upload.api";
import { postGallery } from "../../api/gallery.api";

const AddGallery = () => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileList, setFileList] = useState([]);

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);

    if (fileList.length > 0) {
      setFile(fileList[0].originFileObj);
    } else {
      setFile(null);
    }
  };

  const handleFinish = async (values) => {
    if (!file) {
      message.error("Please select an image");
      return;
    }

    try {
      setLoading(true);

      const uploadResponse = await postUpload(file);

      // Get image URL from upload response
      const imageUrl = uploadResponse?.data[0]?.path;

      if (!imageUrl) {
        throw new Error("Image URL was not returned from upload API");
      }

      const payload = {
        image: imageUrl,
        type: values.type,
        is_hero: values.is_hero,
        status: "active",
      };

      const response = await postGallery(payload);

      message.success("Gallery image added successfully");

      form.resetFields();
      setFile(null);
      setFileList([]);
    } catch (error) {
      console.error("Error adding gallery:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add gallery image",
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
          Add Gallery
        </h1>

        <p className="mt-1 text-base text-gray-500">
          Upload a property image and add its details.
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg p-5 sm:p-6">
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {/* Image */}
          <Form.Item label={<span className="text-lg">Gallery Image</span>}>
            <Upload
              maxCount={1}
              accept="image/*"
              beforeUpload={() => false}
              fileList={fileList}
              onChange={handleFileChange}
              onRemove={() => {
                setFile(null);
                setFileList([]);
              }}
              listType="picture"
            >
              <Button icon={<UploadOutlined />} size="large">
                Select Image
              </Button>
            </Upload>
          </Form.Item>

          {/* Type */}
          <Form.Item
            label={<span className="text-lg">Type</span>}
            name="type"
            rules={[
              {
                required: true,
                message: "Please enter type",
              },
              {
                whitespace: true,
                message: "Type cannot be empty",
              },
            ]}
          >
            <Input placeholder="Enter type" size="large" />
          </Form.Item>

          {/* Is Hero */}
          <Form.Item
            label={<span className="text-lg">Is Hero Image</span>}
            name="is_hero"
            rules={[
              {
                required: true,
                message: "Please select yes or no",
              },
            ]}
          >
            <Select
              placeholder="Select yes or no"
              size="large"
              options={[
                {
                  value: 1,
                  label: "Yes",
                },
                {
                  value: 0,
                  label: "No",
                },
              ]}
            />
          </Form.Item>

          {/* Submit */}
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<PlusOutlined />}
              size="large"
            >
              Add Image
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddGallery;
