// src/pages/admin/hooks/useAdminDashboard.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast'
import axios from "axios";
import { getTokenOrRedirect } from "../../../helpers/helpers.js";
/* ========= API BASE ========= */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
//     status: "Pending Call",
//     note: "",
//     roundCode: "SPRV-202",
//   },
// ];

const generateRoundCode = () => {
  const random = Math.floor(100 + Math.random() * 900); // 3 digits
  return `SPRV-${random}`;
};

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
  const [sessionStatusFilter, setSessionStatusFilter] = useState("All");

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

  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");

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
    sessionsCount: 6,
    weeksPerSession: 1,
    code: generateRoundCode(),
    sessions: [],
    status: "Active",
  });

  // photos per enrollment
  const [studentPhotos, setStudentPhotos] = useState([]);

  // stats
  const [totalKids, setTotalKids] = useState(0);

  const [isSendingGalleryImage, setIsSendingGalleryImage] = useState(false)

  // ====================== HELPERS ======================



  const regenerateRoundCode = () => {
    setNewRound((prev) => ({
      ...prev,
      code: generateRoundCode(),
    }));
  };

  const regenerateSessions = (evenSessionsTime, oddSessionsTime) => {
    if (!newRound.startDate) {
      alert("Please select a Start Date first.");
      return;
    }

    const count = newRound.sessionsCount || 6;

    const startEvenObj = new Date(evenSessionsTime);
    const startOddObj = new Date(oddSessionsTime);

    const evenTimeStr = startEvenObj.toTimeString().slice(0, 5);
    const oddTimeStr = startOddObj.toTimeString().slice(0, 5);

    const newSessions = [];
    let additionE = 0;
    let additionO = 0;

    for (let i = 0; i < count; i++) {
      const isEven = i % 2 === 0;

      const currentDate = new Date(isEven ? startEvenObj : startOddObj);

      const weeksToAdd = isEven ? additionE : additionO;
      currentDate.setDate(currentDate.getDate() + (weeksToAdd * 7));

      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const timeStr = isEven ? evenTimeStr : oddTimeStr;

      if (isEven) additionE++;
      else additionO++;

      newSessions.push({
        title: `Session ${i + 1}`,
        date: dateStr,
        time: timeStr,
      });
    }

    setNewRound(prev => ({ ...prev, sessions: newSessions }));
  };

  const handleRoundSessionChange = (index, field, value) => {
    console.log(field, value)
    setNewRound(prev => {
      const updatedSessions = [...prev.sessions];
      updatedSessions[index] = {
        ...updatedSessions[index],
        [field]: value
      };
      return { ...prev, sessions: updatedSessions };
    });
  };

  const handleNewInstructorChange = (field, value) => {
    setNewInstructor((prev) => ({
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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create instructor");
      }

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
  // ***********************

  async function deleteSessions(id) {
    try {
      console.log(id)
      await axios.delete(`${API_BASE_URL}/api/admin/sessions/${id}`, {
        headers: {
          Authorization: `Bearer ${getTokenOrRedirect()}`
        }
      })
      setSessions(prevSessions => prevSessions.filter(s => s.id !== id || s._id !== id))
      toast.success('Session deleted successfully')
    } catch (error) {
      console.log(error.response.data.message)
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
      setSessions((prev) => prev.map(s => {
        if (s.id === sessionData.id || s.id === sessionData._id) {
          console.log('updating the sessionData', { s }, { sessionData })
          return { ...s, ...sessionData }
        }
        return s
      }))
      toast.success('session updated successfully')
      console.log(data.session)
    } catch (error) {
      console.error(error);
      toast.error('Failed to update session');
    }
  }



  /* ========== LOAD FROM BACKEND ========== */

  const loadDashboard = async () => {
    const token = localStorage.getItem("sparvi_token");
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
        setLoadError(
          "Could not load admin data from server (dashboard API)."
        );
        return;
      }

      const data = await res.json();

      // ✅ normalize sessions: حول _id → id
      if (Array.isArray(data.sessions)) {
        const normalizedSessions = data.sessions.map((s) => ({
          ...s,
          id: s._id?.toString() || s.id, // نضمن دايماً وجود id
        }));
        setSessions(normalizedSessions);
      }

      // ✅ normalize enrollments: حول _id → id
      if (Array.isArray(data.enrollments)) {
        const normalizedEnrollments = data.enrollments.map((e) => ({
          ...e,
          id: e._id?.toString() || e.id,   // مهم جداً عشان handlers
        }));
        setEnrollments(normalizedEnrollments);
      }

      // ✅ normalize rounds: حول _id → id
      if (Array.isArray(data.rounds)) {
        const normalizedRounds = data.rounds.map((r) => ({
          ...r,
          id: r._id?.toString() || r.id,
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

      if (Array.isArray(data.parents)) {
        const normalizedParents = data.parents.map((p) => ({
          ...p,
          id: p._id?.toString() || p.id,
        }));
        setUsers(normalizedParents);
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

  const activeSessionsCount = sessions.filter(
    (s) => s.status === "Active"
  ).length;

  const publishedPhotos = galleryItems.filter(
    (g) => g.status === "Published"
  ).length;

  const newMessagesCount = messages.filter(
    (m) => m.status === "New"
  ).length;

  const activeRoundsCount = rounds.filter(
    (r) => r.status === "Active"
  ).length;

  const averageOccupancy = (() => {
    if (!sessions.length) return 0;
    const totalSlots = sessions.reduce(
      (sum, s) => sum + s.capacity,
      0
    );
    const totalEnrolled = sessions.reduce(
      (sum, s) => sum + s.enrolled,
      0
    );
    return Math.round((totalEnrolled / totalSlots) * 100);
  })();

  /* ========== FILTERED LISTS ========== */

  const filteredSessions = sessions.filter((s) => {
    const q = sessionSearch.toLowerCase();

    const matchesSearch =
      !q ||
      s.title.toLowerCase().includes(q) ||
      s.campus.toLowerCase().includes(q) ||
      s.level.toLowerCase().includes(q);

    if (sessionStatusFilter === 'Today') {
      const today = new Date().toLocaleDateString('en-CA');
      return (s.date === today) && matchesSearch;
    }


    const matchesStatus =
      sessionStatusFilter === "All" ||
      s.status === sessionStatusFilter;

    return matchesStatus && matchesSearch;
  });

  const filteredEnrollments = enrollments.filter((e) => {
    if (enrollmentStatusFilter === "All") return true;
    return e.status === enrollmentStatusFilter;
  });

  const filteredMessages = messages.filter((m) => {
    if (messageStatusFilter === "All") return true;
    return m.status === messageStatusFilter;
  });

  /* ========== ROUNDS HANDLERS ========== */

  const handleNewRoundChange = (field, value) => {
    setNewRound((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateRound = async (e, setIsCreatingRound) => {
    e.preventDefault();
    setIsCreatingRound(true)
    if (
      !newRound.name ||
      !newRound.campus ||
      !newRound.startDate ||
      !newRound.endDate
    )
      return;

    const token = getTokenOrRedirect();
    if (!token) return;

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
        if (res.status == 400) {
          toast.error(res.message)
          return
        }
        toast.error("Could not create round on server.");
        return;
      }

      const data = await res.json();
      const savedRound = data.round || data;

      setRounds((prev) => [savedRound, ...prev]);
      setNewRound({
        name: "",
        level: "Level 1",
        campus: "",
        startDate: "",
        endDate: "",
        sessionsCount: 6,
        weeksPerSession: 1,
        // code: generateRoundCode(),
        status: "Active",
      });
    } catch (err) {
      console.error("Create round error:", err);
      toast.error("Error while creating round." + err.message);
    } finally {
      setIsCreatingRound(false)
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
      prev.map((r) => (r.id === id ? { ...r, status } : r))
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

    const session = sessions.find((s) => s.id === id);
    if (!session) return;

    const nextStatus =
      explicitStatus ||
      (session.status === "Active" ? "Draft" : "Active");

    // optimistic update
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: nextStatus } : s
      )
    );

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
    activeSessionsCount,
    activeRoundsCount,
    publishedPhotos,
    averageOccupancy,
    newMessagesCount,

    // sessions
    sessions,
    setSessions,
    filteredSessions,
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
    handleNewInstructorChange,
    handleCreateInstructor,
    handleInstructorCampusChange,
    handleUpdateInstructorCampus,

    // users
    users,
    userSearch,
    setUserSearch,

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
    regenerateRoundCode,
    regenerateSessions,
    handleRoundSessionChange,
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
