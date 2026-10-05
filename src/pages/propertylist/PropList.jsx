import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  Table,
  Modal,
  Form,
  Input as AntInput,
  message,
  Space,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  ShoppingOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axios";

const PROPERTY_LIST_API = "/property/get-property";
const PROPERTY_TYPES_API = "/property/properties";
const PROPERTY_USER_API = "/property/user";
const PROPERTY_STATUS_API = "/admin/status";

/* ----------------------------------------
   STATUS TRANSITIONS
---------------------------------------- */

const STATUS_TRANSITIONS = {
  requested: ["accepted", "rejected"],
  accepted: ["posted"],
  posted: ["sold", "expired"],
  rejected: [],
  expired: [],
  sold: [],
};

/* ----------------------------------------
   STATUS DISPLAY
---------------------------------------- */

const formatStatus = (status) => {
  if (!status) return "-";

  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/* ----------------------------------------
   COMPONENT
---------------------------------------- */

const PropertyList = () => {
  const navigate = useNavigate();

  /* ----------------------------------------
     DATA STATES
  ---------------------------------------- */

  const [properties, setProperties] = useState([]);

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [propertyTypesLoading, setPropertyTypesLoading] = useState(false);

  const [users, setUsers] = useState({});

  /* ----------------------------------------
     LOADING
  ---------------------------------------- */

  const [loading, setLoading] = useState(false);

  /* ----------------------------------------
     FILTERS
  ---------------------------------------- */

  const [searchValue, setSearchValue] = useState("");
  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("requested");

  const [propertyType, setPropertyType] = useState("");

  /* ----------------------------------------
     PAGINATION
  ---------------------------------------- */

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  /* ----------------------------------------
     STATUS MODAL
  ---------------------------------------- */

  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState(null);

  const [selectedStatus, setSelectedStatus] = useState("");

  const [rejectReason, setRejectReason] = useState("");

  const [statusLoading, setStatusLoading] = useState(false);

  const [form] = Form.useForm();

  /* =====================================================
     GET PROPERTY TYPES
  ===================================================== */

  const getPropertyTypes = async () => {
    try {
      setPropertyTypesLoading(true);

      const response = await axiosInstance.get(PROPERTY_TYPES_API);

      if (response?.data?.success === 1) {
        const data =
          response?.data?.data ||
          response?.data?.result ||
          response?.data?.properties ||
          [];

        setPropertyTypes(Array.isArray(data) ? data : []);
      } else {
        setPropertyTypes([]);
      }
    } catch (error) {
      console.error("Property types error:", error);

      message.error(
        error?.response?.data?.message || "Failed to fetch property types",
      );
    } finally {
      setPropertyTypesLoading(false);
    }
  };

  /* =====================================================
     GET USER DETAILS
  ===================================================== */

  const getPropertyUser = async (userId, ownerType) => {
    if (!userId) return null;

    const type = String(ownerType || "user").toLowerCase();

    const key = `${type}-${userId}`;

    /*
      Already fetched
    */
    if (users[key]) {
      return users[key];
    }

    try {
      const response = await axiosInstance.get(PROPERTY_USER_API, {
        params: {
          user_id: userId,
          type,
        },
      });

      if (response?.data?.success === 1) {
        const userData =
          response?.data?.data ||
          response?.data?.result ||
          response?.data?.user ||
          null;

        if (userData) {
          setUsers((prev) => ({
            ...prev,
            [key]: userData,
          }));
        }

        return userData;
      }

      return null;
    } catch (error) {
      console.error("Property user error:", error);
      return null;
    }
  };

  /* =====================================================
     LOAD USERS FOR CURRENT PAGE
  ===================================================== */

  const loadPropertyUsers = async (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      return;
    }

    const uniqueUsers = [];

    rows.forEach((item) => {
      const userId = item?.user_id;

      /*
        Important:
        Your backend should return owner type separately.

        Supported:
        owner_type
        type
        user_type
        created_by_type
      */

      const ownerType =
        item?.owner_type ||
        item?.user_type ||
        item?.created_by_type ||
        item?.type ||
        "user";

      if (userId) {
        uniqueUsers.push({
          userId,
          ownerType,
        });
      }
    });

    const uniqueMap = new Map();

    uniqueUsers.forEach((item) => {
      const key = `${String(item.ownerType).toLowerCase()}-${item.userId}`;

      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    await Promise.all(
      Array.from(uniqueMap.values()).map((item) =>
        getPropertyUser(item.userId, item.ownerType),
      ),
    );
  };

  /* =====================================================
     GET PROPERTIES
  ===================================================== */

  const getProperties = useCallback(
    async (
      page = pagination.current,
      pageSize = pagination.pageSize,
      selectedStatus = status,
      selectedType = propertyType,
      selectedSearch = search,
    ) => {
      try {
        setLoading(true);

        const params = {
          page,
          limit: pageSize,
        };

        /*
          Status
        */
        if (selectedStatus) {
          params.status = selectedStatus;
        }

        /*
          Property type
        */
        if (selectedType) {
          params.type = selectedType;
        }

        /*
          Search
        */
        if (selectedSearch?.trim()) {
          params.search = selectedSearch.trim();
        }

        const response = await axiosInstance.get(PROPERTY_LIST_API, {
          params,
        });

        if (response?.data?.success === 1) {
          const responseData = response?.data?.data;

          let rows = [];
          let total = 0;

          /*
            Supports different backend response structures
          */

          if (Array.isArray(responseData)) {
            rows = responseData;

            total =
              Number(response?.data?.pagination?.total) ||
              Number(response?.data?.total) ||
              rows.length;
          } else {
            rows =
              responseData?.rows ||
              responseData?.properties ||
              responseData?.items ||
              responseData?.data ||
              [];

            total =
              Number(responseData?.total) ||
              Number(responseData?.pagination?.total) ||
              Number(response?.data?.pagination?.total) ||
              Number(response?.data?.total) ||
              rows.length;
          }

          setProperties(Array.isArray(rows) ? rows : []);

          setPagination((prev) => ({
            ...prev,
            current: page,
            pageSize,
            total,
          }));

          /*
            Get owner information
          */

          await loadPropertyUsers(rows);
        } else {
          setProperties([]);

          setPagination((prev) => ({
            ...prev,
            current: page,
            total: 0,
          }));
        }
      } catch (error) {
        console.error("Property list error:", error);

        setProperties([]);

        message.error(
          error?.response?.data?.message || "Failed to fetch properties",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      pagination.current,
      pagination.pageSize,
      status,
      propertyType,
      search,
      users,
    ],
  );

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    getPropertyTypes();
  }, []);

  useEffect(() => {
    getProperties(1, pagination.pageSize, status, propertyType, search);
  }, [status, propertyType]);

  /* =====================================================
     SEARCH
  ===================================================== */

  const handleSearch = () => {
    setSearch(searchValue.trim());

    getProperties(
      1,
      pagination.pageSize,
      status,
      propertyType,
      searchValue.trim(),
    );
  };

  /* =====================================================
     SEARCH ENTER
  ===================================================== */

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  /* =====================================================
     STATUS FILTER
  ===================================================== */

  const handleStatusChange = (value) => {
    setStatus(value || "");

    getProperties(1, pagination.pageSize, value || "", propertyType, search);
  };

  /* =====================================================
     PROPERTY TYPE FILTER
  ===================================================== */

  const handleTypeChange = (value) => {
    setPropertyType(value || "");

    getProperties(1, pagination.pageSize, status, value || "", search);
  };

  /* =====================================================
     RESET
  ===================================================== */

  const handleReset = () => {
    setSearchValue("");
    setSearch("");
    setStatus("requested");
    setPropertyType("");

    getProperties(1, pagination.pageSize, "requested", "", "");
  };

  /* =====================================================
     PAGINATION
  ===================================================== */

  const handleTableChange = (tablePagination) => {
    const { current, pageSize } = tablePagination;

    getProperties(current, pageSize, status, propertyType, search);
  };

  /* =====================================================
     STATUS MODAL OPEN
  ===================================================== */

  const openStatusModal = (record, nextStatus) => {
    setSelectedProperty(record);
    setSelectedStatus(nextStatus);

    setRejectReason("");

    form.resetFields();

    setStatusModalOpen(true);
  };

  /* =====================================================
     CLOSE STATUS MODAL
  ===================================================== */

  const closeStatusModal = () => {
    if (statusLoading) return;

    setStatusModalOpen(false);

    setSelectedProperty(null);
    setSelectedStatus("");
    setRejectReason("");

    form.resetFields();
  };

  /* =====================================================
     STATUS UPDATE
  ===================================================== */

  const handleStatusUpdate = async () => {
    if (!selectedProperty?.prop_id) {
      message.error("Property ID not found");
      return;
    }

    if (!selectedStatus) {
      message.error("Status not selected");
      return;
    }

    /*
      Rejected reason only required for rejected
    */

    if (selectedStatus === "rejected" && !rejectReason.trim()) {
      message.error("Please enter rejected reason");
      return;
    }

    if (selectedStatus === "rejected" && rejectReason.trim().length > 100) {
      message.error("Rejected reason must be maximum 100 characters");
      return;
    }

    try {
      setStatusLoading(true);

      const payload = {
        prop_id: selectedProperty.prop_id,
        status: selectedStatus,
      };

      /*
        IMPORTANT:
        rejected_reason should ONLY be sent
        when status is rejected.
      */

      if (selectedStatus === "rejected") {
        payload.rejected_reason = rejectReason.trim();
      }

      const response = await axiosInstance.put(PROPERTY_STATUS_API, payload);

      if (response?.data?.success === 1) {
        message.success(
          response?.data?.message || "Property status updated successfully",
        );

        closeStatusModal();

        /*
          Refresh current page
        */

        getProperties(
          pagination.current,
          pagination.pageSize,
          status,
          propertyType,
          search,
        );

        return;
      }

      message.error(
        response?.data?.message || "Failed to update property status",
      );
    } catch (error) {
      console.error("Status update error:", error);

      message.error(
        error?.response?.data?.message || "Failed to update property status",
      );
    } finally {
      setStatusLoading(false);
    }
  };

  /* =====================================================
     PROPERTY TYPE NAME
  ===================================================== */

  const getPropertyTypeName = (record) => {
    /*
      Backend should preferably return:
      property_type_id

      Also supporting:
      type_id
      property_type
    */
    // console.log("first")
    const typeId = record?.category ?? record?.type_id ?? record?.property_type;

    if (!typeId) {
      return "-";
    }

    const matchedType = propertyTypes.find(
      (item) => String(item?.id) === String(typeId),
    );

    return matchedType?.name || "-";
  };

  /* =====================================================
     OWNER TYPE
  ===================================================== */

  const getOwnerType = (record) => {
    return (
      record?.owner_type ||
      record?.user_type ||
      record?.created_by_type ||
      record?.type ||
      "user"
    );
  };

  /* =====================================================
     OWNER DATA
  ===================================================== */

  const getOwnerData = (record) => {
    const userId = record?.user_id;

    if (!userId) {
      return null;
    }

    const ownerType = getOwnerType(record);

    const key = `${String(ownerType).toLowerCase()}-${userId}`;

    return users[key] || null;
  };

  /* =====================================================
     TABLE COLUMNS
  ===================================================== */

  const columns = [
    {
      title: "S.No",
      key: "sno",
      width: 80,
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },

    {
      title: "Property ID",
      dataIndex: "prop_id",
      key: "prop_id",
      width: 150,
      render: (value) => (
        <span className="font-medium text-gray-800">{value || "-"}</span>
      ),
    },

    {
      title: "Property Name",
      dataIndex: "prop_name",
      key: "prop_name",
      width: 220,
      render: (value) => (
        <span className="font-medium text-gray-800">{value || "-"}</span>
      ),
    },

    {
      title: "Owner",
      key: "owner",
      width: 220,
      render: (_, record) => {
        const owner = getOwnerData(record);

        if (!owner) {
          return <span className="text-gray-400">Loading...</span>;
        }

        return (
          <div>
            <div className="font-medium text-gray-800">
              {owner?.name
                ? owner.name
                : owner.user_name
                  ? owner.user_name
                  : "-"}
            </div>

            {owner?.email && (
              <div className="text-xs text-gray-500">{owner.email}</div>
            )}

            {owner?.phone && (
              <div className="text-xs text-gray-500">{owner.phone}</div>
            )}
          </div>
        );
      },
    },

    {
      title: "User Type",
      key: "user_type",
      width: 120,
      render: (_, record) => (
        <span className="capitalize text-gray-700">{getOwnerType(record)}</span>
      ),
    },

    {
      title: "Property Type",
      key: "property_type",
      width: 160,
      render: (_, record) => (
        <span className="text-gray-700">{getPropertyTypeName(record)}</span>
      ),
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (value) => (
        <span className="font-medium text-gray-700">{formatStatus(value)}</span>
      ),
    },

    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 250,
      render: (_, record) => {
        const currentStatus = String(record?.status || "").toLowerCase();

        const nextStatuses = STATUS_TRANSITIONS[currentStatus] || [];

        return (
          <Space size="small" wrap>
            {/* VIEW */}

            <Tooltip title="View">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={() => navigate(`/property/${record.prop_id}`)}
              />
            </Tooltip>

            {/* EDIT */}

            <Tooltip title="Edit">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => navigate(`/edit-property/${record.prop_id}`)}
              />
            </Tooltip>

            {/* REQUESTED -> ACCEPTED */}

            {nextStatuses.includes("accepted") && (
              <Tooltip title="Accept">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => openStatusModal(record, "approved")}
                />
              </Tooltip>
            )}

            {/* REQUESTED -> REJECTED */}

            {nextStatuses.includes("rejected") && (
              <Tooltip title="Reject">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  danger
                  onClick={() => openStatusModal(record, "rejected")}
                />
              </Tooltip>
            )}

            {/* ACCEPTED -> POSTED */}

            {nextStatuses.includes("posted") && (
              <Tooltip title="Post">
                <Button
                  type="text"
                  icon={<SendOutlined />}
                  onClick={() => openStatusModal(record, "posted")}
                />
              </Tooltip>
            )}

            {/* POSTED -> SOLD */}

            {nextStatuses.includes("sold") && (
              <Tooltip title="Sold">
                <Button
                  type="text"
                  icon={<ShoppingOutlined />}
                  onClick={() => openStatusModal(record, "sold")}
                />
              </Tooltip>
            )}

            {/* POSTED -> EXPIRED */}

            {/* {nextStatuses.includes("expired") && (
              <Tooltip title="Expired">
                <Button
                  type="text"
                  icon={<StopOutlined />}
                  onClick={() => openStatusModal(record, "expired")}
                />
              </Tooltip>
            )} */}
          </Space>
        );
      },
    },
  ];

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="w-full p-5">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Property List
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and update property details and status
          </p>
        </div>
      </div>

      {/* ==========================================
          FILTER AREA
      ========================================== */}

      <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          {/* SEARCH */}

          <div className="w-full xl:flex-1">
            <Input
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search property name or property ID"
              prefix={<SearchOutlined />}
              allowClear
              size="large"
            />
          </div>

          {/* STATUS */}

          <Select
            value={status || undefined}
            onChange={handleStatusChange}
            placeholder="Status"
            allowClear
            size="large"
            className="w-full xl:w-48"
            options={[
              {
                value: "requested",
                label: "Requested",
              },
              {
                value: "approved",
                label: "Accepted",
              },
              {
                value: "rejected",
                label: "Rejected",
              },
              {
                value: "posted",
                label: "Posted",
              },
              {
                value: "sold",
                label: "Sold",
              },
              {
                value: "expired",
                label: "Expired",
              },
            ]}
          />

          {/* PROPERTY TYPE */}

          <Select
            value={propertyType || undefined}
            onChange={handleTypeChange}
            placeholder="Property Type"
            allowClear
            showSearch
            optionFilterProp="label"
            loading={propertyTypesLoading}
            size="large"
            className="w-full xl:w-52"
            options={propertyTypes.map((item) => ({
              value: String(item.id),
              label: item.name,
            }))}
          />

          {/* SEARCH BUTTON */}

          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            onClick={handleSearch}
            className="w-full xl:w-auto"
          >
            Search
          </Button>

          {/* RESET */}

          <Button
            size="large"
            icon={<ReloadOutlined />}
            onClick={handleReset}
            className="w-full xl:w-auto"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* ==========================================
          TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <Table
          rowKey={(record) => record?.prop_id || record?.id}
          columns={columns}
          dataSource={properties}
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "50", "100"],
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} properties`,
          }}
          onChange={handleTableChange}
          locale={{
            emptyText: "No properties found",
          }}
        />
      </div>

      {/* ==========================================
          STATUS MODAL
      ========================================== */}

      <Modal
        open={statusModalOpen}
        title={
          selectedStatus === "rejected"
            ? "Reject Property"
            : `Change Property Status to ${formatStatus(selectedStatus)}`
        }
        onCancel={closeStatusModal}
        onOk={handleStatusUpdate}
        confirmLoading={statusLoading}
        okText={selectedStatus === "rejected" ? "Reject" : "Confirm"}
        centered
      >
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <div className="text-xs text-gray-500">Property ID</div>

          <div className="mt-1 font-semibold text-gray-800">
            {selectedProperty?.prop_id || "-"}
          </div>

          <div className="mt-3 text-xs text-gray-500">Property Name</div>

          <div className="mt-1 font-medium text-gray-800">
            {selectedProperty?.prop_name || "-"}
          </div>

          <div className="mt-3 text-xs text-gray-500">New Status</div>

          <div className="mt-1 font-medium text-gray-800">
            {formatStatus(selectedStatus)}
          </div>
        </div>

        {/* REJECT REASON ONLY */}

        {selectedStatus === "rejected" && (
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Rejected Reason
              <span className="ml-1 text-red-500">*</span>
            </label>

            <AntInput.TextArea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejected reason"
              maxLength={100}
              showCount
              rows={4}
            />
          </div>
        )}

        {/* NORMAL STATUS */}

        {selectedStatus !== "rejected" && (
          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            Are you sure you want to change this property status to{" "}
            <strong>{formatStatus(selectedStatus)}</strong>?
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PropertyList;
