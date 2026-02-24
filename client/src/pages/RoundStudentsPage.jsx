import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Star, User, Mail, Loader2, MessageSquare, Baby, SortDesc, SortAsc, ImageIcon } from "lucide-react";
import { useMemo } from 'react';
import toast from "react-hot-toast";
import { Phone } from "lucide-react";

export const RoundStudentsPage = ({ searchValue }) => {
    const { roundId } = useParams();

    const [round, setRound] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // const [filteredStudents, setfilteredStudents] = useState([{}])
    const [sort, setSort] = useState(null)

    // const totalRatings = filteredStudents?.map((stu) => {
    //     return stu?.ratings?.reduce((sum, rate) => {
    //         console.log({ rate })
    //         return sum + Number(rate?.rating)
    //     }, 0)
    // })
    // const avgRatings = totalRatings?.map((rate, index) => {
    //     console.log(rate, filteredStudents[index]?.ratings?.length)
    //     return rate / filteredStudents[index]?.ratings?.length
    // })

    const getAverage = (student) => {
        if (!student.ratings || student.ratings.length === 0) return 0;
        const sum = student.ratings.reduce((acc, curr) => acc + Number(curr.rating), 0);
        return sum / student.ratings.length;
    };

    const finalStudents = useMemo(() => {
        if (!round?.roundStudents) return [];

        //  FILTERING
        const filtered = round.roundStudents.filter(stu => {
            const query = searchValue.toLowerCase();
            return stu.name?.toLowerCase().includes(query) || stu.phone?.includes(query) ||
                stu.children?.some(c => c.name?.toLowerCase().includes(query));
        });

        //  SORTING
        return filtered.sort((a, b) => {
            const avgA = getAverage(a);
            const avgB = getAverage(b);

            return sort ? avgB - avgA : avgA - avgB;
        });

    }, [round, searchValue, sort]);

    // 1. Pass 'studentId' to this function
    const handleSubmitImage = async (e, studentId) => {
        e.preventDefault();

        // 2. Get the file directly from the form input named "image"
        const file = e.target.image.files[0];
        if (!file) return toast.error("Please select an image first");

        const formData = new FormData();
        formData.append('image', file);

        try {
            // 3. FIX: Add studentId to the URL
            // Assuming your backend route is: /api/admin/enrollments/:id/image
            await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/api/admin/rounds/${roundId}/students/${studentId}/image`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: "Bearer " + localStorage.getItem('sparvi_token') // Don't forget the token!
                    }
                }
            );

            toast.success('Uploaded image successfully');

            // 4. Reload data so the new image appears immediately
            // You can reuse the fetch function if you move it outside useEffect, 
            // or simply force a reload:
            window.location.reload();

        } catch (error) {
            console.error(error);
            toast.error("Failed to upload image");
        }
    };
    // fetch data of round from backend
    useEffect(() => {
        async function fetchRoundData() {
            try {
                setIsLoading(true);
                const token = "Bearer " + localStorage.getItem('sparvi_token');
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/admin/rounds/${roundId}/students`,
                    { headers: { Authorization: token } }
                );
                setRound(res.data);
            } catch (err) {
                console.error(err);
                setError("Failed to load data");
            } finally {
                setIsLoading(false);
            }
        }

        if (roundId) fetchRoundData();
    }, [roundId]);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center text-slate-500 gap-2">
                <Loader2 className="animate-spin" /> Loading data...
            </div>
        );
    }

    if (error) return <div className="text-red-500 mt-10 text-center">{error}</div>;

    if (!round?.roundStudents?.length) {
        return <div className="mt-10 text-center text-slate-400">No students found.</div>;
    }

    return (
        <div className="mt-8 px-4 md:px-10">
            <div className="py-5 flex justify-between items-center">
                <div className="">
                    <h2 className="text-black font-bold text-2xl flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        Student Feedback & Ratings
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Showing ratings submitted by {round.roundStudents.length} students
                    </p>
                </div>
                <div>
                    <button className="flex p-2 border-blue-600 text-black" onClick={() => {
                        setSort(!sort)
                    }}>Sort {sort ? <SortDesc /> : <SortAsc />}</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#dbeafe] shadow-sm overflow-hidden">
                {finalStudents.map((student, index) => {
                    const totalRating = student.ratings?.reduce((acc, curr) => acc + curr.rating, 0) || 0;
                    const avgRating = student.ratings?.length
                        ? (totalRating / student.ratings.length).toFixed(1)
                        : "N/A";

                    return (
                        <div
                            key={student._id || student.id || index}
                            className={`p-6 ${index !== round.roundStudents.length - 1 ? 'border-b border-slate-100' : ''}`}
                        >
                            {/* Student Header */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                                        {student.photoUrl ? <img className="object-cover w-full h-full rounded-full" src={student.photoUrl} alt="" /> : <User size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight">{student.name}</h3>

                                        <div>
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                                <Phone size={12} />
                                                {student.phone}
                                            </div>
                                            {/* Email */}
                                            <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                                <Mail size={12} />
                                                {student.email}
                                            </div>
                                        </div>

                                        {/* --- NEW: Children Section --- */}
                                        {student.children && student.children.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <div className="flex items-center gap-1 text-slate-400">
                                                    <Baby size={14} />
                                                </div>
                                                {student.children.map((child, i) => (
                                                    <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                        {child.name}
                                                        <span className="ml-1 opacity-60">({child.age}yo)</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Phone */}
                                    </div>
                                </div>

                                {/* Avg Rating Badge */}
                                <div className="gap-2 flex flex-col ml-auto md:ml-0 items-end">

                                    <div className="mt-3 md:mt-0 flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
                                        <span className="text-slate-500 text-xs font-medium uppercase tracking-wide">Avg Rating:</span>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-slate-700">{avgRating}</span>
                                            <Star className="w-3.5 h-3.5 fill-slate-400 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="mt-3 md:mt-0 flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
                                        {/* ... inside the map loop ... */}

                                        <div className="mt-3 md:mt-0 flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
                                            {/* Pass the event (e) AND the student._id 
    */}
                                            <form
                                                className="flex items-center gap-1"
                                                onSubmit={(e) => handleSubmitImage(e, student._id)}
                                            >
                                                <input
                                                    name="image"
                                                    type="file"
                                                    accept="image/*" // Good practice to limit to images
                                                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                <button
                                                    type="submit"
                                                    className="bg-blue-600 text-white text-xs px-3 py-1 rounded-md hover:bg-blue-700 transition"
                                                >
                                                    Send
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {student.childPhotos && student.childPhotos.length > 0 && (
                                <div className="mb-5">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <ImageIcon size={14} />
                                        Activity Gallery ({student.childPhotos.length})
                                    </h4>

                                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                        {student.childPhotos.map((photo, i) => (
                                            <div
                                                key={photo._id || i}
                                                className="relative group w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50"
                                            >
                                                <img
                                                    src={photo.url}
                                                    alt="Student activity"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />

                                                {/* Hover Overlay with View Action */}
                                                <a
                                                    href={photo.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                                                >
                                                    <div className="bg-white/90 p-1.5 rounded-full shadow-sm backdrop-blur-sm">
                                                        <ImageIcon size={14} className="text-slate-700" />
                                                    </div>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Ratings List */}
                            <div className="bg-[#f8fafc] rounded-xl p-4 border border-slate-100">
                                {student.ratings?.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {student.ratings.map((rate) => (
                                            <div key={rate._id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-2 group hover:border-blue-200 transition-colors">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-700 truncate group-hover:text-blue-700 transition-colors" title={rate.sessionId?.title}>
                                                            {rate.sessionId?.title || "Unknown Session"}
                                                        </p>
                                                        <p className="text-[10px] text-slate-400 font-medium">
                                                            {rate.sessionId?.date
                                                                ? new Date(rate.sessionId.date).toLocaleDateString()
                                                                : "No Date"}
                                                        </p>
                                                    </div>
                                                    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${rate.rating >= 4 ? "bg-green-50 text-green-700 border border-green-100" :
                                                        rate.rating >= 3 ? "bg-yellow-50 text-yellow-700 border border-yellow-100" :
                                                            "bg-red-50 text-red-700 border border-red-100"
                                                        }`}>
                                                        {rate.rating}
                                                        <Star size={10} className={
                                                            rate.rating >= 4 ? "fill-green-600 text-green-600" :
                                                                rate.rating >= 3 ? "fill-yellow-500 text-yellow-500" :
                                                                    "fill-red-500 text-red-500"
                                                        } />
                                                    </div>
                                                </div>
                                                {rate.description ? (
                                                    <p className="text-xs text-slate-600 leading-relaxed">
                                                        {rate.description}
                                                    </p>
                                                ) : (
                                                    <p className="text-[11px] text-slate-400 italic">
                                                        No comment provided.
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-2">
                                        <p className="text-sm text-slate-400 italic">No feedback submitted yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
