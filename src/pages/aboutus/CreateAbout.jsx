import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, message } from "antd";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";

import axiosInstance from "../../api/axios";

const CreateAboutUs = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    navigate("/aboutus/list");
  };

  const getAboutUs = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get("/about/about-data", {
        params: {
          id: Number(id),
        },
      });

      if (response?.data?.success !== 1 || !response?.data?.data?.length) {
        message.error(response?.data?.message || "About Us not found");
        goBack();
        return;
      }

      const data = response.data.data[0];

      form.setFieldsValue({
        yoe: data.yoe ?? 0,
        projects: data.projects ?? 0,
        clients: data.clients ?? 0,
        users: data.users ?? 0,
        address: data.address || "",
        mobile: data.mobile || "",
        email: data.email || "",
        c_yoe: data.c_yoe ?? 0,
        c_projects: data.c_projects ?? 0,
        c_clients: data.c_clients ?? 0,
        c_built: data.c_built ?? 0,
      });
    } catch (error) {
      console.error("Get About Us error:", error);

      message.error(
        error?.response?.data?.message || "Failed to fetch About Us",
      );

      goBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isEdit) {
      getAboutUs();
    }
  }, [id]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      const payload = {
        ...(isEdit && {
          id: Number(id),
        }),

        yoe: Number(values.yoe || 0),
        projects: Number(values.projects || 0),
        clients: Number(values.clients || 0),
        users: Number(values.users || 0),

        address: values.address?.trim() || "",
        mobile: values.mobile?.trim() || "",
        email: values.email?.trim().toLowerCase() || "",

        c_yoe: Number(values.c_yoe || 0),
        c_projects: Number(values.c_projects || 0),
        c_clients: Number(values.c_clients || 0),
        c_built: Number(values.c_built || 0),
      };

      const response = await axiosInstance.post(
        "/about/add-aboutus-data",
        payload,
      );

      if (response?.data?.success === 1) {
        message.success(
          response?.data?.message ||
            (isEdit
              ? "About Us updated successfully"
              : "About Us created successfully"),
        );

        goBack();
        return;
      }

      message.error(response?.data?.message || "Failed to save About Us");
    } catch (error) {
      console.error("Save About Us error:", error);

      message.error(
        error?.response?.data?.message || "Failed to save About Us",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            {isEdit ? "Edit About Us" : "Create About Us"}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {isEdit
              ? "Update About Us information"
              : "Add About Us information"}
          </p>
        </div>

        <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
          Back
        </Button>
      </div>

      <Card loading={isEdit && loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          initialValues={{
            yoe: 0,
            projects: 0,
            clients: 0,
            users: 0,
            c_yoe: 0,
            c_projects: 0,
            c_clients: 0,
            c_built: 0,
          }}
        >
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            About Us Details
          </h2>

          <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
            <Form.Item
              label="Years of Experience"
              name="yoe"
              rules={[
                {
                  required: true,
                  message: "Please enter years of experience",
                },
              ]}
            >
              <Input
                type="text"
                inputMode="numeric"
                min={0}
                size="large"
                placeholder="Years of experience"
                maxLength={11}
              />
            </Form.Item>

            <Form.Item
              label="Projects"
              name="projects"
              rules={[
                {
                  required: true,
                  message: "Please enter projects",
                },
              ]}
            >
              <Input
                type="text"
                inputMode="numeric"
                min={0}
                size="large"
                placeholder="Projects"
                maxLength={11}
              />
            </Form.Item>

            <Form.Item
              label="Clients"
              name="clients"
              rules={[
                {
                  required: true,
                  message: "Please enter clients",
                },
              ]}
            >
              <Input
                type="text"
                inputMode="numeric"
                min={0}
                size="large"
                placeholder="Clients"
                maxLength={11}
              />
            </Form.Item>

            <Form.Item
              label="Users"
              name="users"
              rules={[
                {
                  required: true,
                  message: "Please enter users",
                },
              ]}
            >
              <Input
                type="text"
                inputMode="numeric"
                min={0}
                size="large"
                placeholder="Users"
                maxLength={11}
              />
            </Form.Item>
          </div>

          <h2 className="mb-4 mt-3 text-lg font-semibold text-gray-800">
            Contact Details
          </h2>

          <Form.Item
            label="Address"
            name="address"
            rules={[
              {
                required: true,
                message: "Please enter address",
              },
            ]}
          >
            <Input.TextArea
              rows={3}
              maxLength={255}
              showCount
              placeholder="Enter address"
            />
          </Form.Item>

          <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
            <Form.Item
              label="Mobile"
              name="mobile"
              rules={[
                {
                  required: true,
                  message: "Please enter mobile number",
                },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Enter valid 10 digit mobile number",
                },
              ]}
            >
              <Input size="large" maxLength={10} placeholder="Mobile number" />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please enter email",
                },
                {
                  type: "email",
                  message: "Enter valid email",
                },
              ]}
            >
              <Input size="large" placeholder="Email address" maxLength={255} />
            </Form.Item>
          </div>  

          <h2 className="mb-4 mt-3 text-lg font-semibold text-gray-800">
            Construction Details
          </h2>

          <div className="grid grid-cols-1 gap-x-5 md:grid-cols-2">
            <Form.Item
              label="Construction YOE"
              name="c_yoe"
              rules={[
                {
                  required: true,
                  message: "Please enter construction YOE",
                },
              ]}
            >
              <Input
                type="number"
                min={0}
                size="large"
                placeholder="Construction YOE"
              />
            </Form.Item>

            <Form.Item
              label="Construction Projects"
              name="c_projects"
              rules={[
                {
                  required: true,
                  message: "Please enter construction projects",
                },
              ]}
            >
              <Input
                type="number"
                min={0}
                size="large"
                placeholder="Construction projects"
              />
            </Form.Item>

            <Form.Item
              label="Construction Clients"
              name="c_clients"
              rules={[
                {
                  required: true,
                  message: "Please enter construction clients",
                },
              ]}
            >
              <Input
                type="number"
                min={0}
                size="large"
                placeholder="Construction clients"
              />
            </Form.Item>

            <Form.Item
              label="Construction Built"
              name="c_built"
              rules={[
                {
                  required: true,
                  message: "Please enter construction built",
                },
              ]}
            >
              <Input
                type="number"
                min={0}
                size="large"
                placeholder="Construction built"
              />
            </Form.Item>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button size="large" onClick={goBack} disabled={loading}>
              Cancel
            </Button>

            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
            >
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreateAboutUs;
