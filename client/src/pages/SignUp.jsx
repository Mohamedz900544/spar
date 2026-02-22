import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Phone validation:
// - allow + at start
// - allow digits, spaces, hyphens, parentheses
// - require at least 8 digits total (after removing non-digits)
const phoneSchema = yup
  .string()
  .required("Phone number is required")
  .matches(/^\+?[0-9\s()-]+$/, "Enter a valid phone number")
  .test("min-digits", "Phone number is too short", (value) => {
    const digits = (value || "").replace(/\D/g, "");
    return digits.length >= 8;
  });

// ✅ validation schema (خلي الباسورد 8 أحرف عشان يطابق الباك إند)
const schema = yup.object().shape({
  parentName: yup.string().required("Full name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  phone: phoneSchema,
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

// ✅ Normalize phone before sending (keep leading + if exists, remove spaces/hyphens/etc)
// eslint-disable-next-line no-unused-vars
const normalizePhone = (raw) => {
  const v = String(raw || "").trim();
  const hasPlus = v.startsWith("+");
  const digitsOnly = v.replace(/\D/g, "");
  return hasPlus ? `+${digitsOnly}` : digitsOnly;
};

const SignUp = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const formData = new FormData()
      formData.append('name', data.parentName)
      formData.append('email', data.email)
      formData.append('phone', data.phone)
      formData.append('password', data.password)
      await axios.post(`${API_BASE_URL}/api/auth/signup`, formData)

      // ✅ حفظ التوكن واليوزر (تقدر تغيرها بعدين لـ httpOnly cookie في بروडकشن)
      // localStorage.setItem("token", res.data.token);
      // localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(err.response.data.message)
      setServerError(err.message || "Something went wrong, please try again");
    }
  };

  // Reusable input classes with tinted background
  const inputClass =
    "w-full rounded-xl border border-[#c7d2fe] px-3 py-2.5 text-sm bg-[#f9fbff] text-slate-800 " +
    "outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9] " +
    "shadow-sm transition-shadow placeholder:text-slate-400";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f5f7ff] via-[#e8f3ff] to-[#ffffff]">
      {/* Solid white navbar wrapper */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <Navbar />
      </div>

      {/* Main content with more padding under header */}
      <main className="flex-1 flex items-start md:items-center justify-center px-4 pt-24 pb-16 md:pt-28 overflow-hidden">
        <motion.div
          className="max-w-5xl w-full grid md:grid-cols-2 gap-10 items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Left info block */}
          <motion.div
            className="hidden md:block"
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#fbbf24] mb-2">
              Join Sparvi Lab
            </p>
            <h1 className="text-3xl font-extrabold text-[#0b63c7] mb-4 leading-tight">
              Create your
              <br />
              <span className="text-slate-900">parent account</span>
            </h1>
            <p className="text-sm md:text-base text-slate-600 mb-4">
              Sign up to book on-site electronics sessions, manage your
              child&apos;s spot and receive quick summaries of what they&apos;re
              building in the lab.
            </p>
            <ul className="text-sm text-slate-600 space-y-2 mb-4">
              <li>• Reserve and manage sessions for your child.</li>
              <li>• Keep all children under one parent account.</li>
              <li>• Get updates about new camps and special events.</li>
            </ul>
            <p className="text-xs text-slate-500">
              You can complete your child&apos;s profile after signing in.
            </p>
          </motion.div>

          {/* Right form card */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-[0_16px_45px_rgba(15,118,210,0.14)] border border-[#dbeafe] max-w-md w-full mx-auto"
            initial={{ x: 40, opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold mb-2 text-[#0b63c7] text-center">
              Parent Sign Up
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6">
              Create your parent account to get started.
            </p>

            {/* Server error */}
            {serverError && (
              <p className="mb-3 text-xs text-red-500 text-center">
                {serverError}
              </p>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Parent Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("parentName")}
                  className={inputClass}
                  placeholder="Parent full name"
                  autoComplete="name"
                />
                {errors.parentName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.parentName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                  <p className="text-red-500 text-xs mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* ✅ NEW: Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  {...register("phone")}
                  className={inputClass}
                  placeholder="e.g. +20 10 1234 5678"
                  autoComplete="tel"
                  inputMode="tel"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  {...register("password")}
                  className={inputClass}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 rounded-full bg-gradient-to-r from-[#fbbf24] via-[#f59e0b] to-[#fb923c] text-slate-900 text-sm font-semibold px-4 py-2.5 shadow-md hover:shadow-lg transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.97 }}
                whileHover={!isSubmitting ? { y: -2 } : {}}
              >
                {isSubmitting ? "Creating account..." : "Create Account"}
              </motion.button>
            </form>

            {/* Already have account */}
            <div className="mt-4 text-xs text-slate-500 text-center">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#0b63c7] font-semibold hover:underline"
              >
                Log in instead
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Solid white footer */}
      <footer className="py-6 text-center text-xs md:text-sm text-slate-500 bg-white border-t border-[#e2e8f0]">
        © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
      </footer>
    </div>
  );
};

export default SignUp;
