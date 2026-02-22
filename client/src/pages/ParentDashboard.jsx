import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CalendarClock,
  KeyRound,
  Star,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Camera,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import PropTypes from 'prop-types';

// Fixed the import.meta compilation error by defaulting to a safe string for this environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ====== RATING STARS COMPONENT ====== */
const RatingStars = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none transform transition-all duration-200 hover:scale-110 active:scale-90"
        >
          <Star
            className={`w-5 h-5 transition-all duration-300 ${
              value && star <= value
                ? "fill-amber-400 text-amber-400 drop-shadow-[0_2px_4px_rgba(251,191,36,0.3)]"
                : "fill-slate-100 text-slate-200 hover:text-amber-200"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

/* ================= PARENT DASHBOARD ================= */
const ParentDashboard = ({ parent, setParent }) => {
  const navigate = useNavigate();

  // Data from Backend
  const [rounds, setRounds] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState("");

  // UI state
  const [roundCodeInput, setRoundCodeInput] = useState("");
  const [linkedRounds, setLinkedRounds] = useState([]);
  const [selectedRoundCode, setSelectedRoundCode] = useState(null);
  const [linkErrorMessage, setLinkErrorMessage] = useState("");

  // Rating & Feedback State
  const [sessionRatings, setSessionRatings] = useState({});
  const [sessionFeedback, setSessionFeedback] = useState({});
  const [ratingSubmitted, setRatingSubmitted] = useState({});

  const [selectedChildId, setSelectedChildId] = useState("");
  const [isEnrollingChild, setIsEnrollingChild] = useState(false);

  // Helpers
  const getToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("sparvi_token") : null;

  const getRole = () =>
    typeof window !== "undefined" ? localStorage.getItem("sparvi_role") : null;
  const hasCompletedProfile = (user) => {
    const firstChild = user?.children?.[0];
    const hasChildName = Boolean(firstChild?.name && firstChild.name.trim());
    const hasChildAge = Number(firstChild?.age) > 0;
    return hasChildName && hasChildAge;
  };

  // Load Dashboard Data (Untouched Backend Logic)
  useEffect(() => {
    const token = getToken();
    const role = getRole();

    if (!token || role !== "parent") {
      navigate("/login");
      return;
    }
    const controller = new AbortController();
    const enrichRoundsWithAllPhotos = (apiData) => {
      const { rounds, enrollments, studentPhotos } = apiData;

      return rounds.map((round) => {
        const relatedEnrollments = enrollments.filter(
          (e) => e.roundCode === round.code
        );
        const allPhotosForRound = relatedEnrollments.flatMap((enrollment) => {
          return studentPhotos[enrollment.id] || [];
        });

        return {
          ...round,
          enrollments: relatedEnrollments,
          photos: allPhotosForRound
        };
      });
    };

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setGlobalError("");

        const res = await fetch(`${API_BASE_URL}/api/parent/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });

        if (res.status === 401) {
          localStorage.removeItem("sparvi_token");
          localStorage.removeItem("sparvi_role");
          localStorage.removeItem("sparvi_user");
          navigate("/login");
          return;
        }

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.message || "Failed to load dashboard");
        }

        if (!hasCompletedProfile(json.parent)) {
          navigate("/parent/profile");
          return;
        }
        setParent(json.parent);
        setEnrollments(json.enrollments || []);

        const mergedRounds = enrichRoundsWithAllPhotos(json);
        setRounds(mergedRounds);

        const codes = (json.rounds || []).map((r) => r.code);
        setLinkedRounds(codes);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Dashboard load error:", err);
        setGlobalError(err.message || "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
    return () => { controller.abort(); };
  }, [navigate, setParent]);

  // Link Round Handler (Untouched Backend Logic)
  const handleLinkRound = async (e) => {
    e.preventDefault();
    const code = roundCodeInput.trim().toUpperCase();

    if (!code) {
      setLinkErrorMessage("Please enter a round code.");
      return;
    }
    if (!selectedChildId) {
      setLinkErrorMessage("Please select a child to enroll.");
      return;
    }

    const token = getToken();
    const role = getRole();

    if (!token || role !== "parent") {
      navigate("/login");
      return;
    }

    try {
      setLinkErrorMessage("");
      setIsEnrollingChild(true);
      const res = await fetch(`${API_BASE_URL}/api/parent/link-round`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code, childId: selectedChildId }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "Round code not found or not allowed.");
      }

      if (json.round) {
        setRounds((prev) => {
          const exists = prev.some((r) => r.code === json.round.code);
          if (exists) return prev;
          return [...prev, json.round];
        });

        setLinkedRounds((prev) =>
          prev.includes(json.round.code) ? prev : [...prev, json.round.code]
        );

        setSelectedRoundCode(json.round.code);
      }

      if (Array.isArray(json.enrollments)) setEnrollments(json.enrollments);
      toast.success("Child enrolled successfully");
      setRoundCodeInput("");
    } catch (err) {
      console.error("Link round error:", err);
      setLinkErrorMessage(err.message || "Could not link this round.");
    } finally {
      setIsEnrollingChild(false);
    }
  };

  const visibleRounds = linkedRounds
    .map((code) => rounds.find((r) => r.code === code))
    .filter(Boolean);

  const getChildrenForRound = (roundCode) =>
    enrollments.filter((e) => e.roundCode === roundCode);

  /* === RATING LOGIC (Untouched Backend Logic) === */
  const handleSessionRatingChange = (roundCode, sessionId, rating) => {
    setSessionRatings((prev) => ({
      ...prev,
      [`${roundCode}-${sessionId}`]: rating,
    }));
    setRatingSubmitted((prev) => {
      const key = `${roundCode}-${sessionId}`;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  const handleSessionFeedbackChange = (roundCode, sessionId, text) => {
    setSessionFeedback((prev) => ({
      ...prev,
      [`${roundCode}-${sessionId}`]: text,
    }));
  };

  const handleSubmitRating = async (roundCode, session) => {
    const sessionId = session.id || session._id;
    const key = `${roundCode}-${sessionId}`;

    const rating = sessionRatings[key];
    const feedback = sessionFeedback[key] || "";

    if (!rating) return;

    const token = getToken();
    const role = getRole();
    if (!token || role !== "parent") {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/parent/rate-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roundCode, sessionId, rating, feedback }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Could not save rating");
      }

      setRatingSubmitted((prev) => ({ ...prev, [key]: true }));
      toast.success("Feedback submitted successfully!");
    } catch (err) {
      console.error("Rating error:", err);
      toast.error("Failed to submit feedback.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Background Mesh */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/80 via-white to-transparent -z-10" />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 z-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Global Error */}
          {globalError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p>{globalError}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center">
               <svg className="w-8 h-8 text-indigo-500 animate-spin mb-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">Loading your dashboard...</p>
            </div>
          )}

          {/* Hero & Enrollment Form */}
          {!loading && (
            <Motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8 items-center"
            >
              <div className="pr-4 lg:pr-8">
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></span>
                  Parent Portal
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight tracking-tight">
                  Welcome{parent?.name ? `, ${parent.name}` : ""} to your{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Sparvi Lab</span> dashboard
                </h1>
                <p className="text-base text-slate-600 mb-5 leading-relaxed">
                  Track your child&apos;s on-site electronics sessions, view their schedule, browse project photos, and share feedback with instructors all in one place.
                </p>
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <p className="text-sm font-medium text-slate-600">
                    <span className="text-slate-900 font-semibold">Pro Tip:</span> Use the secure round code provided by the lab to unlock group access.
                  </p>
                </div>
              </div>

              {/* Enrollment Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <KeyRound className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Enroll a Child</h2>
                    <p className="text-sm text-slate-500">Link your child to a new round</p>
                  </div>
                </div>

                <form onSubmit={handleLinkRound} className="space-y-4">
                  <div className="relative group">
                    <select
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-slate-200 bg-white/50 pl-4 pr-10 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all cursor-pointer group-hover:border-slate-300"
                    >
                      <option value="" disabled>Select your child...</option>
                      {parent.children && parent.children.length > 0 ? (
                        parent.children.map((child, index) => (
                          <option
                            key={child._id || child.id || child.name || child.childName || index}
                            value={child._id || child.id}
                          >
                            {child.name || child.childName}
                          </option>
                        ))
                      ) : (
                        <option disabled>No children registered</option>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-slate-600 transition-colors">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={roundCodeInput}
                      onChange={(e) => setRoundCodeInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all uppercase font-mono tracking-wide hover:border-slate-300"
                      placeholder="Enter code (e.g. SPRV-101)"
                    />
                  </div>

                  {linkErrorMessage && (
                    <Motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      className="flex items-start gap-2 text-sm text-rose-600 bg-rose-50 p-3 rounded-lg border border-rose-100 overflow-hidden"
                    >
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {linkErrorMessage}
                    </Motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isEnrollingChild}
                    className="w-full relative overflow-hidden inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                  >
                    {isEnrollingChild ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin text-indigo-100" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Enrolling...
                      </span>
                    ) : "Enroll Now"}
                  </button>
                </form>
              </div>
            </Motion.section>
          )}

          {/* Stats Bar */}
          {!loading && (
            <Motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] flex items-center gap-4 hover:shadow-md transition-shadow group">
                <div className="h-12 w-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <CalendarClock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Linked Rounds</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">{linkedRounds.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] flex items-center gap-4 hover:shadow-md transition-shadow group">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Children</p>
                  <p className="text-2xl font-bold text-slate-900 mt-0.5">
                    {visibleRounds.length ? enrollments.filter((e) => linkedRounds.includes(e.roundCode)).length : 0}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] flex items-center gap-4 hover:shadow-md transition-shadow group">
                <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Media Gallery</p>
                  <p className="text-sm font-medium text-slate-900 mt-1">In-person session photos</p>
                </div>
              </div>
            </Motion.section>
          )}

          {/* Rounds List */}
          {!loading && visibleRounds.length > 0 && (
            <Motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] overflow-hidden"
            >
              <div className="border-b border-slate-100 p-6 md:p-8 bg-slate-50/50">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Your Enrolled Rounds</h2>
                <p className="text-sm text-slate-500 mt-1">Expand a round to view student progress, photo galleries, and submit session feedback.</p>
              </div>

              <div className="p-4 md:p-6 space-y-4 bg-slate-50/30">
                {visibleRounds.map((round) => {
                  const children = getChildrenForRound(round.code);
                  const isSelected = selectedRoundCode === round.code;

                  return (
                    <div 
                      key={round.id || round.code} 
                      className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden ${
                        isSelected ? "border-indigo-300 shadow-md ring-1 ring-indigo-50" : "border-slate-200 hover:border-slate-300 shadow-sm"
                      }`}
                    >
                      {/* Round Toggle Header */}
                      <button
                        type="button"
                        onClick={() => setSelectedRoundCode((prev) => (prev === round.code ? null : round.code))}
                        className="w-full flex items-center justify-between text-left p-5 md:p-6 focus:outline-none focus:bg-slate-50/50 transition-colors group"
                      >
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className={`text-lg font-bold transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                              {round.name}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              round.status === "Active" 
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}>
                              {round.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500 font-medium">
                            <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono text-xs">{round.code}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{round.level}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span>{round.campus}</span>
                          </div>
                        </div>

                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border shrink-0 transition-colors ${
                          isSelected ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600'
                        }`}>
                          <Motion.div animate={{ rotate: isSelected ? 180 : 0 }} transition={{ duration: 0.3 }}>
                            <ChevronDown className="w-5 h-5" />
                          </Motion.div>
                        </div>
                      </button>

                      {/* Expanded Details - Animated Presence added here */}
                      <AnimatePresence>
                        {isSelected && (
                          <Motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-slate-100 bg-slate-50/50 p-5 md:p-6 space-y-8">

                              {/* Child Info */}
                              <section>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                                  <Users className="w-4 h-4 text-slate-400" />
                                  Enrolled Students ({children.length})
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {children.map((child) => (
                                    <div key={child.id || child._id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all">
                                      <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                                        {(child.childName || child.name || "?")[0].toUpperCase()}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-900">{child.childName || child.name}</p>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">Level: {child.level || "Beginner"}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </section>

                              {/* Gallery */}
                              <section>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4 text-slate-400" />
                                  Round Gallery
                                </h4>
                                {!round.photos || round.photos.length === 0 ? (
                                  <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300 shadow-sm">
                                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-3">
                                      <Camera className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700">No lab photos yet</p>
                                    <p className="text-xs text-slate-500 mt-1">Instructors will upload moments from the session here.</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {round.photos.map((photo, index) => (
                                      <div key={photo.id || index} className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group shadow-sm cursor-zoom-in">
                                        <img 
                                          src={photo.url} 
                                          alt={photo.caption || "Lab Session"} 
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                          {photo.caption && <p className="text-xs text-white p-3 font-medium truncate">{photo.caption}</p>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </section>

                              {/* Sessions & Ratings */}
                              <section>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                                  <Star className="w-4 h-4 text-slate-400" />
                                  Session Schedule & Feedback
                                </h4>
                                <div className="space-y-3">
                                  {round?.sessions?.map((session) => {
                                    const sessionId = session.id || session._id;
                                    const key = `${round.code}-${sessionId}`;

                                    const rating = sessionRatings[key] || session.userRating || 0;
                                    const feedbackText = sessionFeedback[key] || session.feedback || "";
                                    const submitted = ratingSubmitted[key];
                                    const isCompleted = session.status === "Completed";

                                    return (
                                      <div
                                        key={sessionId}
                                        className={`bg-white border rounded-xl p-4 md:p-5 flex flex-col lg:flex-row gap-5 shadow-sm transition-colors ${isCompleted ? 'border-slate-200' : 'border-indigo-100 bg-indigo-50/40'}`}
                                      >
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <h5 className="font-bold text-slate-900 text-base">{session.title}</h5>
                                            {!isCompleted && (
                                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wide">
                                                Upcoming
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{session?.description || "No description provided for this session."}</p>
                                          
                                          <div className="flex items-center gap-3 mt-3 text-xs font-medium text-slate-500">
                                            <div className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded-md border border-slate-200">
                                              <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                                              {session.date || "Date TBA"}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="lg:w-[320px] flex-shrink-0 bg-slate-50/80 rounded-xl p-4 border border-slate-100">
                                          {isCompleted ? (
                                            <div className="flex flex-col gap-3 h-full">
                                              <div className="flex items-center justify-between">
                                                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Rate Session</p>
                                                <RatingStars
                                                  value={rating}
                                                  onChange={(stars) => handleSessionRatingChange(round.code, sessionId, stars)}
                                                />
                                              </div>

                                              <textarea
                                                value={feedbackText}
                                                onChange={(e) => handleSessionFeedbackChange(round.code, sessionId, e.target.value)}
                                                placeholder="Leave feedback for the instructor..."
                                                className="w-full flex-1 min-h-[60px] rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all placeholder:text-slate-400 shadow-inner"
                                              />

                                              <div className="flex items-center justify-between mt-auto pt-2">
                                                {submitted ? (
                                                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                                                    <CheckCircle2 className="w-4 h-4" /> Received
                                                  </span>
                                                ) : (
                                                  <span className="text-xs text-slate-400 italic">Not sent yet</span>
                                                )}
                                                
                                                <button
                                                  type="button"
                                                  disabled={!rating}
                                                  onClick={() => handleSubmitRating(round.code, session)}
                                                  className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                  Submit Review
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                                <CalendarClock className="w-5 h-5 text-slate-400" />
                                              </div>
                                              <p className="text-sm font-semibold text-slate-700">Session pending</p>
                                              <p className="text-xs text-slate-500 mt-1">Feedback opens after the session finishes.</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </section>

                            </div>
                          </Motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </Motion.section>
          )}

          {/* Empty State */}
          {!loading && visibleRounds.length === 0 && (
            <Motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                <KeyRound className="w-8 h-8 text-indigo-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">No Rounds Linked Yet</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                Use the form at the top of the page to enter a valid round code provided by the lab. This will unlock your child's schedule and media gallery.
              </p>
            </Motion.section>
          )}

        </div>
      </main>

      <footer className="py-8 text-center bg-white border-t border-slate-200 mt-auto z-10">
        <p className="text-sm text-slate-500 font-medium">
          © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

ParentDashboard.propTypes = {
  parent: PropTypes.shape({
    name: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      childName: PropTypes.string,
      level: PropTypes.string,
      status: PropTypes.string,
      age: PropTypes.number,
      _id: PropTypes.string,
      id: PropTypes.string,
      enrolledRounds: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string
      }))
    }))
  }),
  setParent: PropTypes.func.isRequired,
};

export default ParentDashboard;
