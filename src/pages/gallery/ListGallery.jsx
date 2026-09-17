import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Popconfirm, message, Select } from "antd";
import { StopOutlined } from "@ant-design/icons";

import { getGallery, postGallery } from "../../api/gallery.api";

const ListGallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(false);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("active");

  const fetchGalleries = async () => {
    try {
      setLoading(true);

      const response = await getGallery();

      setGalleries(response || []);
    } catch (error) {
      console.error("Error fetching galleries:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch gallery images",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleries();
  }, []);

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  const handleInactive = async (record) => {
    try {
      setLoading(true);

      const payload = {
        id: record.id,
        image: record.image,
        type: record.type,
        status: "inactive",
        is_hero: record.is_hero,
      };

      console.log("Inactive gallery payload:", payload);

      await postGallery(payload);

      message.success("Gallery image marked as inactive");

      await fetchGalleries();
    } catch (error) {
      console.error("Error updating gallery status:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update gallery status",
      );
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from gallery type
  const categories = [
    ...new Set(galleries.map((item) => item.type).filter(Boolean)),
  ];

  // Filter galleries
  const filteredGalleries = galleries.filter((item) => {
    const categoryMatch =
      selectedCategory === "all" || item.type === selectedCategory;

    const statusMatch =
      selectedStatus === "all" || item.status === selectedStatus;

    return categoryMatch && statusMatch;
  });

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 80,
      render: (_, __, index) => index + 1,
    },

    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 140,
      render: (image) => (
        <button
          type="button"
          onClick={() => handleImageClick(image)}
          className="block"
        >
          <img
            src={image}
            alt="Gallery"
            className="w-20 h-16 object-cover rounded-md border border-gray-200 hover:opacity-80 transition"
          />
        </button>
      ),
    },

    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => <span className="text-gray-700">{type}</span>,
    },

    {
      title: "Hero Image",
      dataIndex: "is_hero",
      key: "is_hero",
      width: 120,
      render: (isHero) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
            Number(isHero) === 1
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {Number(isHero) === 1 ? "Yes" : "No"}
        </span>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${
            status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.status === "active" && (
            <Popconfirm
              title="Mark this image as inactive?"
              description="This gallery image will be marked as inactive."
              okText="Yes"
              cancelText="No"
              onConfirm={() => handleInactive(record)}
            >
              <Button danger size="small" icon={<StopOutlined />}>
                Inactive
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full p-4 sm:p-6">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          Gallery
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage your gallery images.
        </p>
      </div>

      {/* Table Card */}
      <div className="w-full bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-5">
          {/* Category Filter */}
          <Select
            value={selectedCategory}
            onChange={setSelectedCategory}
            size="large"
            className="w-full sm:w-48"
            options={[
              {
                value: "all",
                label: "All Categories",
              },
              ...categories.map((category) => ({
                value: category,
                label: category,
              })),
            ]}
          />

          {/* Status Filter */}
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            size="large"
            className="w-full sm:w-40"
            options={[
              //   {
              //     value: "all",
              //     label: "All Status",
              //   },
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

        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredGalleries}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
          scroll={{ x: 800 }}
        />
      </div>

      {/* Image Modal */}
      <Modal
        open={imageModalOpen}
        onCancel={handleCloseImageModal}
        footer={null}
        centered
        width="60vw"
      >
        <div className="w-full flex justify-center items-center py-4">
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Gallery Preview"
              className="max-w-full max-h-[70vh] object-contain rounded-md"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ListGallery;
