import { useState, useEffect } from "react";
import {
    Camera,
    Save,
    Loader2,
    User,
    Baby,
    Loader,
    ChevronLeft,
    ChevronRight,
    Zap,
    MapPin,
    CheckCircle,
    Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ========= Step config ========= */
const STEPS = [
    {
        key: "childName",
        title: "Child's Name",
        subtitle: "What should we call your little explorer?",
        icon: Baby,
        emoji: "👦",
        required: true,
    },
    {
        key: "childAge",
        title: "Child's Age",
        subtitle: "This helps us match the right level.",
        icon: Sparkles,
        emoji: "🎂",
        required: true,
    },
    {
        key: "profilePhoto",
        title: "Profile Photo",
        subtitle: "Add a photo (optional but fun!).",
        icon: Camera,
        emoji: "📸",
        required: false,
    },
    {
        key: "campusCode",
        title: "Campus Code",
        subtitle: "Enter your campus code if you have one.",
        icon: MapPin,
        emoji: "🏫",
        required: false,
    },
];

const ParentProfile = ({ userData, setUserData }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLoadingMeData, setIsLoadingMeData] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const fetchProfile = async () => {
            const token = localStorage.getItem("sparvi_token");
            try {
                setIsLoadingMeData(true);
                const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal,
                });
                const incoming = res.data.user || {};
                setUserData({
                    ...incoming,
                    campusCode: incoming.campusCode || "",
                    children: incoming.children?.length
                        ? incoming.children
                        : [{ name: "", age: "" }],
                });
            } catch {
                console.error("Failed to load profile");
            } finally {
                setIsLoadingMeData(false);
            }
        };
        fetchProfile();
        return () => controller.abort();
    }, [setUserData]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleChangeChild = (field, value) => {
        const current = userData.children?.[0] || { name: "", age: "" };
        const updated = [{ ...current, [field]: value }];
        setUserData({ ...userData, children: updated });
    };

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const currentChild = userData.children?.[0] || { name: "", age: "" };
    const isChildNameValid = Boolean(currentChild.name && currentChild.name.trim());
    const numericAge = Number(currentChild.age);
    const isChildAgeValid = numericAge >= 3 && numericAge <= 18;
    const currentStep = STEPS[stepIndex];

    const canProceed = () => {
        if (currentStep.key === "childName") return isChildNameValid;
        if (currentStep.key === "childAge") return isChildAgeValid;
        return true;
    };

    const handleNext = () => {
        if (!canProceed()) {
            setMessage({ type: "error", text: "Please complete this field to continue." });
            return;
        }
        setMessage({ type: "", text: "" });
        setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    };

    const handleBack = () => {
        setMessage({ type: "", text: "" });
        setStepIndex((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        const token = localStorage.getItem("sparvi_token");
        const formData = new FormData();
        formData.append("name", userData.name);
        formData.append("phone", userData.phone);
        if (selectedFile) formData.append("profilePhoto", selectedFile);
        formData.append("children", JSON.stringify(userData.children));
        formData.append("campusCode", userData.campusCode || "");

        try {
            const res = await axios.put(`${API_BASE_URL}/api/parent/profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            setUserData(res.data.user);
            setMessage({ type: "success", text: "Profile updated successfully!" });
            navigate("/parent");
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Update failed",
            });
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all placeholder:text-slate-400";

    /* ========= Loading state ========= */
    if (isLoadingMeData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f8fafc] to-white">
                <motion.div
                    className="flex flex-col items-center gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <Loader className="text-[#FBBF24] animate-spin w-8 h-8" />
                    <p className="text-sm text-slate-500">Loading your profile…</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#f8fafc] to-white flex flex-col">
            {/* ===== Top Banner ===== */}
            <div
                className="relative overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #071228 0%, #102a5a 50%, #1a3a6b 100%)",
                }}
            >
                {/* Floating shapes */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                        className="absolute top-[20%] left-[15%] w-3 h-3 rounded-full bg-[#FBBF24]/30"
                        animate={{ y: [0, -10, 0], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 5, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute top-[50%] right-[20%] w-2 h-2 rounded-full bg-[#2dd4bf]/40"
                        animate={{ y: [0, -12, 0], opacity: [0.4, 0.9, 0.4] }}
                        transition={{ duration: 6, delay: 1, repeat: Infinity }}
                    />
                    <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FBBF24]/5 blur-[100px]" />
                </div>

                <div className="relative z-10 max-w-xl mx-auto px-5 pt-10 pb-16 text-center">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-[#FBBF24] flex items-center justify-center">
                            <Zap className="w-4 h-4 text-[#102a5a]" />
                        </div>
                        <span className="text-white font-bold text-lg tracking-tight">
                            Sparvi Lab
                        </span>
                    </Link>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 font-display">
                        Complete Your Profile
                    </h1>
                    <p className="text-slate-300 text-sm">
                        Just a few quick steps to get your child started.
                    </p>
                </div>
            </div>

            {/* ===== Main Content ===== */}
            <div className="flex-1 flex items-start justify-center px-5 -mt-8 pb-10">
                <motion.div
                    className="w-full max-w-xl"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {/* Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(16,42,90,0.08)] border border-white/60 p-8 md:p-10">
                        {/* Progress bar */}
                        <div className="flex items-center gap-2 mb-8">
                            {STEPS.map((s, i) => (
                                <div key={s.key} className="flex-1 flex flex-col items-center gap-1.5">
                                    <div
                                        className={`w-full h-1.5 rounded-full transition-all duration-500 ${i < stepIndex
                                                ? "bg-[#FBBF24]"
                                                : i === stepIndex
                                                    ? "bg-[#FBBF24]/60"
                                                    : "bg-slate-200"
                                            }`}
                                    />
                                    <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                                        {s.title}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Step header */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">{currentStep.emoji}</span>
                            <div>
                                <h2 className="text-lg font-bold text-[#102a5a]">
                                    {currentStep.title}
                                    {currentStep.required && (
                                        <span className="text-red-400 ml-1">*</span>
                                    )}
                                </h2>
                                <p className="text-xs text-slate-500">{currentStep.subtitle}</p>
                            </div>
                        </div>

                        {/* Message */}
                        {message.text && (
                            <motion.div
                                className={`p-3 rounded-2xl text-sm text-center mb-5 ${message.type === "error"
                                        ? "bg-red-50 text-red-600 border border-red-100"
                                        : "bg-green-50 text-green-600 border border-green-100"
                                    }`}
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {message.text}
                            </motion.div>
                        )}

                        {/* Step Content */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep.key}
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.3 }}
                                    className="min-h-[120px]"
                                >
                                    {currentStep.key === "childName" && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Child's Name
                                            </label>
                                            <div className="relative">
                                                <Baby className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    value={currentChild.name || ""}
                                                    onChange={(e) =>
                                                        handleChangeChild("name", e.target.value)
                                                    }
                                                    className={`${inputClass} pl-11`}
                                                    placeholder="Your child's name"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep.key === "childAge" && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Child's Age
                                            </label>
                                            <div className="relative">
                                                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="number"
                                                    min={3}
                                                    max={18}
                                                    value={currentChild.age || ""}
                                                    onChange={(e) =>
                                                        handleChangeChild("age", e.target.value)
                                                    }
                                                    className={`${inputClass} pl-11`}
                                                    placeholder="e.g. 7"
                                                />
                                            </div>
                                            <p className="text-xs text-slate-400 mt-2 ml-1">
                                                Ages 3 – 18 accepted
                                            </p>
                                        </div>
                                    )}

                                    {currentStep.key === "profilePhoto" && (
                                        <div className="flex flex-col items-center gap-5">
                                            <div className="relative group">
                                                <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-100 ring-4 ring-[#FBBF24]/20">
                                                    {previewUrl || userData.photoUrl ? (
                                                        <img
                                                            src={previewUrl || userData.photoUrl}
                                                            alt="Profile"
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <User size={48} />
                                                        </div>
                                                    )}
                                                </div>
                                                <label
                                                    htmlFor="photo-upload"
                                                    className="absolute bottom-0 right-0 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#102a5a] p-2.5 rounded-full cursor-pointer shadow-lg transition-colors"
                                                >
                                                    <Camera size={16} />
                                                    <input
                                                        id="photo-upload"
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                Click the camera icon to upload
                                            </p>
                                        </div>
                                    )}

                                    {currentStep.key === "campusCode" && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Campus Code
                                            </label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    name="campusCode"
                                                    value={userData.campusCode || ""}
                                                    onChange={handleChange}
                                                    className={`${inputClass} pl-11`}
                                                    placeholder="Enter code (optional)"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation buttons */}
                            <div className="flex items-center justify-between gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={stepIndex === 0 || loading}
                                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40 text-sm font-medium"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>

                                {stepIndex < STEPS.length - 1 ? (
                                    <motion.button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={loading}
                                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#102a5a] font-bold transition-all shadow-[0_4px_15px_rgba(251,191,36,0.25)] hover:shadow-[0_6px_20px_rgba(251,191,36,0.35)] disabled:opacity-60 text-sm"
                                        whileTap={{ scale: 0.97 }}
                                        whileHover={{ y: -1 }}
                                    >
                                        Next
                                        <ChevronRight className="w-4 h-4" />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        type="submit"
                                        disabled={loading}
                                        className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#FBBF24] hover:bg-[#F59E0B] text-[#102a5a] font-bold transition-all shadow-[0_8px_25px_rgba(251,191,36,0.3)] hover:shadow-[0_12px_35px_rgba(251,191,36,0.4)] disabled:opacity-60 text-sm"
                                        whileTap={{ scale: 0.97 }}
                                        whileHover={{ y: -2 }}
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin w-4 h-4" />
                                        ) : (
                                            <CheckCircle className="w-4 h-4" />
                                        )}
                                        Save & Continue
                                    </motion.button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Skip link */}
                    <div className="text-center mt-4">
                        <button
                            onClick={() => navigate("/parent")}
                            className="text-xs text-slate-400 hover:text-[#FBBF24] transition-colors"
                        >
                            Skip for now →
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ParentProfile;
