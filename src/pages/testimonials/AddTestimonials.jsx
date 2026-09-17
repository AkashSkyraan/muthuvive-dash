import React, { useEffect, useState } from "react";
import { Form, Input, Button, Select, Upload, message } from "antd";
import { PlusOutlined, UploadOutlined, EditOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

import { postUpload } from "../../api/upload.api";
import { postTestimonials } from "../../api/testimonial.api";

const AddTestimonial = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const Navigate = useNavigate();

  // Get testimonial data passed from ListTestimonials
  const testimonial = location.state?.testimonial;

  const isEdit = !!testimonial?.id;

  const [loading, setLoading] = useState(false);

  // New image selected by user
  const [file, setFile] = useState(null);

  // Image displayed inside Ant Design Upload
  const [fileList, setFileList] = useState([]);

  // Existing image from API
  const [existingImage, setExistingImage] = useState(null);

  // Prefill form when editing
  useEffect(() => {
    if (testimonial?.id) {
      form.setFieldsValue({
        name: testimonial.name,
        content: testimonial.content,
        rating: testimonial.rating,
        location: testimonial.location,
      });

      setExistingImage(testimonial.image);

      // Show existing image in Upload
      setFileList([
        {
          uid: "-1",
          name: "testimonial-image",
          status: "done",
          url: testimonial.image,
        },
      ]);
    } else {
      // Reset when opening Add mode
      form.resetFields();
      setFile(null);
      setFileList([]);
      setExistingImage(null);
    }
  }, [testimonial, form]);

  const handleFileChange = ({ fileList }) => {
    setFileList(fileList);

    if (fileList.length > 0) {
      const selectedFile = fileList[0].originFileObj;

      if (selectedFile) {
        // New image selected
        setFile(selectedFile);
      }
    } else {
      // Upload cleared
      setFile(null);
    }
  };

  const handleFinish = async (values) => {
    try {
      setLoading(true);

      /*
       * Keep the existing image by default.
       *
       * If the user selects a new image,
       * this will be replaced with the newly uploaded image path.
       */
      let imagePath = existingImage;

      // Upload only when a new image has been selected
      if (file) {
        const uploadResponse = await postUpload(file);

        console.log("Image upload response:", uploadResponse);

        imagePath = uploadResponse?.data[0]?.path;

        if (!imagePath) {
          throw new Error("Image path was not returned from upload API");
        }
      }

      // ADD
      if (!isEdit) {
        // New testimonial requires an image
        if (!imagePath) {
          message.error("Please select a testimonial image");
          return;
        }

        const payload = {
          name: values.name,
          image: imagePath,
          content: values.content,
          rating: values.rating,
          location: values.location,
          status: "active",
        };

        console.log("Add testimonial payload:", payload);

        const response = await postTestimonials(payload);

        console.log("Testimonial added:", response);

        message.success("Testimonial added successfully");
      }

      // EDIT
      else {
        // Convert full image URL to only uploads/...
        const existingImagePath = existingImage
          ? existingImage.split("uploads/")[1]
            ? `uploads/${existingImage.split("uploads/")[1]}`
            : existingImage
          : null;

        // If a new image was uploaded, use its returned path.
        // Otherwise use the existing image path.
        imagePath = file ? imagePath : existingImagePath;

        const payload = {
          id: testimonial.id,
          name: values.name,
          image: imagePath,
          content: values.content,
          rating: values.rating,
          location: values.location,
          status: testimonial.status,
        };

        console.log("Update testimonial payload:", payload);

        const response = await postTestimonials(payload);

        console.log("Testimonial updated:", response);

        message.success("Testimonial updated successfully");
      }

      // Reset after successful submit
      form.resetFields();
      setFile(null);
      setFileList([]);
      setExistingImage(null);
      Navigate("/dashboard/testimonial/list");
    } catch (error) {
      console.error("Error saving testimonial:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save testimonial",
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
          {isEdit ? "Update Testimonial" : "Add Testimonial"}
        </h1>

        <p className="mt-1 text-base text-gray-500">
          {isEdit
            ? "Update the customer testimonial details."
            : "Add a customer testimonial to your website."}
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-lg p-5 sm:p-6">
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {/* Image */}
          <Form.Item label={<span className="text-lg">Testimonial Image</span>}>
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

          {/* Name */}
          <Form.Item
            label={<span className="text-lg">Name</span>}
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter name",
              },
              {
                whitespace: true,
                message: "Name cannot be empty",
              },
            ]}
          >
            <Input placeholder="Enter customer name" size="large" />
          </Form.Item>

          {/* Content */}
          <Form.Item
            label={<span className="text-lg">Testimonial</span>}
            name="content"
            rules={[
              {
                required: true,
                message: "Please enter testimonial",
              },
              {
                whitespace: true,
                message: "Testimonial cannot be empty",
              },
            ]}
          >
            <Input.TextArea
              placeholder="Enter testimonial"
              rows={5}
              size="large"
            />
          </Form.Item>

          {/* Rating */}
          <Form.Item
            label={<span className="text-lg">Rating</span>}
            name="rating"
            rules={[
              {
                required: true,
                message: "Please select rating",
              },
            ]}
          >
            <Select
              placeholder="Select rating"
              size="large"
              options={[
                { value: 1, label: "1 Star" },
                { value: 2, label: "2 Stars" },
                { value: 3, label: "3 Stars" },
                { value: 4, label: "4 Stars" },
                { value: 5, label: "5 Stars" },
              ]}
            />
          </Form.Item>

          {/* Location */}
          <Form.Item
            label={<span className="text-lg">Location</span>}
            name="location"
            rules={[
              {
                required: true,
                message: "Please enter location",
              },
              {
                whitespace: true,
                message: "Location cannot be empty",
              },
            ]}
          >
            <Input placeholder="Enter location" size="large" />
          </Form.Item>

          {/* Submit */}
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={isEdit ? <EditOutlined /> : <PlusOutlined />}
              size="large"
            >
              {isEdit ? "Update Testimonial" : "Add Testimonial"}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default AddTestimonial;
