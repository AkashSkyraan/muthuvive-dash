import React, { useEffect, useState } from "react";

import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  message,
} from "antd";

import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import axiosInstance from "../../api/axios";

const CreatePlan = () => {
  const [form] = Form.useForm();

  const navigate = useNavigate();

  const { id } = useParams();

  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);

  const [fetchLoading, setFetchLoading] = useState(false);

  // ==========================================
  // GET PLAN FOR EDIT
  // ==========================================

  const getPlan = async () => {
    try {
      setFetchLoading(true);

      const response = await axiosInstance.get("/plan/plans", {
        params: {
          id,
        },
      });

      console.log("GET PLAN:", response.data);

      if (response?.data?.success === 1 && response?.data?.data?.length) {
        const plan = response.data.data[0];

        let features = plan.features;

        if (typeof features === "string") {
          try {
            features = JSON.parse(features);
          } catch {
            features = [features];
          }
        }

        form.setFieldsValue({
          duration: plan.duration,
          old_amount: Number(plan.old_amount),
          new_amount: Number(plan.new_amount),
          features: features || [""],
          status: plan.status,
        });
      } else {
        message.error(response?.data?.message || "Plan not found");

        navigate("/plans/list");
      }
    } catch (error) {
      console.error("Get Plan Error:", error?.response?.data || error);

      message.error(error?.response?.data?.message || "Failed to fetch plan");

      navigate("/plans/list");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      getPlan();
    }
  }, [id]);

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const payload = {
        ...(isEdit
          ? {
              id: Number(id),
            }
          : {}),

        duration: values.duration.trim(),

        old_amount: values.old_amount,

        new_amount: values.new_amount,

        features: values.features.map((item) => item.trim()).filter(Boolean),

        status: values.status,
      };

      console.log(isEdit ? "UPDATE PLAN:" : "CREATE PLAN:", payload);

      const response = await axiosInstance.post("/plan/add-plan", payload);

      if (response?.data?.success === 1) {
        message.success(
          response?.data?.message ||
            (isEdit
              ? "Plan updated successfully"
              : "Plan created successfully"),
        );

        navigate("/plans/list");
      } else {
        message.error(
          response?.data?.message ||
            (isEdit ? "Failed to update plan" : "Failed to create plan"),
        );
      }
    } catch (error) {
      console.error(
        "Create/Update Plan Error:",
        error?.response?.data || error,
      );

      message.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEdit ? "Edit Plan" : "Create Plan"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? "Update subscription plan"
              : "Create a new subscription plan"}
          </p>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/plans/list")}
        >
          Back to List
        </Button>
      </div>

      <Card loading={fetchLoading} className="w-full">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: "active",
            features: [""],
          }}
          autoComplete="off"
        >
          {/* DURATION */}

          <Form.Item
            label="Duration"
            name="duration"
            rules={[
              {
                required: true,
                message: "Please enter duration",
              },
            ]}
          >
            <Input size="large" placeholder="Example: 1 Month" maxLength={50} />
          </Form.Item>

          {/* AMOUNT */}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Form.Item
              label="Old Amount"
              name="old_amount"
              rules={[
                {
                  required: true,
                  message: "Please enter old amount",
                },
              ]}
            >
              <InputNumber
              maxLength={11}
                size="large"
                className="!w-full"
                min={0}
                prefix="₹"
                placeholder="Enter old amount"
              />
            </Form.Item>

            <Form.Item
              label="New Amount"
              name="new_amount"
              rules={[
                {
                  required: true,
                  message: "Please enter new amount",
                },
              ]}
            >
              <InputNumber
              maxLength={11}
                size="large"
                className="!w-full"
                min={0}
                prefix="₹"
                placeholder="Enter new amount"
              />
            </Form.Item>
          </div>

          {/* FEATURES */}

          <Form.List
            name="features"
            rules={[
              {
                validator: async (_, features) => {
                  if (!features || features.length === 0) {
                    return Promise.reject(
                      new Error("Please add at least one feature"),
                    );
                  }

                  const hasEmpty = features.some(
                    (feature) => !feature || !feature.trim(),
                  );

                  if (hasEmpty) {
                    return Promise.reject(
                      new Error("Please fill all feature fields"),
                    );
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="font-medium text-gray-700">Features</label>

                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => add("")}
                  >
                    Add Feature
                  </Button>
                </div>

                <div className="flex flex-col gap-3">
                  {fields.map((field, index) => (
                    <div key={field.key} className="flex items-start gap-3">
                      <div className="flex-1">
                        <Form.Item
                          {...field}
                          className="mb-0"
                          rules={[
                            {
                              required: true,
                              whitespace: true,
                              message: "Please enter feature",
                            },
                          ]}
                        >
                          <Input
                            size="large"
                            placeholder={`Feature ${index + 1}`}
                          />
                        </Form.Item>
                      </div>

                      {fields.length > 1 && (
                        <Button
                          danger
                          type="text"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <Form.ErrorList errors={errors} />
              </div>
            )}
          </Form.List>

          {/* STATUS */}

          <Form.Item
            label="Status"
            name="status"
            className="mt-6"
            rules={[
              {
                required: true,
                message: "Please select status",
              },
            ]}
          >
            <Select
              size="large"
              options={[
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
          </Form.Item>

          {/* BUTTONS */}

          <Form.Item className="mb-0 mt-8">
            <Space>
              <Button
                size="large"
                onClick={() => navigate("/plans/list")}
              >
                Cancel
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loading}
              >
                {isEdit ? "Update Plan" : "Create Plan"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreatePlan;
