import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { message } from "antd";

import { images } from "../../config/Images";
import { preventInvalidSpaces } from "../../utils/helper";
import Button from "../../component/Button";
import { LoginAdminRequest } from "../../api/auth.api";
import axiosInstance from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

function EyeIcon({ visible }) {
  return visible ? (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M2.5 12s3.5-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.5 5.5-9.5 5.5S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.7A10.4 10.4 0 0 1 12 6.5c6 0 9.5 5.5 9.5 5.5a17 17 0 0 1-3.1 3.5M6.1 6.9C3.8 8.5 2.5 12 2.5 12s3.5 5.5 9.5 5.5c.8 0 1.5-.1 2.2-.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isMobile = /^\d+$/.test(identifier) && identifier.length > 0;

  const handleIdentifierChange = (e) => {
    setIdentifier(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axiosInstance.post("/admin/login-admin", {
        name: identifier,
        password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      if (response?.data?.success === 1) {
        const userData = response.data.data[0];

        console.log("USER DATA:", userData);
        console.log("ROLE:", userData.role);

        // Update AuthContext
        login(userData);

        navigate("/admin/dashboard", {
          replace: true,
        });

        return;
      }

      message.error(response?.data?.message || "Invalid username or password");
    } catch (error) {
      console.error("Login Error:", error?.response?.data || error);

      message.error(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex h-[10px] w-full items-center justify-center">
        <img src={images.logo} alt="Logo" className="w-[180px]" />
      </div>

      <h4 className="mt-8 text-4xl font-bold tracking-tight text-gray-900">
        Login
      </h4>

      <p className="mt-3 text-sm leading-5 text-gray-500">
        Highlight the best of your properties by using the List
        <br className="hidden sm:block" />
        Category shortcode. You can list categories
      </p>

      <form onSubmit={handleSubmit} className="mt-9 text-left">
        {/* Username */}
        <div>
          <label
            htmlFor="identifier"
            className="mb-2 block text-sm font-medium text-gray-800"
          >
            UserName
          </label>

          <div className="flex h-10 w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={handleIdentifierChange}
              onKeyDown={preventInvalidSpaces}
              placeholder={isMobile ? "Enter user Name" : "Enter User Name"}
              autoComplete="username"
              required
              className="min-w-0 flex-1 bg-transparent px-3 text-sm text-gray-900 !outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Password */}
        <div className="mt-5">
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-gray-800"
          >
            Password
          </label>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your Password"
              autoComplete="current-password"
              required
              onKeyDown={preventInvalidSpaces}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400"
            />

            <Button
              type="text"
              onClick={() => setShowPassword((prev) => !prev)}
              ariaLabel={showPassword ? "Hide password" : "Show password"}
              className="!absolute !right-1 !top-1/2 !m-0 !flex !h-8 !w-8 !-translate-y-1/2 !items-center !justify-center !p-0 !text-gray-400 hover:!text-gray-700"
            >
              <EyeIcon visible={showPassword} />
            </Button>
          </div>

          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Login Button */}
        <Button
          htmlType="submit"
          type="primary"
          loading={loading}
          disabled={loading}
          className="mt-6 !h-12 w-full rounded-lg bg-[#165BEF] text-md font-semibold text-white shadow-sm transition hover:bg-[#0f4ed8] hover:shadow-md active:scale-[0.99]"
        >
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </>
  );
}

export default Login;
