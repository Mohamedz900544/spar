import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles,
  Loader2
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const RoundDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [round, setRound] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [sessions, setSessions] = useState([]);

  // Fetch round details
  useEffect(() => {
    const fetchRound = async () => {
      try {
        const token = localStorage.getItem("sparvi_token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/admin/rounds/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch round details");
        }

        const data = await res.json();
        setRound(data);
        // Initialize sessions from round data or empty array
        setSessions(data.sessions || []);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRound();
  }, [id, navigate]);

  // Handle saving changes
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("sparvi_token");
      const res = await fetch(`${API_BASE_URL}/api/admin/rounds/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...round, sessions }),
      });

      if (!res.ok) throw new Error("Failed to update round");
      
      const updatedRound = await res.json();
      setRound(updatedRound);
      setSessions(updatedRound.sessions || []);
      alert("Sessions updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving changes");
    } finally {
      setSaving(false);
    }
  };

  // Auto-fill dates logic
  const handleAutoFill = () => {
    if (!round.startDate) {
      alert("Start date is missing for this round.");
      return;
    }

    const count = round.sessionsCount || 6;
    const weeks = round.weeksPerSession || 1;
    const start = new Date(round.startDate);
    
    // Check if start date is valid
    if (isNaN(start.getTime())) {
        alert("Invalid Start Date.");
        return;
    }

    const newSessions = [];
    for (let i = 0; i < count; i++) {
      const dateObj = new Date(start);
      dateObj.setDate(start.getDate() + (i * weeks * 7));
      
      // Format as YYYY-MM-DD
      const dateStr = dateObj.toISOString().split('T')[0];
      
      newSessions.push({
        title: `Session ${i + 1}`,
        date: dateStr,
        time: "10:00", // Default start time
        endTime: "12:00" // Default end time
      });
    }
    setSessions(newSessions);
  };

  const handleAddSession = () => {
    setSessions([
      ...sessions,
      {
        title: `Session ${sessions.length + 1}`,
        date: "",
        time: "",
        endTime: ""
      }
    ]);
  };

  const handleRemoveSession = (index) => {
    const newSessions = [...sessions];
    newSessions.splice(index, 1);
    setSessions(newSessions);
  };

  const handleSessionChange = (index, field, value) => {
    const newSessions = [...sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    setSessions(newSessions);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7ff]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f7ff]">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!round) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7ff] via-[#e8f3ff] to-[#ffffff] flex flex-col">
      {/* Header */}
      <header className="bg-[#102a5a] text-white px-5 md:px-8 py-3 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin')} 
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg md:text-xl font-bold leading-tight">
              {round.name}
            </h1>
            <p className="text-[11px] text-blue-100 opacity-90">
              {round.code} · {round.level}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#fbbf24] text-slate-900 rounded-full text-xs font-bold hover:bg-[#f59e0b] transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Save Changes
        </button>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm flex flex-wrap gap-6 items-center text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#102a5a]" />
            <span className="font-medium">Campus:</span> {round.campus}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#102a5a]" />
            <span className="font-medium">Dates:</span> 
            {new Date(round.startDate).toLocaleDateString()} — {new Date(round.endDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#102a5a]" />
            <span className="font-medium">Sessions:</span> {round.sessionsCount} ({round.weeksPerSession} wk/sess)
          </div>
          <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            round.status === "Active" ? "bg-green-100 text-green-700" :
            round.status === "Planned" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
          }`}>
            {round.status}
          </div>
        </div>

        {/* Sessions Editor */}
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5e7eb] flex justify-between items-center bg-slate-50">
            <h2 className="text-base font-bold text-slate-800">Manage Sessions</h2>
            <div className="flex gap-2">
              <button 
                onClick={handleAutoFill}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#102a5a] border border-blue-100 rounded-lg text-xs font-semibold hover:bg-blue-100 transition-colors"
                title="Generate dates based on Start Date and Weeks/Session"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Auto-fill Dates
              </button>
              <button 
                onClick={handleAddSession}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Session
              </button>
            </div>
          </div>

          <div className="p-5 space-y-3">
            {sessions.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No sessions defined yet. Click "Auto-fill Dates" or "Add Session".
              </div>
            )}
            
            {sessions.map((session, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-3 items-start md:items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-blue-200 transition-colors">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold shrink-0">
                  {idx + 1}
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3 w-full">
                  <div className="md:col-span-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 block">Title</label>
                    <input
                      type="text"
                      value={session.title || ""}
                      onChange={(e) => handleSessionChange(idx, "title", e.target.value)}
                      className="w-full text-sm font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="Session Title"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 block">Date</label>
                    <input
                      type="date"
                      value={session.date ? session.date.split('T')[0] : ""}
                      onChange={(e) => handleSessionChange(idx, "date", e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 block">Start Time</label>
                    <input
                      type="time"
                      value={session.time || ""}
                      onChange={(e) => handleSessionChange(idx, "time", e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-0.5 block">End Time</label>
                    <input
                      type="time"
                      value={session.endTime || ""}
                      onChange={(e) => handleSessionChange(idx, "endTime", e.target.value)}
                      className="w-full text-sm bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-blue-400 outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => handleRemoveSession(idx)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mt-2 md:mt-0"
                  title="Remove Session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoundDetailsPage;
