import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Image,
  Input,
  Modal,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getConsultantById } from "../../api/about.api";

const ASSET_URL = import.meta.env.VITE_ASSET_URL || "";

const ConstructionConsultantList = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /**
   * Get list
   */
  const fetchData = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    searchValue = search,
  ) => {
    try {
      setLoading(true);

      const response = await getConsultantById({
        page,
        limit: pageSize,
        search: searchValue,
      });

      if (response?.success === 1) {
        setData(response?.data || []);

        setPagination({
          current: page,
          pageSize,
          total: response?.pagination?.total || response?.meta?.total || 0,
        });

        return;
      }

      message.error(response?.message || "Failed to fetch consultants");
    } catch (error) {
      console.error(error);

      message.error(
        error?.response?.data?.message || "Failed to fetch consultants",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, pagination.pageSize, "");
  }, []);

  /**
   * Search
   */
  const handleSearch = () => {
    fetchData(1, pagination.pageSize, search);
  };

  /**
   * Delete
   */
  const handleDelete = (record) => {
    // Modal.confirm({
    //   title: "Delete Consultant?",
    //   content: `Are you sure you want to delete ${record.name}?`,
    //   okText: "Delete",
    //   cancelText: "Cancel",
    //   okButtonProps: {
    //     danger: true,
    //   },
    //   onOk: async () => {
    //     try {
    //       setLoading(true);
    //       const response =
    //         await deleteConstructionConsultant(
    //           record.id,
    //         );
    //       if (response?.success === 1) {
    //         message.success(
    //           response?.message ||
    //             "Consultant deleted successfully",
    //         );
    //         fetchData(
    //           pagination.current,
    //           pagination.pageSize,
    //           search,
    //         );
    //         return;
    //       }
    //       message.error(
    //         response?.message ||
    //           "Failed to delete consultant",
    //       );
    //     } catch (error) {
    //       console.error(error);
    //       message.error(
    //         error?.response?.data?.message ||
    //           "Failed to delete consultant",
    //       );
    //     } finally {
    //       setLoading(false);
    //     }
    //   },
    // });
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },

    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 100,

      render: (image) => {
        if (!image) {
          return (
            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-lg
                bg-gray-100
                text-xs
                text-gray-400
              "
            >
              No Image
            </div>
          );
        }

        return (
          <Image
            src={`${ASSET_URL}${image}`}
            alt="Consultant"
            width={50}
            height={50}
            className="rounded-lg object-cover"
          />
        );
      },
    },

    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 250,

      render: (name) => (
        <span className="font-medium text-gray-800">{name}</span>
      ),
    },

    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 150,

      render: (role) => <Tag color="blue">{role}</Tag>,
    },

    {
      title: "Action",
      key: "action",
      width: 60,

      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            
            onClick={() =>
              navigate(
                `/const-consultants/edit/${record.id}`,
              )
            }
          >
            
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Construction Consultants
          </h1>

          <p className="text-sm text-gray-500">
            Manage construction consultants
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            navigate("/const-consultants/create")
          }
        >
          Add Consultant
        </Button>
      </div>

      <Card>
        {/* Search */}
        <div className="mb-4 flex justify-end">
          <Input
            allowClear
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Search name or role"
            prefix={<SearchOutlined />}
            className="w-full sm:w-80"
          />
        </div>

        {/* Table */}
        <Table
          rowKey="id"
          columns={columns}
          dataSource={data}
          loading={loading}
          scroll={{ x: 800 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,

            showSizeChanger: true,

            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,

            onChange: (page, pageSize) => {
              fetchData(page, pageSize, search);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default ConstructionConsultantList;
