// src/pages/admin/hooks/useAdminDashboard.js
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast'
import axios from "axios";
import { getTokenOrRedirect } from "../../../helpers/helpers.js";
/* ========= API BASE ========= */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const clearStoredAuth = () => {
  [
    "sparvi_token",
    "sparvi_role",
    "sparvi_user",
    "sparvi_user_email",
    "sparvi_user_name",
    "token",
    "role",
    "user",
  ].forEach((key) => localStorage.removeItem(key));
};

const parseResponseOrThrow = async (res, fallbackMessage = "Request failed") => {
  const raw = await res.text();
  let data = {};

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      const isHtml = raw.trimStart().startsWith("<!DOCTYPE") || raw.trimStart().startsWith("<html");
      if (isHtml) {
        throw new Error(
          "API returned HTML instead of JSON. Check VITE_API_BASE_URL and ensure backend is running on port 8300."
        );
      }
      throw new Error("API returned invalid JSON response.");
    }
  }

  if (!res.ok) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

const FALLBACK_SESSION_TIME = Number.MAX_SAFE_INTEGER;

const getSessionId = (session) => session?._id?.toString?.() || session?.id;

const getSessionDateKey = (session) => {
  if (session?.scheduledAt) {
    const date = new Date(session.scheduledAt);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-CA");
    }
  }

  if (typeof session?.date === "string" && session.date.trim()) {
    return session.date.slice(0, 10);
  }

  if (session?.date) {
    const date = new Date(session.date);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-CA");
    }
  }

  return "";
};

const getSessionTimestamp = (session) => {
  if (session?.scheduledAt) {
    const scheduledAt = new Date(session.scheduledAt).getTime();
    if (!Number.isNaN(scheduledAt)) return scheduledAt;
  }

  const dateKey = getSessionDateKey(session);
  if (!dateKey) return FALLBACK_SESSION_TIME;

  const time = typeof session?.time === "string" && session.time.trim()
    ? session.time.slice(0, 5)
    : "00:00";
  const timestamp = new Date(`${dateKey}T${time}:00`).getTime();
  return Number.isNaN(timestamp) ? FALLBACK_SESSION_TIME : timestamp;
};

const getTodayKey = () => new Date().toLocaleDateString("en-CA");

const isSameSessionId = (session, id) => {
  const sessionId = getSessionId(session);
  return sessionId?.toString?.() === id?.toString?.();
};

const getSessionStatusRank = (status = "") => {
  const ranks = {
    Active: 0,
    Full: 1,
    Draft: 2,
    Completed: 3,
  };
  return ranks[status] ?? 4;
};

const FREE_SESSION_FILTERS = ["Free Pending", "Free Assigned", "Free Finished"];

const getFreeSessionFilter = (session, now = new Date()) => {
  if (session?.sessionType !== "free") return "";
  if (!session.scheduledAt) return "Free Pending";

  const startDate = new Date(session.scheduledAt);
  if (Number.isNaN(startDate.getTime())) return "Free Pending";

  const explicitEndDate = session.endsAt ? new Date(session.endsAt) : null;
  const durationMinutes = Number(session.durationMinutes) > 0
    ? Number(session.durationMinutes)
    : 60;
  const endDate = explicitEndDate && !Number.isNaN(explicitEndDate.getTime())
    ? explicitEndDate
    : new Date(startDate.getTime() + durationMinutes * 60 * 1000);

  return endDate.getTime() <= now.getTime() ? "Free Finished" : "Free Assigned";
};

const sortSessionsBySchedule = (items = []) =>
  [...items].sort((a, b) => {
    const timeDiff = getSessionTimestamp(a) - getSessionTimestamp(b);
    if (timeDiff !== 0) return timeDiff;

    const statusDiff = getSessionStatusRank(a.status) - getSessionStatusRank(b.status);
    if (statusDiff !== 0) return statusDiff;

    return (a.title || "").localeCompare(b.title || "");
  });

/* ========== INITIAL DATA MODELS (UI fallback) ========== */

// const initialSessions = [
//   {
//     id: 1,
//     level: "Level 1",
//     title: "Electricity Basics",
//     date: "2025-01-10",
//     time: "16:00",
//     campus: "Nasr City",
//     capacity: 12,
//     enrolled: 9,
//     status: "Active",
//   },
//   {
//     id: 2,
//     level: "Level 1",
//     title: "WalkyBot Build",
//     date: "2025-01-17",
//     time: "16:00",
//     campus: "Maadi",
//     capacity: 12,
//     enrolled: 12,
//     status: "Full",
//   },
//   {
//     id: 3,
//     level: "Level 1",
//     title: "Smart Farm Project",
//     date: "2025-01-24",
//     time: "16:00",
//     campus: "Nasr City",
//     capacity: 12,
//     enrolled: 5,
//     status: "Draft",
//   },
// ];

// const initialEnrollments = [
//   {
//     id: 1,
//     childName: "Omar Ahmed",
//     parentName: "Ahmed Ali",
//     phone: "+201500012345",
//     level: "Level 1",
//     sessionTitle: "Electricity Basics",
//     status: "Confirmed",
//     note: "",
//     roundCode: "SPRV-101",
//   },
//   {
//     id: 2,
//     childName: "Laila Mohamed",
//     parentName: "Mohamed Hassan",
//     phone: "+201500056789",
//     level: "Level 1",
//     sessionTitle: "WalkyBot Build",
//     status: "Waiting",
//     note: "",
//     roundCode: "SPRV-101",
//   },
//   {
//     id: 3,
//     childName: "Youssef Samir",
//     parentName: "Samir Fathy",
//     phone: "+201500078945",
//     level: "Level 1",
//     sessionTitle: "Smart Farm Project",
//     status: "Cancelled",
//     note: "",
//     roundCode: "SPRV-202",
//   },
// ];

// const initialRounds = [
//   {
//     id: 1,
//     code: "SPRV-101",
//     name: "Round 1 – Nasr City (Saturday)",
//     level: "Level 1",
//     campus: "Nasr City",
//     startDate: "2025-01-10",
//     endDate: "2025-02-21",
//     sessionsCount: 6,
//     weeksPerSession: 1,
//     status: "Active",
//   },
//   {
//     id: 2,
//     code: "SPRV-202",
//     name: "Round 2 – Maadi (Friday)",
//     level: "Level 1",
//     campus: "Maadi",
//     startDate: "2025-03-01",
//     endDate: "2025-04-12",
//     sessionsCount: 6,
//     weeksPerSession: 1,
//     status: "Planned",
//   },
// ];

// const initialGallery = [
//   {
//     id: 1,
//     title: "Kids building WalkyBot",
//     date: "2024-12-20",
//     status: "Published",
//     featured: true,
//   },
//   {
//     id: 2,
//     title: "Smart Farm final projects",
//     date: "2024-12-18",
//     status: "Published",
//     featured: false,
//   },
//   {
//     id: 3,
//     title: "First electricity basics session",
//     date: "2024-12-10",
//     status: "Draft",
//     featured: false,
//   },
// ];

// const initialMessages = [
//   {
//     id: 1,
//     parentName: "Sara Ali",
//     phone: "+201500077369",
//     childAge: 7,
//     message: "I want to book Level 1 for my son on Fridays in Nasr City.",
//     status: "New",
//     internalNote: "",
//   },
//   {
//     id: 2,
//     parentName: "Ola Hassan",
//     phone: "+201500012300",
//     childAge: 8,
//     message: "Do you have groups for girls only?",
//     status: "In Progress",
//     internalNote: "",
//   },
//   {
//     id: 3,
//     parentName: "Khaled Mostafa",
//     phone: "+201500044400",
//     childAge: 6,
//     message: "Can you send me the full schedule for January?",
//     status: "Closed",
//     internalNote: "",
//   },
// ];

// example round ratings (later from backend)
// const initialRoundRatings = [
//   {
//     roundCode: "SPRV-101",
//     averageRating: 4.8,
//     totalReviews: 9,
//   },
//   {
//     roundCode: "SPRV-202",
//     averageRating: 4.5,
//     totalReviews: 5,
//   },
// ];

/* ========== HOOK ========== */

export const useAdminDashboard = () => {
  const navigate = useNavigate();

  // meta
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // sessions
  const [sessions, setSessions] = useState([]);
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionStatusFilter, setSessionStatusFilter] = useState("Today");

  // enrollments
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] =
    useState("All");

  // gallery
  const [galleryItems, setGalleryItems] = useState([]);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newGalleryFile, setNewGalleryFile] = useState(null);

  // messages
  const [messages, setMessages] = useState([]);
  const [messageStatusFilter, setMessageStatusFilter] = useState("All");

  // instructors
  const [instructors, setInstructors] = useState([]);
  const [newInstructor, setNewInstructor] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    campusCode: "",
  });
  const [isCreatingInstructor, setIsCreatingInstructor] = useState(false);
  const [instructorCampusDrafts, setInstructorCampusDrafts] = useState({});
  const [salesAgents, setSalesAgents] = useState([]);
  const [newSalesAgent, setNewSalesAgent] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [isCreatingSalesAgent, setIsCreatingSalesAgent] = useState(false);

  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [blockProjectsByUser, setBlockProjectsByUser] = useState({});

  // rounds
  const [rounds, setRounds] = useState([]);
  const [roundRatings, setRoundRatings] =
    useState([]);
  const [expandedRoundId, setExpandedRoundId] = useState(null);

  const [newRound, setNewRound] = useState({
    name: "",
    level: "Level 1",
    campus: "",
    startDate: "",
    endDate: "",
    weeklySessionDay: "saturday",
    weeklySessionTime: "",
    sessionDurationMinutes: 120,
    status: "Active",
  });

  // photos per enrollment
  const [studentPhotos, setStudentPhotos] = useState([]);

  // stats
  const [totalKids, setTotalKids] = useState(0);
  const [todayVisitors, setTodayVisitors] = useState(0);
  const [liveVisitors, setLiveVisitors] = useState(0);

  const [isSendingGalleryImage, setIsSendingGalleryImage] = useState(false)

  // ====================== HELPERS ======================

  const handleNewInstructorChange = (field, value) => {
    setNewInstructor((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewSalesAgentChange = (field, value) => {
    setNewSalesAgent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateInstructor = async (e) => {
    e.preventDefault();
    const token = getTokenOrRedirect();
    if (!token) return;

    try {
      setIsCreatingInstructor(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/instructors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newInstructor),
      });

      const data = await parseResponseOrThrow(res, "Failed to create instructor");

      setInstructors((prev) => [data.instructor, ...prev]);
      setNewInstructor({
        name: "",
        email: "",
        phone: "",
        password: "",
        campusCode: "",
      });
      toast.success("Instructor created successfully");
    } catch (err) {
      console.error("Create instructor error:", err);
      toast.error(err.message || "Failed to create instructor");
    } finally {
      setIsCreatingInstructor(false);
    }
  };

  const handleInstructorCampusChange = (id, value) => {
    setInstructorCampusDrafts((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCreateSalesAgent = async (e) => {
    e.preventDefault();
    const token = getTokenOrRedirect();
    if (!token) return;

    try {
      setIsCreatingSalesAgent(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/sales-agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newSalesAgent),
      });

      const data = await parseResponseOrThrow(res, "Failed to create sales agent");

      setSalesAgents((prev) => [data.salesAgent, ...prev]);
      setNewSalesAgent({
        name: "",
        email: "",
        phone: "",
        password: "",
      });
      toast.success(
        data.welcomeEmail?.sent
          ? "Sales agent created and login email sent"
          : "Sales agent created successfully"
      );
    } catch (err) {
      console.error("Create sales agent error:", err);
      toast.error(err.message || "Failed to create sales agent");
    } finally {
      setIsCreatingSalesAgent(false);
    }
  };

  const handleUpdateInstructorCampus = async (id) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    const campusCode = instructorCampusDrafts[id] ?? "";

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/instructors/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ campusCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update campus");
      }

      setInstructors((prev) =>
        prev.map((inst) =>
          inst._id === id || inst.id === id ? { ...inst, ...data.instructor } : inst
        )
      );
      toast.success("Campus updated");
    } catch (err) {
      console.error("Update campus error:", err);
      toast.error(err.message || "Failed to update campus");
    }
  };

  const handleDeleteInstructor = async (id) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    const targetInstructor = instructors.find(
      (inst) => (inst.id || inst._id) === id
    );
    const confirmed = window.confirm(
      `Delete instructor "${targetInstructor?.name || "this instructor"}"?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/instructors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await parseResponseOrThrow(res, "Failed to delete instructor");
      const deletedId = data.instructorId || id;

      setInstructors((prev) =>
        prev.filter((inst) => {
          const currentId = inst.id || inst._id;
          return currentId !== deletedId;
        })
      );
      setInstructorCampusDrafts((prev) => {
        const next = { ...prev };
        delete next[deletedId];
        return next;
      });
      toast.success("Instructor deleted successfully");
    } catch (err) {
      console.error("Delete instructor error:", err);
      toast.error(err.message || "Failed to delete instructor");
    }
  };

  const handleDeleteSalesAgent = async (id) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    const targetSalesAgent = salesAgents.find(
      (agent) => (agent.id || agent._id)?.toString?.() === id?.toString?.()
    );
    const confirmed = window.confirm(
      `Delete sales agent "${targetSalesAgent?.name || "this sales agent"}"?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sales-agents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await parseResponseOrThrow(res, "Failed to delete sales agent");
      const deletedId = data.salesAgentId || id;

      setSalesAgents((prev) =>
        prev.filter((agent) => {
          const currentId = agent.id || agent._id;
          return currentId?.toString?.() !== deletedId?.toString?.();
        })
      );
      toast.success("Sales agent deleted successfully");
    } catch (err) {
      console.error("Delete sales agent error:", err);
      toast.error(err.message || "Failed to delete sales agent");
    }
  };

  const handleDeleteParent = async (id) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    const targetParent = users.find((u) => (u.id || u._id) === id);
    const confirmed = window.confirm(
      `Delete parent "${targetParent?.name || "this parent"}"? This removes the parent account and linked enrollments/photos.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/parents/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await parseResponseOrThrow(res, "Failed to delete parent");
      const deletedId = data.parentId || id;
      const deletedEnrollmentIdSet = new Set(
        Array.isArray(data.deletedEnrollmentIds)
          ? data.deletedEnrollmentIds.map((enrollmentId) =>
            enrollmentId?.toString?.()
          )
          : []
      );

      setUsers((prev) =>
        prev.filter((user) => {
          const userId = user.id || user._id;
          return userId !== deletedId;
        })
      );

      setEnrollments((prev) =>
        prev.filter((enrollment) => {
          const enrollmentId = (enrollment.id || enrollment._id)?.toString?.();
          if (deletedEnrollmentIdSet.size > 0 && deletedEnrollmentIdSet.has(enrollmentId)) {
            return false;
          }
          const enrollmentUserId = enrollment.user?._id || enrollment.user;
          return enrollmentUserId?.toString?.() !== deletedId?.toString?.();
        })
      );

      setStudentPhotos((prev) => {
        if (!prev || typeof prev !== "object" || Array.isArray(prev)) return prev;
        const next = { ...prev };

        Object.keys(next).forEach((enrollmentId) => {
          if (
            deletedEnrollmentIdSet.size > 0 &&
            deletedEnrollmentIdSet.has(enrollmentId?.toString?.())
          ) {
            delete next[enrollmentId];
          }
        });

        return next;
      });

      if (targetParent?.children?.length) {
        setTotalKids((prev) => Math.max(0, prev - targetParent.children.length));
      }

      toast.success("Parent account deleted successfully");
    } catch (err) {
      console.error("Delete parent error:", err);
      toast.error(err.message || "Failed to delete parent");
    }
  };
  // ***********************

  async function deleteSessions(id) {
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${getTokenOrRedirect()}`
        }
      })
      setSessions(prevSessions => prevSessions.filter(s => !isSameSessionId(s, id)))
      toast.success('Session deleted successfully')
    } catch (error) {
      console.log(error.response?.data?.message || error.message)
      toast.error('Error deleting session')
    }
  }

  async function handleDeleteRound(id) {
    const token = getTokenOrRedirect();
    if (!token) return;
    const round = rounds.find((r) => r.id === id || r._id === id);
    const confirmed = window.confirm(
      `Delete round "${round?.name || "this round"}"? This will remove sessions, enrollments, and ratings.`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/admin/rounds/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setRounds((prev) => prev.filter((r) => r.id !== id && r._id !== id))
      if (round?.code) {
        setRoundRatings((prev) => prev.filter((r) => r.roundCode !== round.code))
      }
      setEnrollments((prev) =>
        prev.filter((e) => {
          const roundId = e.round?.toString?.() || e.round;
          return roundId !== id && e.roundCode !== round?.code;
        })
      )
      setSessions((prev) =>
        prev.filter((s) => {
          const roundId = s.round?.toString?.() || s.round;
          return roundId !== id;
        })
      )
      setStudentPhotos((prev) => {
        if (!round?.code) return prev;
        const remaining = {};
        const enrollmentsToRemove = enrollments
          .filter((e) => {
            const roundId = e.round?.toString?.() || e.round;
            return roundId === id || e.roundCode === round.code;
          })
          .map((e) => e.id || e._id);
        const toRemove = new Set(enrollmentsToRemove.filter(Boolean));
        Object.entries(prev || {}).forEach(([key, value]) => {
          if (!toRemove.has(key)) remaining[key] = value;
        });
        return remaining;
      });
      toast.success('Round deleted successfully')
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete round')
    }
  }

  async function handleUpdateSession(e, sessionData) {
    e.preventDefault()
    try {
      const { data } = await axios.patch(`${API_BASE_URL}/api/admin/sessions/${sessionData.id || sessionData._id}`, sessionData, {
        headers: {
          Authorization: `Bearer ${getTokenOrRedirect()}`
        }
      })
      const updatedSession = data.session || sessionData;
      setSessions((prev) => sortSessionsBySchedule(prev.map(s => (
        isSameSessionId(s, sessionData.id || sessionData._id)
          ? {
            ...s,
            ...updatedSession,
            id: getSessionId(updatedSession) || getSessionId(s),
            date: getSessionDateKey(updatedSession),
          }
          : s
      ))))
      toast.success('session updated successfully')
    } catch (error) {
      console.error(error);
      toast.error('Failed to update session');
    }
  }



  /* ========== LOAD FROM BACKEND ========== */

  const loadDashboard = async () => {
    const token = localStorage.getItem("sparvi_token");
    if (!token) {
      clearStoredAuth();
      navigate("/login");
      return;
    }

    try {
      setIsLoading(true);
      setLoadError("");

      const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Admin dashboard HTTP error:",
          res.status,
          text
        );

        if (res.status === 401 || res.status === 403) {
          clearStoredAuth();
          setLoadError("Your admin session expired. Please log in again.");
          toast.error("Please log in again to continue.");
          navigate("/login");
          return;
        }

        setLoadError(
          "Could not load admin data from server (dashboard API)."
        );
        return;
      }

      const data = await res.json();

      // ✅ normalize sessions: حول _id → id
      if (Array.isArray(data.sessions)) {
        const normalizedSessions = sortSessionsBySchedule(data.sessions.map((s) => ({
          ...s,
          id: getSessionId(s), // نضمن دايماً وجود id
          date: getSessionDateKey(s),
        })));
        setSessions(normalizedSessions);
      }

      // ✅ normalize enrollments: حول _id → id
      if (Array.isArray(data.enrollments)) {
        const normalizedEnrollments = data.enrollments.map((e) => ({
          ...e,
          id: getSessionId(e),   // مهم جداً عشان handlers
        }));
        setEnrollments(normalizedEnrollments);
      }

      // ✅ normalize rounds: حول _id → id
      if (Array.isArray(data.rounds)) {
        const normalizedRounds = data.rounds.map((r) => ({
          ...r,
          id: getSessionId(r),
        }));
        setRounds(normalizedRounds);
      }

      // باقي الحاجات زي ما هي
      if (Array.isArray(data.galleryItems))
        setGalleryItems(data.galleryItems);

      if (Array.isArray(data.messages)) {
        const normalizedMessages = data.messages.map((m) => ({
          ...m,
          id: m._id?.toString() || m.id,
          status: m.status || "New",
          internalNote: m.internalNote || "",
        }));
        setMessages(normalizedMessages);
      }

      if (Array.isArray(data.instructors))
        setInstructors(data.instructors);

      if (Array.isArray(data.salesAgents))
        setSalesAgents(data.salesAgents);

      if (Array.isArray(data.parents)) {
        const normalizedParents = data.parents.map((p) => ({
          ...p,
          id: getSessionId(p),
        }));
        setUsers(normalizedParents);
      }

      if (data.blockProjectsByUser && typeof data.blockProjectsByUser === "object") {
        setBlockProjectsByUser(data.blockProjectsByUser);
      } else {
        setBlockProjectsByUser({});
      }

      if (Array.isArray(data.roundRatings))
        setRoundRatings(data.roundRatings);

      if (data.studentPhotos && typeof data.studentPhotos === "object")
        setStudentPhotos(data.studentPhotos);

      // ✅ totalKids
      if (typeof data.totalKids === "number") {
        setTotalKids(data.totalKids);
      } else if (Array.isArray(data.enrollments)) {
        const unique = new Set(
          data.enrollments
            .filter((e) => e.childName)
            .map((e) => e.childName.trim())
        );
        setTotalKids(unique.size);
      }


      // total kids: from backend if موجود، وإلا نحسب من الأسماء
      if (typeof data.totalKids === "number") {
        setTotalKids(data.totalKids);
      } else if (Array.isArray(data.enrollments)) {
        const unique = new Set(
          data.enrollments
            .filter((e) => e.childName)
            .map((e) => e.childName.trim())
        );
        setTotalKids(unique.size);
      }

      // today's visitors
      if (typeof data.todayVisitors === "number") {
        setTodayVisitors(data.todayVisitors);
      }
      if (typeof data.liveVisitors === "number") {
        setLiveVisitors(data.liveVisitors);
      }
    } catch (err) {
      console.error("Admin dashboard load error:", err);
      setLoadError(
        "Error loading admin data. Please check the server or your connection."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("sparvi_token");
    const role = localStorage.getItem("sparvi_role");

    if (!token || role !== "admin") {
      navigate("/login");
      return;
    }

    loadDashboard();
  }, [navigate]);

  // polling 
  useEffect(() => {
    // Create the timer ONCE
    const intervalId = setInterval(() => {
      console.log("♻️ Polling dashboard data...");
      loadDashboard();
    }, 60000); // 60 seconds

    // Cleanup: Stop the timer if the user leaves the page
    return () => clearInterval(intervalId);
  }, []); // Empty array [] ensures this runs only once on mount


  /* ========== DERIVED STATS ========== */

  const activeSessionsCount = useMemo(
    () => sessions.filter((s) => s.sessionType !== "free" && s.status === "Active").length,
    [sessions]
  );

  const publishedPhotos = useMemo(
    () => galleryItems.filter((g) => g.status === "Published").length,
    [galleryItems]
  );

  const newMessagesCount = useMemo(
    () => messages.filter((m) => m.status === "New").length,
    [messages]
  );

  const activeRoundsCount = useMemo(
    () => rounds.filter((r) => r.status === "Active").length,
    [rounds]
  );

  const averageOccupancy = useMemo(() => {
    const capacitySessions = sessions.filter((s) => s.sessionType !== "free" && Number(s.capacity) > 0);
    if (!capacitySessions.length) return 0;
    const totalSlots = capacitySessions.reduce((sum, s) => sum + Number(s.capacity || 0), 0);
    const totalEnrolled = capacitySessions.reduce((sum, s) => sum + Number(s.enrolled || 0), 0);
    return Math.round((totalEnrolled / totalSlots) * 100);
  }, [sessions]);

  /* ========== FILTERED LISTS ========== */

  const orderedSessions = useMemo(() => sortSessionsBySchedule(sessions), [sessions]);

  const sessionCounts = useMemo(() => {
    const today = getTodayKey();
    const now = new Date();
    return orderedSessions.reduce((counts, session) => {
      const status = session.status || "Unknown";
      const freeSessionFilter = getFreeSessionFilter(session, now);
      counts.All += 1;
      counts[status] = (counts[status] || 0) + 1;
      if (freeSessionFilter) {
        counts[freeSessionFilter] = (counts[freeSessionFilter] || 0) + 1;
      }
      if (getSessionDateKey(session) === today) {
        counts.Today += 1;
      }
      return counts;
    }, { All: 0, Today: 0 });
  }, [orderedSessions]);

  const filteredSessions = useMemo(() => orderedSessions.filter((s) => {
    const q = sessionSearch.trim().toLowerCase();
    const dateKey = getSessionDateKey(s);

    const matchesSearch =
      !q ||
      (s.title || "").toLowerCase().includes(q) ||
      (s.campus || "").toLowerCase().includes(q) ||
      (s.level || "").toLowerCase().includes(q) ||
      (s.parentName || "").toLowerCase().includes(q) ||
      (s.childName || "").toLowerCase().includes(q) ||
      (s.phone || "").toLowerCase().includes(q) ||
      (s.instructorName || "").toLowerCase().includes(q) ||
      (dateKey || "").toLowerCase().includes(q) ||
      (s.time || "").toLowerCase().includes(q);

    if (sessionStatusFilter === "Today") {
      return dateKey === getTodayKey() && matchesSearch;
    }

    if (FREE_SESSION_FILTERS.includes(sessionStatusFilter)) {
      return getFreeSessionFilter(s) === sessionStatusFilter && matchesSearch;
    }

    const matchesStatus =
      sessionStatusFilter === "All" ||
      s.status === sessionStatusFilter;

    return matchesStatus && matchesSearch;
  }), [orderedSessions, sessionSearch, sessionStatusFilter]);

  const filteredEnrollments = useMemo(
    () => enrollments.filter((e) => enrollmentStatusFilter === "All" || e.status === enrollmentStatusFilter),
    [enrollments, enrollmentStatusFilter]
  );

  const filteredMessages = useMemo(
    () => messages.filter((m) => messageStatusFilter === "All" || m.status === messageStatusFilter),
    [messages, messageStatusFilter]
  );

  /* ========== ROUNDS HANDLERS ========== */

  const handleNewRoundChange = (field, value) => {
    setNewRound((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateRound = async (e, setIsCreatingRound) => {
    e.preventDefault();
    setIsCreatingRound?.(true)
    if (
      !newRound.name ||
      !newRound.campus ||
      !newRound.startDate ||
      !newRound.endDate ||
      !newRound.weeklySessionDay ||
      !newRound.weeklySessionTime
    ) {
      toast.error("Please fill start date, end date, weekly day, and session time.");
      setIsCreatingRound?.(false);
      return;
    }

    const token = getTokenOrRedirect();
    if (!token) {
      setIsCreatingRound?.(false);
      return;
    }

    const payload = { ...newRound };

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/rounds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Create round error:", res.status, text);
        let message = "Could not create round on server.";
        try {
          message = JSON.parse(text)?.message || message;
        } catch {
          message = text || message;
        }
        toast.error(message);
        return;
      }

      const data = await res.json();
      const savedRound = data.round || data;

      setRounds((prev) => [
        {
          ...savedRound,
          id: savedRound._id?.toString?.() || savedRound.id,
        },
        ...prev,
      ]);
      setNewRound({
        name: "",
        level: "Level 1",
        campus: "",
        startDate: "",
        endDate: "",
        weeklySessionDay: "saturday",
        weeklySessionTime: "",
        sessionDurationMinutes: 120,
        status: "Active",
      });
      toast.success("Round created successfully");
    } catch (err) {
      console.error("Create round error:", err);
      toast.error("Error while creating round." + err.message);
    } finally {
      setIsCreatingRound?.(false)
    }
  };

  const toggleRoundExpand = (id) => {
    setExpandedRoundId((prev) => (prev === id ? null : id));
  };

  const handleRoundStatusChange = async (id, status) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    // optimistic update
    setRounds((prev) =>
      prev.map((r) => (r.id === id || r._id === id ? { ...r, status } : r))
    );

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/rounds/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error("Update round status error:", res.status, text);
      }
    } catch (err) {
      console.error("Update round status error:", err);
    }
  };

  const getRoundStudents = (roundCode) =>
    enrollments.filter((e) => e.roundCode === roundCode);

  const getRoundRating = (roundCode) =>
    roundRatings.find((r) => r.roundCode === roundCode);

  /* ========== SESSIONS HANDLERS ========== */

  const handleSessionStatusToggle = async (id, explicitStatus) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    const session = sessions.find((s) => isSameSessionId(s, id));
    if (!session) return;
    if (session.sessionType === "free") return;

    const nextStatus =
      explicitStatus ||
      (session.status === "Active" ? "Draft" : "Active");

    // optimistic update
    setSessions((prev) => sortSessionsBySchedule(
      prev.map((s) =>
        isSameSessionId(s, id) ? { ...s, status: nextStatus } : s
      )
    ));

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/sessions/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Update session status error:",
          res.status,
          text
        );
      }
    } catch (err) {
      console.error("Update session status error:", err);
    }
  };

  /* ========== ENROLLMENTS HANDLERS ========== */

  const handleEnrollmentStatusChange = async (id, newStatus) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    // optimistic update
    setEnrollments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
    );

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/enrollments/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Update enrollment status error:",
          res.status,
          text
        );
      }
    } catch (err) {
      console.error("Update enrollment status error:", err);
    }
  };

  const handleEnrollmentNoteChange = async (id, note) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    // optimistic update
    setEnrollments((prev) =>
      prev.map((e) => (e.id === id ? { ...e, note } : e))
    );

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/enrollments/${id}/note`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ note }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Update enrollment note error:",
          res.status,
          text
        );
      }
    } catch (err) {
      console.error("Update enrollment note error:", err);
    }
  };

  /* ========== MESSAGES HANDLERS ========== */

  const handleMessageStatusChange = async (id, newStatus) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    // optimistic update
    setMessages((prev) =>
      prev.map((m) =>
        (m.id === id || m._id === id) ? { ...m, status: newStatus } : m
      )
    );

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/messages/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Update message status error:",
          res.status,
          text
        );
      }
    } catch (err) {
      console.error("Update message status error:", err);
    }
  };

  const handleMessageNoteChange = async (id, internalNote) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    // optimistic update
    setMessages((prev) =>
      prev.map((m) =>
        (m.id === id || m._id === id) ? { ...m, internalNote } : m
      )
    );

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/messages/${id}/note`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ internalNote }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Update message note error:",
          res.status,
          text
        );
      }
    } catch (err) {
      console.error("Update message note error:", err);
    }
  };

  /* ========== GALLERY HANDLERS ========== */

  const handleGalleryPublishToggle = async (id) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    const item = galleryItems.find((g) => g.id === id);
    if (!item) return;

    const newStatus =
      item.status === "Published" ? "Draft" : "Published";

    // optimistic update
    setGalleryItems((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, status: newStatus } : g
      )
    );

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/gallery/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Update gallery status error:",
          res.status,
          text
        );
      }
    } catch (err) {
      console.error("Update gallery status error:", err);
    }
  };

  const handleGalleryFeaturedToggle = async (id) => {
    const token = getTokenOrRedirect();
    if (!token) return;

    const item = galleryItems.find((g) => g.id === id);
    if (!item) return;

    const newFeatured = !item.featured;

    // optimistic update
    setGalleryItems((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, featured: newFeatured } : g
      )
    );

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/gallery/${id}/featured`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ featured: newFeatured }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Update gallery featured error:",
          res.status,
          text
        );
      }
    } catch (err) {
      console.error("Update gallery featured error:", err);
    }
  };

  const handleAddGalleryItem = async (e) => {
    e.preventDefault();
    if (!newGalleryTitle || !newGalleryFile) return;
    const token = getTokenOrRedirect();
    if (!token) return;

    const formData = new FormData();
    formData.append("title", newGalleryTitle);
    formData.append("image", newGalleryFile);

    try {
      setIsSendingGalleryImage(true)
      const res = await fetch(`${API_BASE_URL}/api/admin/gallery`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Add gallery error:", res.status, text);
        alert("Could not upload gallery photo.");
        return;
      }

      const data = await res.json();
      const newItem = data.galleryItem || data;

      setGalleryItems((prev) => [newItem, ...prev]);
      setNewGalleryTitle("");
      setNewGalleryFile(null);
      e.target.reset();
    } catch (err) {
      console.error("Add gallery error:", err);
      alert("Error while uploading gallery photo.");
    } finally {
      setIsSendingGalleryImage(false)
    }
  };

  /* ========== STUDENT PHOTOS HANDLERS ========== */

  const handleAddStudentPhotos = async (enrollmentId, files) => {
    if (!files || !files.length) return;

    const token = getTokenOrRedirect();
    if (!token) return;

    const newFiles = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name,
    }));

    // optimistic UI update
    setStudentPhotos((prev) => ({
      ...prev,
      [enrollmentId]: [
        ...(prev[enrollmentId] || []),
        ...newFiles,
      ],
    }));

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("photos", file);
    });

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/enrollments/${enrollmentId}/photos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Upload student photos error:",
          res.status,
          text
        );
      }
    } catch (err) {
      console.error("Upload student photos error:", err);
    }
  };

  /* ========== RETURN API ========== */

  return {
    // meta
    isLoading,
    loadError,

    // stats
    totalKids,
    todayVisitors,
    liveVisitors,
    activeSessionsCount,
    activeRoundsCount,
    publishedPhotos,
    averageOccupancy,
    newMessagesCount,

    // sessions
    sessions: orderedSessions,
    setSessions,
    filteredSessions,
    sessionCounts,
    sessionSearch,
    setSessionSearch,
    sessionStatusFilter,
    setSessionStatusFilter,
    handleSessionStatusToggle,
    handleUpdateSession,
    // enrollments
    enrollments,
    filteredEnrollments,
    enrollmentStatusFilter,
    setEnrollmentStatusFilter,
    handleEnrollmentStatusChange,
    handleEnrollmentNoteChange,

    // gallery
    galleryItems,
    newGalleryTitle,
    setNewGalleryTitle,
    newGalleryFile,
    setNewGalleryFile,
    handleAddGalleryItem,
    handleGalleryPublishToggle,
    handleGalleryFeaturedToggle,

    // messages
    messages,
    filteredMessages,
    messageStatusFilter,
    setMessageStatusFilter,
    handleMessageStatusChange,
    handleMessageNoteChange,

    // instructors
    instructors,
    newInstructor,
    isCreatingInstructor,
    instructorCampusDrafts,
    salesAgents,
    newSalesAgent,
    isCreatingSalesAgent,
    handleNewInstructorChange,
    handleCreateInstructor,
    handleInstructorCampusChange,
    handleUpdateInstructorCampus,
    handleDeleteInstructor,
    handleNewSalesAgentChange,
    handleCreateSalesAgent,
    handleDeleteSalesAgent,

    // users
    users,
    userSearch,
    setUserSearch,
    handleDeleteParent,
    blockProjectsByUser,

    // rounds
    rounds,
    roundRatings,
    newRound,
    handleNewRoundChange,
    handleCreateRound,
    expandedRoundId,
    toggleRoundExpand,
    handleRoundStatusChange,
    getRoundStudents,
    getRoundRating,
    handleDeleteRound,

    // photos
    studentPhotos,
    handleAddStudentPhotos,

    // sessions
    deleteSessions,

    // loadings
    isSendingGalleryImage
  };
};
