// src/pages/Login.jsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { Mail, Lock, ArrowRight, Sparkles, Zap, Shield } from "lucide-react";

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

/* ========= Floating shape component ========= */
const FloatingShape = ({ className, delay = 0, duration = 6 }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

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
    defaultValues: { email: "", password: "" },
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

      if (role === "admin") navigate("/admin");
      else if (role === "instructor") navigate("/instructor");
      else {
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
          setServerError("Email or password is incorrect");
          return;
        }
      }
      setServerError(
        err.response?.data?.message || "Something went wrong, please try again"
      );
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT — Navy immersive panel ===== */}
      <motion.div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between"
        style={{
          background: "linear-gradient(135deg, #071228 0%, #102a5a 50%, #1a3a6b 100%)",
        }}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingShape
            className="absolute top-[15%] left-[15%] w-3 h-3 rounded-full bg-[#FBBF24]/40"
            delay={0}
          />
          <FloatingShape
            className="absolute top-[35%] right-[20%] w-2 h-2 rounded-full bg-[#2dd4bf]/50"
            delay={1.5}
          />
          <FloatingShape
            className="absolute bottom-[30%] left-[25%] w-4 h-4 rounded-full bg-[#FBBF24]/20"
            delay={0.8}
            duration={8}
          />
          <FloatingShape
            className="absolute top-[60%] right-[15%] w-2.5 h-2.5 rounded-full bg-[#2dd4bf]/30"
            delay={2}
          />
          <FloatingShape
            className="absolute bottom-[15%] right-[35%] w-2 h-2 rounded-full bg-[#FBBF24]/30"
            delay={3}
            duration={7}
          />
          {/* Large blurred glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#FBBF24]/5 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-60 h-60 rounded-full bg-[#2dd4bf]/5 blur-[80px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-12 xl:px-16">
          {/* Logo / brand */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Link to="/" className="inline-flex items-center gap-2 mb-12">

              <img src="/logo-white.png" alt="Sparvi Lab" className="h-12" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <p className="text-[#FBBF24] text-sm font-semibold tracking-[0.2em] uppercase mb-4">
              Parent Portal
            </p>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6 font-display">
              Welcome back
              <br />
              <span className="text-[#FBBF24]">explorer!</span>
            </h1>
            <p className="text-slate-300 text-base leading-relaxed max-w-sm">
              Sign in to see your child's upcoming on-site sessions and
              track what they've been building in the lab.
            </p>
          </motion.div>

          {/* Feature badges */}
          <motion.div
            className="mt-10 space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {[
              { icon: Sparkles, text: "Track your child's progress" },
              { icon: Shield, text: "Secure parent-only access" },
              { icon: Zap, text: "Book sessions in seconds" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-[#FBBF24]" />
                </div>
                <span className="text-sm text-slate-300">{item.text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom branding */}
        <div className="relative z-10 px-12 xl:px-16 pb-8">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
          </p>
        </div>
      </motion.div>

      {/* ===== RIGHT — Login Form ===== */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-[#f8fafc] px-5 py-10 relative overflow-hidden">
        {/* Subtle bg pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(#102a5a 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ y: 30, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          {/* Mobile-only brand */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center">
              <img src="/logo.png" alt="Sparvi Lab" className="h-10" />
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(16,42,90,0.08)] border border-white/60 p-8 md:p-10">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#102a5a] font-display">
                Sign in
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Enter your credentials to continue
              </p>
            </div>

            {/* Server error */}
            {serverError && (
              <motion.div
                className="mb-5 bg-red-50 border border-red-100 rounded-2xl p-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-xs text-red-600 text-center font-medium">
                  {serverError}
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all placeholder:text-slate-400"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    {...register("password")}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all placeholder:text-slate-400"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xs text-[#102a5a] hover:text-[#FBBF24] font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#102a5a] font-bold py-3.5 shadow-[0_8px_25px_rgba(251,191,36,0.3)] hover:shadow-[0_12px_35px_rgba(251,191,36,0.4)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.97 }}
                whileHover={!isSubmitting ? { y: -2 } : {}}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#102a5a]/30 border-t-[#102a5a] rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                New to Sparvi Lab?{" "}
                <Link
                  to="/signup"
                  className="text-[#102a5a] font-semibold hover:text-[#FBBF24] transition-colors"
                >
                  Create an account →
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
