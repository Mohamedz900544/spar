import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CalendarClock,
  KeyRound,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "./admin/components/Button";
import toast from "react-hot-toast";
import PropTypes from 'prop-types';
// import ParentHeader from "./admin/components/ParentHeader"; // Uncomment if needed

/* ========= API BASE ========= */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ====== RATING STARS COMPONENT ====== */
const RatingStars = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`w-4 h-4 ${value && star <= value
              ? "fill-[#fbbf24] text-[#fbbf24]"
              : "text-slate-300"
              }`}
          />
        </button>
      ))}
    </div>
  );
};

/* ================= PARENT DASHBOARD ================= */

/** 
 * 
@param {Object} props
@param {import('../types').Parent} props.parent
@param {Function} props.setParent

*/


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
  const [sessionRatings, setSessionRatings] = useState({}); // { `${roundCode}-${sessionId}`: number }
  const [sessionFeedback, setSessionFeedback] = useState({}); // 1. NEW: Store feedback text
  const [ratingSubmitted, setRatingSubmitted] = useState({}); // { key: true }

  const [selectedChildId, setSelectedChildId] = useState("");
  const [isEnrollingChild, setIsEnrollingChild] = useState(false)

  // Helpers
  const getToken = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("sparvi_token")
      : null;

  const getRole = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("sparvi_role")
      : null;

  // Load Dashboard Data
  useEffect(() => {
    const token = getToken();
    const role = getRole();

    if (!token || role !== "parent") {
      navigate("/login");
      return;
    }
    const controller = new AbortController()
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

        const res = await fetch(
          `${API_BASE_URL}/api/parent/dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal
          }
        );

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

        setParent(json.parent);
        setEnrollments(json.enrollments || []);

        const mergedRounds = enrichRoundsWithAllPhotos(json);
        setRounds(mergedRounds);

        const codes = (json.rounds || []).map((r) => r.code);
        setLinkedRounds(codes);
      } catch (err) {
        console.error("Dashboard load error:", err);
        setGlobalError(err.message || "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
    return () => { controller.abort() }
  }, [navigate, setParent]);

  // Link Round Handler
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
      setIsEnrollingChild(true)
      const res = await fetch(
        `${API_BASE_URL}/api/parent/link-round`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            code,
            childId: selectedChildId
          }),
        }
      );

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
      toast.success("child enrolled successfully")
      setRoundCodeInput("");
    } catch (err) {
      console.error("Link round error:", err);
      setLinkErrorMessage(err.message || "Could not link this round.");
    } finally {
      setIsEnrollingChild(false)
    }
  };

  const visibleRounds = linkedRounds
    .map((code) => rounds.find((r) => r.code === code))
    .filter(Boolean);

  const getChildrenForRound = (roundCode) =>
    enrollments.filter((e) => e.roundCode === roundCode);

  /* === RATING LOGIC === */

  const handleSessionRatingChange = (roundCode, sessionId, rating) => {
    setSessionRatings((prev) => ({
      ...prev,
      [`${roundCode}-${sessionId}`]: rating,
    }));
    // Reset submitted state if they change the rating
    setRatingSubmitted((prev) => {
      const key = `${roundCode}-${sessionId}`;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // 2. NEW: Handle text change
  const handleSessionFeedbackChange = (roundCode, sessionId, text) => {
    setSessionFeedback((prev) => ({
      ...prev,
      [`${roundCode}-${sessionId}`]: text,
    }));
  };

  const handleSubmitRating = async (roundCode, session) => {
    // Ensure we use the correct ID (handling standard ID vs MongoDB _id)
    const sessionId = session.id || session._id;
    const key = `${roundCode}-${sessionId}`;

    const rating = sessionRatings[key];
    const feedback = sessionFeedback[key] || ""; // 3. NEW: Get feedback

    if (!rating) return;

    const token = getToken();
    const role = getRole();
    if (!token || role !== "parent") {
      navigate("/login");
      return;
    }
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/parent/rate-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roundCode,
            sessionId,
            rating,
            feedback,
          }),
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Could not save rating");
      }

      setRatingSubmitted((prev) => ({
        ...prev,
        [key]: true,
      }));
    } catch (err) {
      console.error("Rating error:", err);
    }
  };

  return (
    <>
      <main className="flex-1 px-4 py-8 md:py-10">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Global Error */}
          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs md:text-sm rounded-2xl px-4 py-3">
              {globalError}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-3xl border border-[#dbeafe] p-5 md:p-6 text-center shadow-sm">
              <p className="text-sm md:text-base text-slate-600">Loading your dashboard...</p>
            </div>
          )}

          {/* Hero & Enrollment Form */}
          {!loading && (
            <motion.section
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-[2fr,1.2fr] gap-6 md:gap-10 items-center"
            >
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#fbbf24] mb-2">
                  On-site sessions • Parent area
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#0b63c7] mb-3 leading-tight">
                  Welcome{parent.name ? `, ${parent.name}` : ""} to your{" "}
                  <span className="text-slate-900">Sparvi Lab</span> parent dashboard
                </h1>
                <p className="text-sm md:text-base text-slate-600 mb-2">
                  From here you can follow your child&apos;s on-site electronics round, see their schedule, and send feedback.
                </p>
                <p className="text-xs md:text-sm text-slate-500">
                  Use the round code shared by Sparvi Lab to unlock your child&apos;s group.
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-[#dbeafe] shadow-[0_18px_40px_rgba(15,118,210,0.18)] p-5 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff6ff] flex items-center justify-center">
                    <KeyRound className="w-5 h-5 text-[#0b63c7]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Enroll a child</p>
                    <p className="text-[11px] text-slate-500">Select a child and enter code</p>
                  </div>
                </div>

                <form onSubmit={handleLinkRound} className="space-y-3">
                  <div>
                    <select
                      value={selectedChildId}
                      onChange={(e) => setSelectedChildId(e.target.value)}
                      className="w-full rounded-full border border-[#dbeafe] bg-[#f9fbff] px-4 py-2.5 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#0ea5e9] text-slate-900 cursor-pointer appearance-none"
                    >
                      <option value="" disabled>Select child...</option>
                      {parent.children && parent.children.length > 0 ? (
                        parent.children.map((child) => (
                          <option key={child._id || child.id} value={child._id || child.id}>
                            {child.name || child.childName}
                          </option>
                        ))
                      ) : (
                        <option disabled>No children found</option>
                      )}
                    </select>
                  </div>

                  <input
                    type="text"
                    value={roundCodeInput}
                    onChange={(e) => setRoundCodeInput(e.target.value)}
                    className="w-full rounded-full border border-[#dbeafe] bg-[#f9fbff] px-4 py-2.5 text-xs md:text-sm outline-none focus:ring-2 focus:ring-[#0ea5e9] font-mono text-slate-900 placeholder:text-slate-400"
                    placeholder="Enter round code (e.g. SPRV-101)"
                  />

                  {linkErrorMessage && (
                    <p className="text-[11px] text-red-500">{linkErrorMessage}</p>
                  )}
                  <Button type={'submit'} text={"Enroll Child"} isLoading={isEnrollingChild} />

                </form>
              </div>
            </motion.section>
          )}

          {/* Stats Bar */}
          {!loading && (
            <motion.section
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {/* ... Stats cards remain same ... */}
              <div className="bg-white rounded-2xl border border-[#dbeafe] p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Linked rounds</p>
                  <p className="text-xl font-bold text-slate-900">{linkedRounds.length}</p>
                </div>
                <CalendarClock className="w-6 h-6 text-[#0b63c7]" />
              </div>
              <div className="bg-white rounded-2xl border border-[#dbeafe] p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Your children in rounds</p>
                  <p className="text-xl font-bold text-slate-900">
                    {visibleRounds.length ? enrollments.filter((e) => linkedRounds.includes(e.roundCode)).length : 0}
                  </p>
                </div>
                <Users className="w-6 h-6 text-[#0b63c7]" />
              </div>
              <div className="bg-white rounded-2xl border border-[#dbeafe] p-4 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">On-site only</p>
                  <p className="text-sm font-semibold text-slate-800">In-person electronics sessions</p>
                </div>
                <ImageIcon className="w-6 h-6 text-[#0b63c7]" />
              </div>
            </motion.section>
          )}

          {/* Rounds List */}
          {!loading && visibleRounds.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="bg-white rounded-3xl border border-[#dbeafe] p-5 md:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base md:text-lg font-semibold text-slate-900">Your rounds</h2>
                <p className="text-[11px] text-slate-500">Tap a round to see schedule & feedback options.</p>
              </div>

              <div className="space-y-4">
                {visibleRounds.map((round) => {
                  const children = getChildrenForRound(round.code);
                  const isSelected = selectedRoundCode === round.code;

                  return (
                    <div key={round.id} className="border border-[#e5e7eb] rounded-2xl px-3 py-3 md:px-4 md:py-4">
                      {/* Round Toggle Header */}
                      <button
                        type="button"
                        onClick={() => setSelectedRoundCode((prev) => (prev === round.code ? null : round.code))}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <div>
                          <p className="text-sm md:text-base font-semibold text-slate-900">{round.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {round.level} · {round.campus} · Code: <span className="font-mono font-semibold text-[#0b63c7]">{round.code}</span>
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {round.startDate} → {round.endDate} · {round.sessionsCount} sessions
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${round.status === "Active" ? "bg-[#dcfce7] text-[#166534]" : "bg-[#e5e7eb] text-[#374151]"}`}>
                            {round.status}
                          </span>
                          <span className="text-[11px] text-[#0b63c7]">{isSelected ? "Hide details" : "Show details"}</span>
                        </div>
                      </button>

                      {/* Expanded Details */}
                      {isSelected && (
                        <div className="mt-3 border-t border-dashed border-[#e5e7eb] pt-3 space-y-4">

                          {/* Child Info */}
                          <div>
                            <p className="text-[11px] font-semibold text-slate-700 mb-2">Your child in this round ({children.length})</p>
                            <div className="grid grid-cols-1 gap-3">
                              {children.map((child) => (
                                <div key={child.id} className="border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-[11px] md:text-xs bg-[#f9fbff]">
                                  <p className="font-semibold text-slate-800">{child.childName}</p>
                                  <p className="text-[11px] text-slate-500">Status: {child.status} · Level: {child.level}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Gallery */}
                          <div>
                            <p className="text-[11px] font-semibold text-slate-700 mb-2">Round Gallery</p>
                            {!round.photos || round.photos.length === 0 ? (
                              <div className="bg-slate-50 rounded-xl p-4 text-center border border-dashed border-slate-200">
                                <p className="text-[11px] text-slate-500">No photos uploaded yet.</p>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {round.photos.map((photo, index) => (
                                  <div key={photo.id || index} className="w-24 h-24 rounded-lg overflow-hidden border border-[#dbeafe] bg-slate-100 relative group">
                                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Sessions & Ratings */}
                          <div>
                            <p className="text-[11px] font-semibold text-slate-700 mb-2">Sessions & Feedback</p>
                            <div className="space-y-2">
                              {round?.sessions?.map((session) => {
                                const sessionId = session.id || session._id;
                                const key = `${round.code}-${sessionId}`;

                                const rating = sessionRatings[key] || session.userRating || 0;
                                const feedbackText = sessionFeedback[key] || session.feedback || "";
                                const submitted = ratingSubmitted[key];

                                return (
                                  <div
                                    key={sessionId}
                                    className="border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-[11px] md:text-xs flex flex-col md:flex-row gap-4"
                                  >
                                    <div className="flex-1">
                                      <p className="font-semibold text-slate-800">{session.title}</p>
                                      <p className="text-[11px] text-slate-500">{session?.description}</p>
                                    </div>

                                    <div className="flex-shrink-0 min-w-[200px] flex flex-col items-start md:items-end gap-2">
                                      {session.status === "Completed" ? (
                                        <>
                                          <div className="flex flex-col items-end gap-1 w-full">
                                            <p className="text-[10px] text-slate-500">Rate & Review</p>
                                            <RatingStars
                                              value={rating}
                                              onChange={(stars) => handleSessionRatingChange(round.code, sessionId, stars)}
                                            />
                                          </div>

                                          {/* 5. NEW: Textarea for Description */}
                                          <textarea
                                            value={feedbackText}
                                            onChange={(e) => handleSessionFeedbackChange(round.code, sessionId, e.target.value)}
                                            placeholder="Optional: How was the session?"
                                            className="w-full h-16 rounded-lg border border-slate-200 bg-[#f8fafc] p-2 text-[10px] text-slate-700 outline-none focus:border-[#fbbf24] focus:ring-1 focus:ring-[#fbbf24] resize-none"
                                          />

                                          <div className="flex flex-col items-end w-full">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                handleSubmitRating(round.code, session)
                                              }
                                              }
                                              className="rounded-full border border-[#fbbf24] bg-[#fffbeb] text-[10px] font-semibold px-3 py-1.5 text-[#92400e] hover:bg-[#fef3c7] hover:border-[#f59e0b] transition-colors w-full md:w-auto text-center"
                                            >
                                              Send Rating
                                            </button>
                                            {submitted && (
                                              <p className="text-[10px] text-[#0b63c7] mt-1 font-medium">
                                                ✓ Rating sent. Thanks!
                                              </p>
                                            )}
                                          </div>
                                        </>
                                      ) : (
                                        <p className={`text-sm font-medium mt-1 ${session.status === "Active" ? "text-green-600" : "text-slate-400"
                                          }`}>
                                          {session.status}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Empty State */}
          {!loading && visibleRounds.length === 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-3xl border border-[#dbeafe] p-5 md:p-6 text-center shadow-sm"
            >
              <p className="text-sm md:text-base font-semibold text-slate-900 mb-1">No rounds linked yet</p>
              <p className="text-xs md:text-sm text-slate-500">
                After you receive a round code from Sparvi Lab, enter it above to see your child&apos;s schedule.
              </p>
            </motion.section>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs md:text-sm text-slate-500 bg-[#edf2fb] border-t border-[#dbe2ff]">
        © {new Date().getFullYear()} Sparvi Lab. All rights reserved.
      </footer>
    </>
  );
};

ParentDashboard.propTypes = {
  parent: PropTypes.shape({
    name: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      age: PropTypes.number,
      _id: PropTypes.string,
      enrolledRounds: PropTypes.arrayOf(PropTypes.shape({
        _id: PropTypes.string
      }))
    }))
  }),
  setParent: PropTypes.func.isRequired,
};
export default ParentDashboard;
