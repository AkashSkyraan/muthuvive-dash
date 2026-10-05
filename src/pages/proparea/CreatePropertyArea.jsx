import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Upload,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  InboxOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import axiosInstance from "../../api/axios";

const { Dragger } = Upload;

const CreatePropertyArea = () => {
  const [form] = Form.useForm();

  const navigate = useNavigate();
  const { id } = useParams();

  // ==========================================
  // EDIT CHECK
  // ==========================================

  const isEdit = Boolean(id);

  // ==========================================
  // STATES
  // ==========================================

  const [loading, setLoading] = useState(false);

  const [uploadingImage, setUploadingImage] =
    useState(false);

  // Full URL - only for preview
  const [previewImage, setPreviewImage] =
    useState("");

  // Relative path/src - only for submit
  const [uploadedImageSrc, setUploadedImageSrc] =
    useState("");

  // ==========================================
  // ASSET URL
  // ==========================================

  const ASSET_URL =
    import.meta.env.VITE_ASSET_URL || "";

  // ==========================================
  // BUILD PREVIEW URL
  // ==========================================

  const buildImageUrl = (src) => {
    if (!src) {
      return "";
    }

    // Already full URL
    if (
      src.startsWith("http://") ||
      src.startsWith("https://")
    ) {
      return src;
    }

    const base =
      ASSET_URL.replace(/\/+$/, "");

    const path =
      src.replace(/^\/+/, "");

    return `${base}/${path}`;
  };

  // ==========================================
  // CONVERT FULL URL -> SRC
  // ==========================================

  const extractImageSrc = (image) => {
    if (!image) {
      return "";
    }

    // Already relative path
    if (
      !image.startsWith("http://") &&
      !image.startsWith("https://")
    ) {
      return image.replace(/^\/+/, "");
    }

    const base =
      ASSET_URL.replace(/\/+$/, "");

    // Remove asset URL if it matches
    if (
      base &&
      image.startsWith(base)
    ) {
      return image
        .slice(base.length)
        .replace(/^\/+/, "");
    }

    // Fallback
    try {
      const url = new URL(image);

      return url.pathname.replace(
        /^\/+/,
        "",
      );
    } catch {
      return image.replace(
        /^\/+/,
        "",
      );
    }
  };

  // ==========================================
  // GET PROPERTY AREA FOR EDIT
  // ==========================================

  useEffect(() => {
    if (isEdit && id) {
      getPropertyArea();
    }
  }, [id, isEdit]);

  const getPropertyArea = async () => {
    try {
      setLoading(true);

      const response =
        await axiosInstance.get(
          `/property/property-area?id=${id}`,
        );

      console.log(
        "GET PROPERTY AREA:",
        response?.data,
      );

      if (
        response?.data?.success !== 1 ||
        !Array.isArray(
          response?.data?.data,
        ) ||
        response.data.data.length === 0
      ) {
        message.error(
          response?.data?.message ||
            "Property area not found",
        );

        navigate(
          "/property-area/list",
        );

        return;
      }

      const area =
        response.data.data[0];

      // ========================================
      // SET FORM VALUES
      // ========================================

      form.setFieldsValue({
        name: area?.name || "",

        property_count:
          area?.property_count ??
          0,

        status:
          area?.status ||
          "active",
      });

      // ========================================
      // EXISTING IMAGE
      // ========================================

      if (area?.image) {
        // Convert full URL to relative src
        const imageSrc =
          extractImageSrc(
            area.image,
          );

        // Save relative path
        setUploadedImageSrc(
          imageSrc,
        );

        // Build full preview URL
        setPreviewImage(
          buildImageUrl(
            imageSrc,
          ),
        );
      } else {
        setUploadedImageSrc("");
        setPreviewImage("");
      }
    } catch (error) {
      console.error(
        "Get property area error:",
        error,
      );

      message.error(
        error?.response?.data
          ?.message ||
          "Failed to fetch property area",
      );

      navigate(
        "/property-area/list",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // IMAGE UPLOAD
  // ==========================================

  const handleImageUpload = async (
    file,
  ) => {
    try {
      setUploadingImage(true);

      // ========================================
      // ACTUAL FILE
      // ========================================

      const actualFile =
        file?.originFileObj || file;

      if (
        !(actualFile instanceof File)
      ) {
        throw new Error(
          "Invalid image file",
        );
      }

      // ========================================
      // LOCAL PREVIEW
      // ========================================

      const localPreview =
        URL.createObjectURL(
          actualFile,
        );

      setPreviewImage(
        localPreview,
      );

      // ========================================
      // FORM DATA
      // ========================================

      const uploadFormData =
        new FormData();

      // Backend uses upload.array("files", 10)
      uploadFormData.append(
        "files",
        actualFile,
      );

      // ========================================
      // UPLOAD API
      // ========================================

      const response =
        await axiosInstance.post(
          "/upload",
          uploadFormData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          },
        );

      console.log(
        "UPLOAD RESPONSE:",
        response?.data,
      );

      // ========================================
      // CHECK RESPONSE
      // ========================================

      if (
        response?.data?.success !== 1
      ) {
        throw new Error(
          response?.data?.message ||
            "Image upload failed",
        );
      }

      // ========================================
      // GET FIRST UPLOADED FILE
      // ========================================

      const uploadedFile =
        response?.data?.data?.[0];

      if (!uploadedFile) {
        throw new Error(
          "Uploaded file not found",
        );
      }

      // ========================================
      // GET SRC / PATH
      // ========================================

      const imageSrc =
        uploadedFile?.path ||
        uploadedFile?.src ||
        "";

      if (!imageSrc) {
        throw new Error(
          "Image src/path not received",
        );
      }

      // ========================================
      // SAVE ONLY SRC
      // ========================================

      setUploadedImageSrc(
        imageSrc,
      );

      // ========================================
      // PREVIEW FULL URL
      // ========================================

      setPreviewImage(
        buildImageUrl(
          imageSrc,
        ),
      );

      message.success(
        "Image uploaded successfully",
      );
    } catch (error) {
      console.error(
        "Image upload error:",
        error,
      );

      console.error(
        "Backend response:",
        error?.response?.data,
      );

      setUploadedImageSrc("");
      setPreviewImage("");

      message.error(
        error?.response?.data
          ?.message ||
          error?.message ||
          "Failed to upload image",
      );
    } finally {
      setUploadingImage(false);
    }

    return false;
  };

  // ==========================================
  // UPLOAD PROPS
  // ==========================================

  const uploadProps = {
    name: "files",

    multiple: false,

    maxCount: 1,

    showUploadList: false,

    accept:
      "image/png,image/jpeg,image/jpg,image/webp",

    beforeUpload: async (
      file,
    ) => {
      const actualFile =
        file?.originFileObj || file;

      // ========================================
      // IMAGE TYPE
      // ========================================

      const isImage =
        actualFile?.type?.startsWith(
          "image/",
        );

      if (!isImage) {
        message.error(
          "Please upload an image file",
        );

        return Upload.LIST_IGNORE;
      }

      // ========================================
      // IMAGE SIZE
      // ========================================

      const isValidSize =
        actualFile.size /
          1024 /
          1024 <
        5;

      if (!isValidSize) {
        message.error(
          "Image must be smaller than 5MB",
        );

        return Upload.LIST_IGNORE;
      }

      // ========================================
      // UPLOAD IMMEDIATELY
      // ========================================

      await handleImageUpload(
        actualFile,
      );

      return false;
    },

    onRemove: () => {
      setPreviewImage("");
      setUploadedImageSrc("");

      return true;
    },
  };

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (
    values,
  ) => {
    try {
      // ========================================
      // VALIDATE IMAGE UPLOAD
      // ========================================

      if (uploadingImage) {
        message.warning(
          "Please wait until image upload is completed",
        );

        return;
      }

      setLoading(true);

      // ========================================
      // PAYLOAD
      // ========================================

      const payload = {
        ...(isEdit
          ? {
              id: Number(id),
            }
          : {}),

        name: String(
          values?.name || "",
        ).trim(),

        property_count: Number(
          values?.property_count ||
            0,
        ),

        status:
          values?.status ||
          "active",

        /*
          IMPORTANT:

          Only src/path will be sent.

          Example:
          uploads/property-area/a.jpg
        */

        image:
          uploadedImageSrc || null,
      };

      console.log(
        "PROPERTY AREA PAYLOAD:",
        payload,
      );

      // ========================================
      // CREATE / UPDATE API
      // ========================================

      const response =
        await axiosInstance.post(
          "/property/add-property-area",
          payload,
        );

      console.log(
        "SAVE RESPONSE:",
        response?.data,
      );

      // ========================================
      // SUCCESS
      // ========================================

      if (
        response?.data?.success === 1
      ) {
        message.success(
          response?.data?.message ||
            (isEdit
              ? "Property area updated successfully"
              : "Property area created successfully"),
        );

        navigate(
          "/property-area/list",
        );

        return;
      }

      message.error(
        response?.data?.message ||
          "Failed to save property area",
      );
    } catch (error) {
      console.error(
        "Property area save error:",
        error,
      );

      console.error(
        "Backend response:",
        error?.response?.data,
      );

      message.error(
        error?.response?.data
          ?.message ||
          "Failed to save property area",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // BACK
  // ==========================================

  const handleBack = () => {
    navigate(
      "/property-area/list",
    );
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="w-full">
      {/* ======================================
          HEADER
      ====================================== */}

      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEdit
              ? "Edit Property Area"
              : "Create Property Area"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? "Update property area details"
              : "Add a new property area"}
          </p>
        </div>

        <Button
          icon={
            <ArrowLeftOutlined />
          }
          onClick={handleBack}
        >
          Back
        </Button>
      </div>

      {/* ======================================
          FORM CARD
      ====================================== */}

      <Card
        loading={
          isEdit &&
          loading
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            status: "active",
            property_count: 0,
          }}
        >
          {/* ==================================
              FORM FIELDS
          ================================== */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* NAME */}

            <Form.Item
              label="Property Area Name"
              name="name"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter property area name",
                },
                {
                  whitespace: true,
                  message:
                    "Property area name cannot be empty",
                },
              ]}
            >
              <Input
                size="large"
                placeholder="Enter property area name"
                maxLength={100}
              />
            </Form.Item>

            {/* PROPERTY COUNT */}

            <Form.Item
              label="Property Count"
              name="property_count"
              rules={[
                {
                  required: true,
                  message:
                    "Please enter property count",
                },
              ]}
            >
              <Input
                size="large"
                type="number"
                min={0}
                placeholder="Enter property count"
              />
            </Form.Item>

            {/* STATUS */}

            <Form.Item
              label="Status"
              name="status"
              rules={[
                {
                  required: true,
                  message:
                    "Please select status",
                },
              ]}
            >
              <Select
                size="large"
                placeholder="Select status"
              >
                <Select.Option value="active">
                  Active
                </Select.Option>

                <Select.Option value="inactive">
                  Inactive
                </Select.Option>
              </Select>
            </Form.Item>
          </div>

          {/* ==================================
              IMAGE
          ================================== */}

          <Form.Item label="Property Area Image">
            <Dragger
              {...uploadProps}
              disabled={
                uploadingImage ||
                loading
              }
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>

              <p className="ant-upload-text">
                {uploadingImage
                  ? "Uploading image..."
                  : "Click or drag image to this area"}
              </p>

              <p className="ant-upload-hint">
                JPG, PNG or WEBP.
                Maximum 5MB.
              </p>
            </Dragger>

            {/* =================================
                IMAGE PREVIEW
            ================================= */}

            {previewImage && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-600">
                  Preview
                </p>

                <div className="relative w-fit">
                  <img
                    src={previewImage}
                    alt="Property Area"
                    className="h-32 w-48 rounded-lg border object-cover"
                  />

                  {/* UPLOAD LOADING */}

                  {uploadingImage && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40">
                      <span className="text-sm font-medium text-white">
                        Uploading...
                      </span>
                    </div>
                  )}

                  {/* REMOVE */}

                  {!uploadingImage && (
                    <Button
                      danger
                      size="small"
                      className="absolute right-1 top-1"
                      onClick={() => {
                        setPreviewImage("");
                        setUploadedImageSrc("");
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Form.Item>

          {/* ==================================
              ACTION BUTTONS
          ================================== */}

          <div className="flex justify-end gap-3">
            <Button
              size="large"
              onClick={handleBack}
              disabled={
                loading ||
                uploadingImage
              }
            >
              Cancel
            </Button>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              disabled={
                uploadingImage
              }
              icon={
                <SaveOutlined />
              }
            >
              {isEdit
                ? "Update"
                : "Create"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreatePropertyArea;