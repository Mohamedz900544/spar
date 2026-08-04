import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LEAD_STATUSES, normalizeLeadStatus, parseDashboardDateTimeInput } from "../salesHelpers";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const summarizeNotificationChannels = (notificationResult = {}) => {
  const channels = [];
  if (notificationResult.whatsappSent || notificationResult.whatsapp?.sent) {
    channels.push("WhatsApp");
  }
  if (notificationResult.emailSent || notificationResult.email?.sent) {
    channels.push("email");
  }
  return channels.join(" + ") || "notification";
};

const getNotificationFailure = (notificationResult = {}) =>
  notificationResult.whatsapp?.error ||
  notificationResult.whatsapp?.reason ||
  notificationResult.assignment?.error ||
  notificationResult.assignment?.reason ||
  notificationResult.welcome?.error ||
  notificationResult.welcome?.reason ||
  notificationResult.reminder?.error ||
  notificationResult.reminder?.reason ||
  notificationResult.email?.error ||
  notificationResult.email?.reason ||
  notificationResult.error ||
  "Notification was not delivered";

export const useSalesDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [leads, setLeads] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [freeSessionDurationMinutes, setFreeSessionDurationMinutes] = useState(60);
  const [stats, setStats] = useState({});
  const [noteDrafts, setNoteDrafts] = useState({});
  const [paymentDrafts, setPaymentDrafts] = useState({});
  const [isCreatingLead, setIsCreatingLead] = useState(false);
  const [isSendingWhatsAppTest, setIsSendingWhatsAppTest] = useState(false);
  const [sendingWhatsAppAutomationTests, setSendingWhatsAppAutomationTests] =
    useState({});
  const [isSendingEmailTest, setIsSendingEmailTest] = useState(false);
  const [lostReasonPrompt, setLostReasonPrompt] = useState(null);

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
      setFreeSessionDurationMinutes(Number(data.freeSessionDurationMinutes) || 60);
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
        acc[status] = leads.filter((lead) => normalizeLeadStatus(lead.status) === status);
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

  const updateLeadStatus = async (lead, status, options = {}) => {
    const token = checkAuth();
    if (!token) return;

    let lostReason = options.lostReason || "";
    let callLaterAt = options.callLaterAt || "";
    if (status === "Closed - Lost") {
      if (!lostReason.trim()) {
        setLostReasonPrompt({
          lead,
          initialReason: lead.lostReason || "",
        });
        return;
      }
      lostReason = lostReason.trim();
    }

    if ((status === "Reserved Later" || status === "Busy Call Later") && !callLaterAt) {
      const scheduledAt = window.prompt(
        "Enter the reminder date/time (dd/mm/yyyy HH:mm):",
        ""
      );
      if (!scheduledAt || !scheduledAt.trim()) {
        toast.error("Reminder time is required.");
        return;
      }
      callLaterAt = parseDashboardDateTimeInput(scheduledAt.trim());
      if (!callLaterAt) {
        toast.error("Please use dd/mm/yyyy HH:mm.");
        return;
      }
    }

    try {
      const leadId = lead.id || lead._id;
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${leadId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, lostReason, callLaterAt }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      upsertLead(data);

      if (status === "Follow-up" && data?.notificationResult) {
        if (data.notificationResult.sent) {
          const channels = summarizeNotificationChannels(data.notificationResult);
          toast.success(`Lead moved to Follow-up + sales notified via ${channels}`);
        } else {
          const details = getNotificationFailure(data.notificationResult);
          toast.error(`Status updated, but notification failed: ${details}`);
        }
      } else {
        toast.success("Lead status updated");
      }

      fetchDashboard();
    } catch (err) {
      console.error("Update lead status error:", err);
      toast.error(err.message || "Failed to update status");
    }
  };

  const closeLostReasonPrompt = () => {
    setLostReasonPrompt(null);
  };

  const submitLostReason = async (reason) => {
    const prompt = lostReasonPrompt;
    if (!prompt?.lead) return;

    const trimmedReason = `${reason || ""}`.trim();
    if (!trimmedReason) {
      toast.error("Lost reason is required.");
      return;
    }

    setLostReasonPrompt(null);
    await updateLeadStatus(prompt.lead, "Closed - Lost", {
      lostReason: trimmedReason,
    });
  };

  const scheduleBusyCallLater = async (lead, callLaterAt, status = "Busy Call Later") => {
    const token = checkAuth();
    if (!token) return null;

    const leadId = lead.id || lead._id;
    if (!callLaterAt) {
      toast.error("Please choose the call time.");
      return null;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${leadId}/call-later`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ callLaterAt, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to schedule call reminder");
      }

      upsertLead(data);
      toast.success(`${status} reminder scheduled for sales`);
      fetchDashboard();
      return data;
    } catch (err) {
      console.error("Schedule call later error:", err);
      toast.error(err.message || "Failed to schedule call reminder");
      return null;
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
      const target = data?.whatsappNotificationTarget;
      const targetContact =
        target?.instructorPhoneRaw ||
        target?.instructorPhoneNormalized ||
        target?.instructorEmail ||
        "";
      const targetLabel =
        target?.instructorName || targetContact
          ? ` (${target?.instructorName || "Instructor"}${targetContact ? ` - ${targetContact}` : ""})`
          : "";
      if (data?.notificationResult?.sent) {
        const channels = summarizeNotificationChannels(data.notificationResult);
        toast.success(`Free session assigned + instructor notified via ${channels}${targetLabel}`);
      } else {
        const details = getNotificationFailure(data?.notificationResult);
        toast.error(`Assigned${targetLabel}, but notification failed: ${details}`);
      }
      if (data?.parentNotificationResult) {
        const parentTarget = data?.parentNotificationTarget;
        const parentContact =
          parentTarget?.parentPhoneRaw ||
          parentTarget?.parentPhoneNormalized ||
          "";
        const parentLabel =
          parentTarget?.parentName || parentContact
            ? ` (${parentTarget?.parentName || "Parent"}${parentContact ? ` - ${parentContact}` : ""})`
            : "";
        if (data.parentNotificationResult.sent) {
          toast.success(`Parent notified on WhatsApp${parentLabel}`);
        } else {
          const details = getNotificationFailure(data.parentNotificationResult);
          toast.error(`Assigned, but parent WhatsApp failed: ${details}`);
        }
      }
      fetchDashboard();
      return data;
    } catch (err) {
      console.error("Assign free session error:", err);
      toast.error(err.message || "Failed to assign free session");
      return null;
    }
  };

  const clearFreeSession = async (leadId, options = {}) => {
    const token = checkAuth();
    if (!token) return null;
    if (!leadId) {
      toast.error("Missing lead id.");
      return null;
    }

    try {
      const query = options.removeRequest ? "?removeRequest=true" : "";
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${leadId}/free-session${query}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to clear free session");
      }

      upsertLead(data);
      toast.success(options.removeRequest ? "Free session request deleted" : "Free session assignment removed");
      fetchDashboard();
      return data;
    } catch (err) {
      console.error("Clear free session error:", err);
      toast.error(err.message || "Failed to clear free session");
      return null;
    }
  };

  const sendWhatsAppTest = async () => {
    const token = checkAuth();
    if (!token) return false;

    try {
      setIsSendingWhatsAppTest(true);
      const res = await fetch(`${API_BASE_URL}/api/sales/whatsapp/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: "01007775705",
        }),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          "API returned invalid response. Check VITE_API_BASE_URL and backend server."
        );
      }
      if (!res.ok) {
        throw new Error(data.message || "Failed to send WhatsApp test");
      }

      toast.success(data.message || "WhatsApp test sent");
      return true;
    } catch (err) {
      console.error("Send WhatsApp test error:", err);
      toast.error(err.message || "Failed to send WhatsApp test");
      return false;
    } finally {
      setIsSendingWhatsAppTest(false);
    }
  };

  const sendWhatsAppAutomationTest = async (type, label = "WhatsApp automation") => {
    const token = checkAuth();
    if (!token || !type) return false;

    try {
      setSendingWhatsAppAutomationTests((prev) => ({
        ...prev,
        [type]: true,
      }));
      const res = await fetch(`${API_BASE_URL}/api/sales/whatsapp/automation-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          phone: "01007775705",
        }),
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          "API returned invalid response. Check VITE_API_BASE_URL and backend server."
        );
      }
      if (!res.ok) {
        const details =
          data?.details?.error ||
          data?.details?.reason ||
          data?.message ||
          "Failed to send WhatsApp automation test";
        throw new Error(details);
      }

      toast.success(data.message || `${label} test sent`);
      return true;
    } catch (err) {
      console.error("Send WhatsApp automation test error:", err);
      toast.error(err.message || `Failed to send ${label} test`);
      return false;
    } finally {
      setSendingWhatsAppAutomationTests((prev) => ({
        ...prev,
        [type]: false,
      }));
    }
  };

  const sendEmailTest = async () => {
    const token = checkAuth();
    if (!token) return false;

    try {
      setIsSendingEmailTest(true);
      const res = await fetch(`${API_BASE_URL}/api/sales/email/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const raw = await res.text();
      let data = {};
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          "API returned invalid response. Check VITE_API_BASE_URL and backend server."
        );
      }

      if (!res.ok) {
        const details = data?.details?.error || data?.details?.reason || "";
        throw new Error(details || data.message || "Failed to send email test");
      }

      toast.success(data.message || "Email test sent");
      return true;
    } catch (err) {
      console.error("Send email test error:", err);
      toast.error(err.message || "Failed to send email test");
      return false;
    } finally {
      setIsSendingEmailTest(false);
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
    isSendingWhatsAppTest,
    sendingWhatsAppAutomationTests,
    isSendingEmailTest,
    lostReasonPrompt,
    error,
    leads,
    instructors,
    freeSessionDurationMinutes,
    stats,
    noteDrafts,
    paymentDrafts,
    groupedLeads,
    setNoteDrafts,
    setPaymentDrafts,
    fetchDashboard,
    createLead,
    updateLeadStatus,
    closeLostReasonPrompt,
    submitLostReason,
    scheduleBusyCallLater,
    addLeadNote,
    savePaymentLink,
    assignFreeSession,
    clearFreeSession,
    sendWhatsAppTest,
    sendWhatsAppAutomationTest,
    sendEmailTest,
    copyPaymentLink,
    logout,
  };
};
