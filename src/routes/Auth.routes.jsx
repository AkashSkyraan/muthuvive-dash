import { Route } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import Login from "../pages/auth/Login";



const AuthRoutes = (
  <Route element={<AuthLayout />}>
    <Route path="/login" element={<Login />} />
    {/* <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/verify-otp" element={<VerifyOTP />} /> */}

    {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
  </Route>
);

export default AuthRoutes;
