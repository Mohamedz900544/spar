import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LEAD_STATUSES } from "../salesHelpers";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useSalesDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [stats, setStats] = useState({});
  const [noteDrafts, setNoteDrafts] = useState({});
  const [paymentDrafts, setPaymentDrafts] = useState({});
  const [isCreatingLead, setIsCreatingLead] = useState(false);

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("sparvi_token");
    const role = localStorage.getItem("sparvi_role");
    if (!token || !["agent", "admin"].includes(role || "")) {
      navigate("/login");
      return null;
    }
    return token;
  }, [navigate]);

  const hydratePaymentDrafts = useCallback((items) => {
    const next = {};
    for (const lead of items) {
      const leadId = lead.id || lead._id;
      next[leadId] = lead.paymentLink || "";
    }
    setPaymentDrafts(next);
  }, []);

  const fetchDashboard = useCallback(async () => {
    const token = checkAuth();
    if (!token) return;

    try {
      setIsRefreshing(true);
      const res = await fetch(`${API_BASE_URL}/api/sales/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load sales dashboard");
      }

      setLeads(data.leads || []);
      setInstructors(data.instructors || []);
      setStats(data.stats || {});
      hydratePaymentDrafts(data.leads || []);
      setError("");
    } catch (err) {
      console.error("Sales dashboard load error:", err);
      setError(err.message || "Failed to load sales dashboard");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [checkAuth, hydratePaymentDrafts]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const groupedLeads = useMemo(
    () =>
      LEAD_STATUSES.reduce((acc, status) => {
        acc[status] = leads.filter((lead) => (lead.status || "New") === status);
        return acc;
      }, {}),
    [leads]
  );

  const upsertLead = (updatedLead) => {
    const updatedId = updatedLead.id || updatedLead._id;
    setLeads((prev) =>
      prev.map((lead) => {
        const leadId = lead.id || lead._id;
        return leadId === updatedId ? updatedLead : lead;
      })
    );
    setPaymentDrafts((prev) => ({
      ...prev,
      [updatedId]: updatedLead.paymentLink || "",
    }));
  };

  const createLead = async (payload) => {
    const token = checkAuth();
    if (!token) return null;

    if (!payload?.parentName?.trim() || !payload?.childName?.trim() || !payload?.phone?.trim()) {
      toast.error("Parent name, child name, and phone are required.");
      return null;
    }

    try {
      setIsCreatingLead(true);
      const res = await fetch(`${API_BASE_URL}/api/sales/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payload,
          childAge: payload.childAge ? Number(payload.childAge) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create lead");
      }

      setLeads((prev) => [data, ...prev]);
      setPaymentDrafts((prev) => ({ ...prev, [data.id || data._id]: data.paymentLink || "" }));
      toast.success("Lead added successfully");
      fetchDashboard();
      return data;
    } catch (err) {
      console.error("Create lead error:", err);
      toast.error(err.message || "Failed to create lead");
      return null;
    } finally {
      setIsCreatingLead(false);
    }
  };

  const updateLeadStatus = async (lead, status) => {
    const token = checkAuth();
    if (!token) return;

    let lostReason = "";
    if (status === "Closed - Lost") {
      const reason = window.prompt(
        "Please enter the reason for closing this lead as lost:",
        lead.lostReason || ""
      );
      if (!reason || !reason.trim()) {
        toast.error("Lost reason is required.");
        return;
      }
      lostReason = reason.trim();
    }

    try {
      const leadId = lead.id || lead._id;
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, lostReason }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      upsertLead(data);
      toast.success("Lead status updated");
      fetchDashboard();
    } catch (err) {
      console.error("Update lead status error:", err);
      toast.error(err.message || "Failed to update status");
    }
  };

  const addLeadNote = async (lead, noteText) => {
    const token = checkAuth();
    if (!token) return;

    const leadId = lead.id || lead._id;
    if (!noteText?.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${leadId}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: noteText }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save note");
      }

      upsertLead(data);
      setNoteDrafts((prev) => ({ ...prev, [leadId]: "" }));
      toast.success("Note saved");
    } catch (err) {
      console.error("Add lead note error:", err);
      toast.error(err.message || "Failed to save note");
    }
  };

  const savePaymentLink = async (lead, paymentLink) => {
    const token = checkAuth();
    if (!token) return;

    const leadId = lead.id || lead._id;

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${leadId}/payment-link`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentLink: paymentLink || "" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update payment link");
      }

      upsertLead(data);
      toast.success("Payment link updated");
    } catch (err) {
      console.error("Update payment link error:", err);
      toast.error(err.message || "Failed to update payment link");
    }
  };

  const assignFreeSession = async ({ leadId, instructorId, scheduledAt }) => {
    const token = checkAuth();
    if (!token) return null;
    if (!leadId || !instructorId || !scheduledAt) {
      toast.error("Please choose instructor and date/time.");
      return null;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${leadId}/free-session`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instructorId,
          scheduledAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to assign free session");
      }

      upsertLead(data);
      toast.success("Free session assigned");
      fetchDashboard();
      return data;
    } catch (err) {
      console.error("Assign free session error:", err);
      toast.error(err.message || "Failed to assign free session");
      return null;
    }
  };

  const copyPaymentLink = async (link) => {
    if (!link?.trim()) {
      toast.error("No payment link to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(link.trim());
      toast.success("Payment link copied");
    } catch {
      toast.error("Unable to copy payment link");
    }
  };

  const logout = () => {
    localStorage.removeItem("sparvi_token");
    localStorage.removeItem("sparvi_role");
    localStorage.removeItem("sparvi_user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return {
    isLoading,
    isRefreshing,
    isCreatingLead,
    error,
    leads,
    instructors,
    stats,
    noteDrafts,
    paymentDrafts,
    groupedLeads,
    setNoteDrafts,
    setPaymentDrafts,
    fetchDashboard,
    createLead,
    updateLeadStatus,
    addLeadNote,
    savePaymentLink,
    assignFreeSession,
    copyPaymentLink,
    logout,
  };
};
