import axiosInstance from "./axios";

export const LoginAdminRequest = async ({ name, password }) => {
  try {
    if (!name) {
      return {
        success: false,
        message: "Username is required",
      };
    }

    if (!password) {
      return {
        success: false,
        message: "Password is required",
      };
    }

    const response = await axiosInstance.post("/admin/login-admin", {
      name,
      password,
    });

    return response.data;
  } catch (error) {
    console.error("Admin Login Error:", error);

    return {
      success: false,
      message: error?.response?.data?.message || "Something went wrong",
    };
  }
};
