import { useState, useEffect } from "react";
import { Camera, Save, Loader2, User, Baby, Loader } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ParentProfile = ({ userData, setUserData }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isLoadingMeData, setIsLoadingMeData] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [stepIndex, setStepIndex] = useState(0);
    const steps = [
        { key: "childName", title: "Child Name", required: true },
        { key: "childAge", title: "Child Age", required: true },
        { key: "profilePhoto", title: "Profile Photo", required: false },
        { key: "campusCode", title: "Campus Code", required: false },
    ];
    const MotionDiv = motion.div;
    useEffect(() => {
        const controller = new AbortController();
        // Load initial data
        const fetchProfile = async () => {
            const token = localStorage.getItem("sparvi_token");
            try {
                setIsLoadingMeData(true)
                const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                    signal: controller.signal
                });
                const incoming = res.data.user || {};
                setUserData({
                    ...incoming,
                    campusCode: incoming.campusCode || "",
                    children: incoming.children?.length
                        ? incoming.children
                        : [{ name: "", age: "" }]
                });
            } catch {
                console.error("Failed to load profile");
            } finally {
                setIsLoadingMeData(false)
            }
        };
        fetchProfile();
        return () => { controller.abort() }
    }, [setUserData]);

    // Handle File Selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file)); // Show preview instantly
        }
    };

    const handleChangeChild = (field, value) => {
        const current = userData.children?.[0] || { name: "", age: "" };
        const updated = [{ ...current, [field]: value }];
        setUserData({ ...userData, children: updated });
    };

    // Handle Text Change
    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };
    const currentChild = userData.children?.[0] || { name: "", age: "" };
    const isChildNameValid = Boolean(currentChild.name && currentChild.name.trim());
    const numericAge = Number(currentChild.age);
    const isChildAgeValid = numericAge >= 3 && numericAge <= 18;
    const currentStep = steps[stepIndex];
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
        setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    };
    const handleBack = () => {
        setMessage({ type: "", text: "" });
        setStepIndex((prev) => Math.max(prev - 1, 0));
    };

    // Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        const token = localStorage.getItem("sparvi_token");
        const formData = new FormData();
        formData.append("name", userData.name);
        formData.append("phone", userData.phone);
        if (selectedFile) {
            formData.append("profilePhoto", selectedFile); // Must match backend multer config
        }
        formData.append('children', JSON.stringify(userData.children))
        formData.append('campusCode', userData.campusCode || "")

        try {
            const res = await axios.put(`${API_BASE_URL}/api/parent/profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                },
            });

            setUserData(res.data.user);
            setMessage({ type: "success", text: "Profile updated successfully!" });
            navigate("/parent");
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Update failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-10 flex justify-center">
            {isLoadingMeData ? (
                <Loader className="text-black animate-spin w-6 h-6" />
            ) : (
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-[#dbeafe] p-6 md:p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-slate-800">Complete Your Profile</h1>
                        <p className="text-sm text-slate-500 mt-1">Finish the required details to access your dashboard.</p>
                    </div>
                    {message.text && (
                        <div className={`p-3 rounded-lg text-sm text-center mb-4 ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {message.text}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Step {stepIndex + 1} of {steps.length}</span>
                            <span>{currentStep.title}{currentStep.required ? " (required)" : " (optional)"}</span>
                        </div>
                        <AnimatePresence mode="wait">
                            <MotionDiv
                                key={currentStep.key}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.35 }}
                                className="space-y-4"
                            >
                                {currentStep.key === "childName" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Child Name</label>
                                        <div className="relative">
                                            <Baby className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={currentChild.name || ""}
                                                onChange={(e) => handleChangeChild("name", e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="Your child name"
                                            />
                                        </div>
                                    </div>
                                )}
                                {currentStep.key === "childAge" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Child Age</label>
                                        <div className="relative">
                                            <Baby className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                                            <input
                                                type="number"
                                                min={3}
                                                max={18}
                                                value={currentChild.age || ""}
                                                onChange={(e) => handleChangeChild("age", e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                placeholder="e.g. 7"
                                            />
                                        </div>
                                    </div>
                                )}
                                {currentStep.key === "profilePhoto" && (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group">
                                            <div className="w-28 h-28 rounded-full border-4 border-[#e0f2fe] overflow-hidden bg-slate-100">
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
                                            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-colors">
                                                <Camera size={18} />
                                                <input
                                                    id="photo-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs text-slate-500">Optional</p>
                                    </div>
                                )}
                                {currentStep.key === "campusCode" && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Campus Code</label>
                                        <input
                                            type="text"
                                            name="campusCode"
                                            value={userData.campusCode || ""}
                                            onChange={handleChange}
                                            className="w-full pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Optional"
                                        />
                                    </div>
                                )}
                            </MotionDiv>
                        </AnimatePresence>
                        <div className="flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={stepIndex === 0 || loading}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
                            >
                                Back
                            </button>
                            {stepIndex < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={loading}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-60"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition disabled:opacity-60"
                                >
                                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    Save and Continue
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ParentProfile;
