import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Popconfirm, message, Select } from "antd";
import { EditOutlined, StopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { getTestimonials, postTestimonials } from "../../api/testimonial.api";

const ListTestimonials = () => {
  const navigate = useNavigate();

  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(false);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState("active");

  const fetchTestimonials = async () => {
    try {
      setLoading(true);

      const response = await getTestimonials();

      console.log("Testimonials response:", response);

      setTestimonials(response || []);
    } catch (error) {
      console.error("Error fetching testimonials:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch testimonials",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Image preview
  const handleImageClick = (image) => {
    setSelectedImage(image);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
  };

  // Edit
  const handleEdit = (record) => {
    navigate("/dashboard/testimonial/add", {
      state: {
        testimonial: record,
      },
    });
  };

  // Inactive
  const handleInactive = async (record) => {
    try {
      setLoading(true);

      const payload = {
        id: record.id,
        image: record.image,
        name: record.name,
        content: record.content,
        rating: record.rating,
        location: record.location,
        status: "inactive",
      };

      console.log("Inactive testimonial payload:", payload);

      await postTestimonials(payload);

      message.success("Testimonial marked as inactive");

      await fetchTestimonials();
    } catch (error) {
      console.error("Error updating testimonial status:", error);

      message.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update testimonial status",
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter testimonials by status
  const filteredTestimonials = testimonials.filter((item) => {
    return selectedStatus === "all" || item.status === selectedStatus;
  });

  const columns = [
    {
      title: "S.No",
      key: "serialNumber",
      width: 80,
      render: (_, __, index) => index + 1,
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 160,
      render: (name) => (
        <span className="text-gray-700 font-medium">{name}</span>
      ),
    },

    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 120,
      render: (image) => (
        <button
          type="button"
          onClick={() => handleImageClick(image)}
          className="block"
        >
          <img
            src={image}
            alt="Testimonial"
            className="w-16 h-16 object-cover rounded-full border border-gray-200 hover:opacity-80 transition"
          />
        </button>
      ),
    },

    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      width: 300,
      render: (content) => (
        <div className="text-gray-600 max-w-xs" title={content}>
          {content}
        </div>
      ),
    },

    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      width: 100,
      render: (rating) => <span className="text-gray-700">{rating} / 5</span>,
    },

    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      width: 180,
      render: (location) => <span className="text-gray-600">{location}</span>,
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <span
          className={`inline-flex px-2.5 py-1 rounded-md text-sm font-medium ${
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
      width: 190,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {/* Edit */}
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>

          {/* Inactive */}
          {record.status === "active" && (
            <Popconfirm
              title="Mark this testimonial as inactive?"
              description="This testimonial will be marked as inactive."
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
          Testimonials
        </h1>

        <p className="mt-1 text-base text-gray-500">
          View and manage customer testimonials.
        </p>
      </div>

      {/* Table Card */}
      <div className="w-full bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        {/* Status Filter */}
        <div className="flex justify-end mb-5">
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
          dataSource={filteredTestimonials}
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50"],
          }}
          scroll={{ x: 1100 }}
        />
      </div>

      {/* Image Preview Modal */}
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
              alt="Testimonial Preview"
              className="max-w-full max-h-[70vh] object-contain rounded-md"
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ListTestimonials;
