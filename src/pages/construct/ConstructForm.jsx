import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import {
  createConsultant,
  getConsultantById,
  uploadMedia,
} from "../../api/about.api";

const ASSET_URL = import.meta.env.VITE_ASSET_URL || "";

const ConstructionConsultantForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [existingImage, setExistingImage] = useState(null);

  const LIST_URL = "/admin/dashboard/const-consultants/list";

  /**
   * Get existing consultant
   */
  const fetchConsultant = async () => {
    try {
      setLoading(true);

      const response = await getConsultantById(id);

      if (response?.success === 1) {
        const consultant = response?.data?.[0];

        console.log(consultant, "cs");

        form.setFieldsValue({
          name: consultant?.name || "",
          role: consultant?.role || "",
        });

        if (consultant?.image) {
          setExistingImage(
            consultant.image
              ? consultant.image
              : `${consultant.image}`,
          );
        }
      } else {
        message.error(response?.message || "Failed to fetch consultant");

        navigate(LIST_URL);
      }
    } catch (error) {
      console.error("Get Consultant Error:", error);

      message.error(
        error?.response?.data?.message || "Failed to fetch consultant",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      fetchConsultant();
    }
  }, [id]);

  const handleUploadMedia = async () => {
    if (!fileList.length) {
      return null;
    }

    const file = fileList[0]?.originFileObj;

    if (!file) {
      return null;
    }

    const uploadFormData = new FormData();

    uploadFormData.append("files", file);

    const response = await uploadMedia(uploadFormData);

    if (response?.success !== 1) {
      throw new Error(response?.message || "Image upload failed");
    }

    /**
     * Adjust this based on your uploadMedia response.
     */
    const uploadedUrl =
      response?.data?.[0]?.path || response?.data?.path || response?.path;

    if (!uploadedUrl) {
      throw new Error("Upload URL not found");
    }

    return uploadedUrl;
  };

  /**
   * Submit
   */
  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      let imageUrl = existingImage;

      if (fileList.length > 0) {
        imageUrl = await handleUploadMedia();
      }

      const payload = {
        ...(isEdit && {
          id: Number(id),
        }),
        name: values.name,
        role: values.role,
        image: imageUrl,
      };

      const response = await createConsultant(payload);

      if (response?.success === 1) {
        message.success(
          response?.message ||
            (isEdit
              ? "Consultant updated successfully"
              : "Consultant created successfully"),
        );

        navigate(LIST_URL);
        return;
      }

      message.error(response?.message || "Something went wrong");
    } catch (error) {
      console.error("Consultant Submit Error:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload change
   */
  const handleUploadChange = ({ fileList: newFileList }) => {
    const latestFileList = newFileList.slice(-1);

    setFileList(latestFileList);

    /**
     * New image selected,
     * so hide old image preview.
     */
    if (latestFileList.length > 0) {
      setExistingImage(null);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-800">
          {isEdit
            ? "Edit Construction Consultant"
            : "Add Construction Consultant"}
        </h1>

        <p className="text-sm text-gray-500">
          {isEdit
            ? "Update consultant details"
            : "Add a new construction consultant"}
        </p>
      </div>

      <Card className="max-w-2xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          {/* Name */}
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter consultant name",
              },
            ]}
          >
            <Input placeholder="Enter consultant name" size="large" />
          </Form.Item>

          {/* Role */}
          <Form.Item
            label="Role"
            name="role"
            rules={[
              {
                required: true,
                message: "Please enter consultant role",
              },
            ]}
          >
            <Input placeholder="Enter consultant role" size="large" />
          </Form.Item>

          {/* Existing Image */}
          {isEdit && existingImage && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-gray-700">
                Current Image
              </p>

              <img
                src={`${ASSET_URL}${existingImage}`}
                alt="Current consultant"
                className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
              />
            </div>
          )}

          {/* Image */}
          <Form.Item label="Image">
            <Upload
              listType="picture-card"
              accept="image/png,image/jpeg,image/webp"
              maxCount={1}
              beforeUpload={() => false}
              fileList={fileList}
              onChange={handleUploadChange}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />

                  <div className="mt-1">Upload</div>
                </div>
              )}
            </Upload>

            <p className="mt-1 text-xs text-gray-400">
              JPG, PNG or WEBP. Maximum 5MB.
            </p>
          </Form.Item>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button onClick={() => navigate(LIST_URL)}>Cancel</Button>

            <Button type="primary" htmlType="submit" loading={loading}>
              {isEdit ? "Update Consultant" : "Create Consultant"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ConstructionConsultantForm;
