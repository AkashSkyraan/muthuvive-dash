import React, { useState } from "react";
import {
  LockOutlined,
  UserOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

// Change these two for each new client — everything else stays the same
const BRAND_NAME = "Muthuvive's Properties";
const WELCOME_TEXT = "Hello 👋 Welcome!";

const LoginPage = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("Login submitted:", form);

    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg h-full">
        {/* Purple banner with curved bottom edge */}
        {/* <div className="relative rounded-t-3xl overflow-hidden bg-gradient-to-br from-[#1158eb] via-indigo-400 to-sky-200 pt-10 pb-16 text-center">
          <h1 className="text-white text-2xl font-bold tracking-widest">
            {BRAND_NAME}
          </h1>
          <span className="inline-block mt-4 px-4 py-1.5 rounded-full bg-white/15 text-white text-sm backdrop-blur-sm">
            {WELCOME_TEXT}
          </span>

          <svg
            className="absolute -bottom-px left-0 w-full"
            viewBox="0 0 500 40"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0 C125,40 375,40 500,0 L500,40 L0,40 Z"
              fill="#f9fafb"
            />
          </svg>
        </div> */}

        {/* Login Card — overlaps the banner */}
        <div className="relative -mt-10 mx-4 sm:mx-8 bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Login</h2>
            <p className="text-sm text-gray-400 mt-1">
              Please login to admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Email / Username<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">
                  <UserOutlined />
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={form.username}
                  onChange={handleChange}
                  placeholder="admin@company.com"
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition !text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                Password<span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">
                  <LockOutlined />
                </span>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            {/* <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Forgot password?
              </a>
            </div> */}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-500 text-white text-sm font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
