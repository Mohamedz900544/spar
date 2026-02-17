import { useState, useEffect } from "react";
import { Camera, Save, Loader2, User, Lock, Phone, Baby, Plus, Minus, Loader } from "lucide-react";
import axios from "axios"; // Ensure axios is installed

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ParentProfile = ({ userData, setUserData }) => {
    const [loading, setLoading] = useState(false);

    const [isLoadingMeData, setIsLoadingMeData] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [message, setMessage] = useState({ type: "", text: "" });
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
                setUserData(res.data.user);
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

    // Handle Change Children
    const handleRemoveChildren = (index) => {
        const updatedChildren = userData.children.filter((child, ind) => ind !== index)
        setUserData({ ...userData, children: updatedChildren })
    }
    // Handle Change Children
    const handleAddNewChildren = () => {
        userData.children.push({ name: "", age: "" })
        setUserData({ ...userData })
    }

    // Handle adding data to child in children array
    const handleChangeChildrenData = (e, index) => {
        let allChildren = [...userData.children]
        allChildren[index] = { ...allChildren[index], [e.target.name]: e.target.value };
        // if index of child input equal index inside the loop array return the changed name or age else return child
        // debugger
        setUserData({ ...userData, children: allChildren })
    }

    // Handle Text Change
    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
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

        try {
            const res = await axios.put(`${API_BASE_URL}/api/parent/profile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                },
            });

            setUserData(res.data.user); // Update state with new data from server
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.message || "Update failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f0f7ff] p-4 md:p-10 flex justify-center">
            {isLoadingMeData ? <Loader className="text-black animate-spin w-6 h-6" /> :

                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-[#dbeafe] p-6 md:p-8">

                    <h1 className="text-2xl font-bold text-slate-800 mb-6">Account Settings</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* --- Photo Upload Section --- */}
                        <div className="flex flex-col items-center gap-4 mb-8">
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

                                {/* Camera Icon Overlay */}
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
                            <p className="text-xs text-slate-500">Allowed *.jpeg, *.jpg, *.png, *.gif</p>
                        </div>

                        {/* --- Form Fields --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={userData.name}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={userData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                {userData.children.map((child, index) => <div className="w-full " key={index}>
                                    <div className="grid sm:grid-cols-3 gap-2">

                                        <div>
                                            <label className="text-sm font-medium text-slate-700">Child {index + 1} </label>
                                            <div className="relative" >
                                                <Baby className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={child?.name}
                                                    onChange={(e) => handleChangeChildrenData(e, index)}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                />

                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-slate-700">Age </label>

                                            <div className="relative">
                                                <Baby className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                                                <input
                                                    type="number"
                                                    name="age"
                                                    value={child?.age}
                                                    onChange={(e) => handleChangeChildrenData(e, index)}
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex pt-4">
                                            <button
                                                onClick={() => handleRemoveChildren(index)}
                                                type="button"
                                                disabled={loading}
                                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                <Minus />
                                            </button>
                                        </div>
                                    </div>
                                </div>)}
                            </div>
                            <div className="flex w-full pt-4 col-span-2">
                                <button
                                    onClick={handleAddNewChildren}
                                    type="button"
                                    disabled={loading}
                                    className="flex justify-center items-center w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <Plus />
                                </button>
                            </div>

                        </div>

                        <div className="space-y-2 opacity-60 pointer-events-none">
                            <label className="text-sm font-medium text-slate-700">Email Address (Cannot change)</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                                <input
                                    type="email"
                                    value={userData.email}
                                    readOnly
                                    className="w-full pl-10 pr-4 py-2.5 text-black rounded-xl border border-slate-200 bg-slate-50"
                                />
                            </div>
                        </div>

                        {/* --- Message & Button --- */}
                        {message.text && (
                            <div className={`p-3 rounded-lg text-sm text-center ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>

                    </form>
                </div>
            }
        </div>
    );
};

export default ParentProfile;
