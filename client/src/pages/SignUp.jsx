import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import EgyptPhoneInput from "../components/EgyptPhoneInput";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  Zap,
  CheckCircle2,
  BookOpen,
  Calendar,
  Bell,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const isValidEgyptPhone = (v) => {
  const d = (v || "").replace(/\D/g, "");
  return /^(010|011|012|015)\d{8}$/.test(d);
};

const phoneSchema = yup
  .string()
  .required("Phone number is required")
  .test(
    "egypt-mobile",
    "Enter a valid Egyptian mobile (010 / 011 / 012 / 015)",
    (v) => isValidEgyptPhone(v)
  );

const schema = yup.object().shape({
  parentName: yup.string().required("Full name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  phone: phoneSchema,
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

/* ========= Floating shape ========= */
const FloatingShape = ({ className, delay = 0, duration = 6 }) => (
  <motion.div
    className={className}
    animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
    transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const features = [
  { icon: Calendar, text: "Reserve and manage sessions" },
  { icon: BookOpen, text: "Track learning progress" },
  { icon: Bell, text: "Get updates on camps & events" },
  { icon: CheckCircle2, text: "All children under one account" },
];

const SignUp = () => {
  useEffect(() => {
    document.title = "Enroll Your Child — Sparvi Lab | Reserve a Seat Today";
  }, []);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const formData = new FormData();
      formData.append("name", data.parentName);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("password", data.password);
      await axios.post(`${API_BASE_URL}/api/auth/signup`, formData);
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      toast.error(err.response?.data?.message || "Signup failed");
      setServerError(err.message || "Something went wrong, please try again");
    }
  };

  const inputBase =
    "w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all placeholder:text-slate-400";

  return (
    <div className="min-h-screen flex">
      {/* ===== LEFT — Navy immersive panel ===== */}
      <motion.div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between"
        style={{
          background:
            "linear-gradient(135deg, #071228 0%, #102a5a 50%, #1a3a6b 100%)",
        }}
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Floating decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingShape className="absolute top-[12%] left-[20%] w-3 h-3 rounded-full bg-[#FBBF24]/40" delay={0} />
          <FloatingShape className="absolute top-[40%] right-[18%] w-2 h-2 rounded-full bg-[#2dd4bf]/50" delay={1} />
          <FloatingShape className="absolute bottom-[25%] left-[30%] w-4 h-4 rounded-full bg-[#FBBF24]/20" delay={2} duration={8} />
          <FloatingShape className="absolute top-[65%] right-[25%] w-2.5 h-2.5 rounded-full bg-[#2dd4bf]/30" delay={1.5} />
          <FloatingShape className="absolute bottom-[40%] left-[12%] w-2 h-2 rounded-full bg-[#FBBF24]/30" delay={3} duration={7} />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#FBBF24]/5 blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-[#2dd4bf]/5 blur-[80px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center flex-1 px-12 xl:px-16">
          {/* Brand */}
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
              Join Sparvi Lab
            </p>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6 font-display">
              Start your child's
              <br />
              <span className="text-[#FBBF24]">STEM journey</span>
            </h1>
            <p className="text-slate-300 text-base leading-relaxed max-w-sm mb-10">
              Create your parent account to book real electronics sessions and watch your kid build amazing projects.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div
            className="space-y-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9 + i * 0.1 }}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <f.icon className="w-4 h-4 text-[#FBBF24]" />
                </div>
                <span className="text-sm text-slate-300">{f.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 px-12 xl:px-16 pb-8">
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
          </p>
        </div>
      </motion.div>

      {/* ===== RIGHT — Form ===== */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-[#f8fafc] px-5 py-10 relative overflow-hidden">
        {/* Subtle bg pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#102a5a 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ y: 30, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center">
              <img src="/logo.png" alt="Sparvi Lab" className="h-10" />
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(16,42,90,0.08)] border border-white/60 p-8 md:p-10">
            <div className="text-center mb-7">
              <h2 className="text-2xl font-bold text-[#102a5a] font-display">
                Create account
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Set up your parent profile to get started
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    {...register("parentName")}
                    className={inputBase}
                    placeholder="Your full name"
                    autoComplete="name"
                  />
                </div>
                {errors.parentName && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.parentName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    {...register("email")}
                    className={inputBase}
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

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone / WhatsApp
                </label>
                <Controller
                  name="phone"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <EgyptPhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.phone?.message}
                      name="phone"
                    />
                  )}
                />
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
                    className={inputBase}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1.5 ml-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#102a5a] font-bold py-3.5 shadow-[0_8px_25px_rgba(251,191,36,0.3)] hover:shadow-[0_12px_35px_rgba(251,191,36,0.4)] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                whileTap={{ scale: 0.97 }}
                whileHover={!isSubmitting ? { y: -2 } : {}}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#102a5a]/30 border-t-[#102a5a] rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Already have account */}
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#102a5a] font-semibold hover:text-[#FBBF24] transition-colors"
                >
                  Sign in →
                </Link>
              </p>
            </div>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-slate-400 mt-4">
            By creating an account, you agree to our terms of service.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;
