// src/pages/Login.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios, { AxiosError } from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ========= Validation schema ========= */
const schema = yup.object().shape({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const hasCompletedProfile = (user) => {
    const firstChild = user?.children?.[0];
    const hasChildName = Boolean(firstChild?.name && firstChild.name.trim());
    const hasChildAge = Number(firstChild?.age) > 0;
    return hasChildName && hasChildAge;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");

      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: data.email,
        password: data.password,
      });

      const user = res.data.user;
      const role = user.role;

      localStorage.setItem("sparvi_token", res.data.token);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("sparvi_role", role);
      localStorage.setItem("role", role);
      localStorage.setItem("sparvi_user_name", res.data.user.name || "");
      localStorage.setItem("sparvi_user_email", res.data.user.email || "");
      localStorage.setItem("sparvi_user", JSON.stringify(res.data.user || {}));
      localStorage.setItem("user", JSON.stringify(res.data.user || {}));

      if (role === "admin") {
        navigate("/admin");
      } else if (role === "instructor") {
        navigate("/instructor");
      } else {
        if (!hasCompletedProfile(user)) {
          navigate("/parent/profile");
          return;
        }
        navigate("/parent");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err instanceof AxiosError) {
        if (err.code === AxiosError.ERR_BAD_REQUEST) {
          setServerError('email or password is incorrect')
          return
        }
      }
      setServerError(
        err.response.data.message || "Something went wrong, please try again"
      );
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm " +
    "bg-white text-slate-800 outline-none " +
    "focus:ring-2 focus:ring-[#FBBF24] focus:border-[#FBBF24] " +
    "transition-all shadow-sm placeholder:text-slate-400";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f0f4ff] via-[#e8efff] to-white">
      {/* Navbar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <Navbar />
      </div>

      {/* Main content */}
      <main className="flex-1 flex items-start md:items-center justify-center px-4 pt-20 pb-14 md:pt-24 overflow-hidden">
        <motion.div
          className="max-w-5xl w-full grid md:grid-cols-2 gap-10 items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Left side text */}
          <motion.div
            className="hidden md:block"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          >
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#FBBF24] mb-2">
              Parent Portal
            </p>
            <h1 className="text-3xl font-extrabold text-[#102a5a] mb-4 leading-tight font-display">
              Welcome back to <br />
              <span className="text-slate-900">Sparvi Lab</span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 mb-4">
              Sign in to see your child&apos;s upcoming on-site sessions and
              track what they&apos;ve been building in the lab.
            </p>
            <p className="text-sm text-slate-500">
              If you&apos;re new to Sparvi Lab, create an account to reserve a
              spot in our next group.
            </p>
          </motion.div>

          {/* Right side card */}
          <motion.div
            className="bg-white p-8 rounded-3xl shadow-[0_20px_60px_rgba(16,42,90,0.1)] border border-slate-100 max-w-md w-full mx-auto"
            initial={{ x: 40, opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold mb-2 text-[#102a5a] text-center font-display">
              Login
            </h2>
            <p className="text-xs text-slate-500 text-center mb-5">
              Use the email you registered with Sparvi Lab.
            </p>

            {/* Server error */}
            {serverError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-600 text-center">
                  {serverError}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className={inputClass}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className={inputClass}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-full bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 text-sm font-semibold px-4 py-3 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.97 }}
                whileHover={!isSubmitting ? { y: -2 } : {}}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </motion.button>
            </form>

            {/* Extra links */}
            <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
              <button
                type="button"
                className="text-[#102a5a] hover:text-[#1a3a6b] hover:underline text-left font-medium"
              >
                Forgot your password?
              </button>

              <p className="text-left sm:text-right">
                New to Sparvi Lab?{" "}
                <Link
                  to="/signup"
                  className="text-[#D97706] font-semibold hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs text-slate-400 bg-[#040b18] text-slate-500">
        <p className="text-slate-500">© {new Date().getFullYear()} Sparvi Lab. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
