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

const phoneSchema = yup
  .string()
  .required("Phone number is required")
  .matches(/^\+?[0-9\s()-]+$/, "Enter a valid phone number")
  .test("min-digits", "Phone number is too short", (value) => {
    const digits = (value || "").replace(/\D/g, "");
    return digits.length >= 8;
  });

const schema = yup.object().shape({
  parentName: yup.string().required("Full name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  phone: phoneSchema,
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

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

      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(err.response.data.message)
      setServerError(err.message || "Something went wrong, please try again");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm bg-white text-slate-800 " +
    "outline-none focus:ring-2 focus:ring-[#FBBF24] focus:border-[#FBBF24] " +
    "shadow-sm transition-all placeholder:text-slate-400";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#f0f4ff] via-[#e8efff] to-white">
      {/* Navbar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-100">
        <Navbar />
      </div>

      {/* Main content */}
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
            <p className="text-sm font-semibold tracking-[0.18em] uppercase text-[#FBBF24] mb-2">
              Join Sparvi Lab
            </p>
            <h1 className="text-3xl font-extrabold text-[#102a5a] mb-4 leading-tight font-display">
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
            className="bg-white p-8 rounded-3xl shadow-[0_20px_60px_rgba(16,42,90,0.1)] border border-slate-100 max-w-md w-full mx-auto"
            initial={{ x: 40, opacity: 0, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
          >
            <h2 className="text-2xl font-bold mb-2 text-[#102a5a] text-center font-display">
              Parent Sign Up
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6">
              Create your parent account to get started.
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
              {/* Parent Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                  <p className="text-red-500 text-xs mt-1.5">
                    {errors.parentName.message}
                  </p>
                )}
              </div>

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

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
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
                  <p className="text-red-500 text-xs mt-1.5">
                    {errors.phone.message}
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
                  placeholder="Create a password"
                  autoComplete="new-password"
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
                {isSubmitting ? "Creating account..." : "Create Account"}
              </motion.button>
            </form>

            {/* Already have account */}
            <div className="mt-5 text-xs text-slate-500 text-center">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#102a5a] font-semibold hover:underline"
              >
                Log in instead
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-5 text-center text-xs bg-[#040b18]">
        <p className="text-slate-500">© {new Date().getFullYear()} Sparvi Lab. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default SignUp;
