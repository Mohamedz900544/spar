// src/pages/AdminDashboard.jsx
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import {
  Users,
  CalendarClock,
  Image as ImageIcon,
  Inbox,
  Settings,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
  Star,
} from "lucide-react";

import { useAdminDashboard } from "./hooks/useAdminDashboard";
import UpdateSessionForm from "./components/UpdateSessionForm";

import Tabs from "./components/Tabs";
import OverviewTab from "./components/Tabs/OverviewTab";
import { RoundsTab } from "./components/Tabs/RoundsTab";
import { SessionsTab } from "./components/Tabs/SessionsTab";
import { EnrollmentsTab } from "./components/Tabs/EnrollmentsTab";
import { UsersTab } from "./components/Tabs/UsersTab";

function generateRoundCode() {
  return `SPRV-${Math.floor(Math.random() * 1000)}-${Date.now()}`
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isCreatingRound, setIsCreatingRound] = useState(false)
  const [evenSessionDateAndTime, setEvenSessionDateAndTime] = useState(null)
  const [oddSessionDateAndTime, setOddSessionDateAndTime] = useState(null)
  const MotionContainer = motion.div
  const [messageNoteDrafts, setMessageNoteDrafts] = useState({})
  const {
    loadError,
    totalKids,
    activeSessionsCount,
    activeRoundsCount,
    publishedPhotos,
    averageOccupancy,
    newMessagesCount,
    sessions,
    filteredSessions,
    sessionSearch,
    setSessionSearch,
    sessionStatusFilter,
    setSessionStatusFilter,
    handleSessionStatusToggle,
    enrollments,
    filteredEnrollments,
    enrollmentStatusFilter,
    setEnrollmentStatusFilter,
    handleEnrollmentStatusChange,
    handleEnrollmentNoteChange,
    messages,
    filteredMessages,
    messageStatusFilter,
    setMessageStatusFilter,
    handleMessageStatusChange,
    handleMessageNoteChange,
    instructors,
    newInstructor,
    isCreatingInstructor,
    instructorCampusDrafts,
    handleNewInstructorChange,
    handleCreateInstructor,
    handleInstructorCampusChange,
    handleUpdateInstructorCampus,
    users,
    userSearch,
    setUserSearch,
    rounds,
    newRound,
    handleNewRoundChange,
    handleCreateRound,
    expandedRoundId,
    toggleRoundExpand,
    handleRoundStatusChange,
    getRoundStudents,
    getRoundRating,
    regenerateSessions,
    handleRoundSessionChange,
    handleDeleteRound,
    studentPhotos,
    handleAddStudentPhotos,
    deleteSessions,
    handleUpdateSession,
  } = useAdminDashboard();

  const [openForm, setOpenForm] = useState(false)
  const [sessionToUpdate, setSessionToUpdate] = useState({})
  const [expandedInstructorId, setExpandedInstructorId] = useState(null);
  const tabButtonBase =
    "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm md:text-base font-medium transition-all duration-200";

  function handleFormUpdate(sessionId) {
    setOpenForm(true)
    const session = sessions.find(s => s.id === sessionId)
    if (!session) {
      console.log('session Not Found')
      return
    }
    setSessionToUpdate(session)
  }

  return (
    < >
      <UpdateSessionForm
        handleUpdateSession={handleUpdateSession}
        openForm={openForm}
        setOpenForm={setOpenForm}
        session={sessionToUpdate}
        setSession={setSessionToUpdate}
      />
      <main className="flex-1 px-4 pt-5 pb-10 md:pt-8">
        <div className="max-w-7xl mx-auto">
          {loadError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs md:text-sm text-red-700">
              {loadError}
            </div>
          )}

          {/* Tabs */}
          <Tabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabButtonBase={tabButtonBase}
            newMessagesCount={newMessagesCount}
          />

          {/* Tab content */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <OverviewTab
                totalKids={totalKids}
                activeRoundsCount={activeRoundsCount}
                activeSessionsCount={activeSessionsCount}
                averageOccupancy={averageOccupancy}
                messages={messages}
                publishedPhotos={publishedPhotos}
                sessions={sessions}
              />
            )}

            {activeTab === "rounds" && (
              <RoundsTab
                setIsCreatingRound={setIsCreatingRound}
                newRound={newRound}
                handleNewRoundChange={handleNewRoundChange}
                generateRoundCode={generateRoundCode}
                handleRoundSessionChange={handleRoundSessionChange}
                isCreatingRound={isCreatingRound}
                rounds={rounds}
                getRoundStudents={getRoundStudents}
                handleRoundStatusChange={handleRoundStatusChange}
                toggleRoundExpand={toggleRoundExpand}
                expandedRoundId={expandedRoundId}
                handleAddStudentPhotos={handleAddStudentPhotos}
                getRoundRating={getRoundRating}
                regenerateSessions={regenerateSessions}
                handleCreateRound={handleCreateRound}
                evenSessionDateAndTime={evenSessionDateAndTime}
                setEvenSessionDateAndTime={setEvenSessionDateAndTime}
                oddSessionDateAndTime={oddSessionDateAndTime}
                setOddSessionDateAndTime={setOddSessionDateAndTime}
                studentPhotos={studentPhotos}
                handleDeleteRound={handleDeleteRound}
              />
            )}

            {activeTab === "sessions" && (
              <SessionsTab
                sessionSearch={sessionSearch}
                setSessionSearch={setSessionSearch}
                sessionStatusFilter={sessionStatusFilter}
                setSessionStatusFilter={setSessionStatusFilter}
                filteredSessions={filteredSessions}
                handleFormUpdate={handleFormUpdate}
                deleteSessions={deleteSessions}
                handleSessionStatusToggle={handleSessionStatusToggle}
              />
            )}

            {activeTab === "enrollments" && (
              <EnrollmentsTab
                enrollmentStatusFilter={enrollmentStatusFilter}
                setEnrollmentStatusFilter={setEnrollmentStatusFilter}
                filteredEnrollments={filteredEnrollments}
                handleEnrollmentNoteChange={handleEnrollmentNoteChange}
                handleEnrollmentStatusChange={handleEnrollmentStatusChange}
              />
            )}

            {activeTab === "users" && (
              <UsersTab
                users={users}
                userSearch={userSearch}
                setUserSearch={setUserSearch}
                enrollments={enrollments}
                rounds={rounds}
              />
            )}

            {activeTab === "instructors" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-1">
                  <h2 className="text-base font-bold text-[#102a5a] mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-[#FBBF24]" />
                    Create Instructor
                  </h2>
                  <form onSubmit={handleCreateInstructor} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newInstructor.name}
                        onChange={(e) =>
                          handleNewInstructorChange("name", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newInstructor.email}
                        onChange={(e) =>
                          handleNewInstructorChange("email", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={newInstructor.phone}
                        onChange={(e) =>
                          handleNewInstructorChange("phone", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={newInstructor.password}
                        onChange={(e) =>
                          handleNewInstructorChange("password", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Campus Code
                      </label>
                      <input
                        type="text"
                        value={newInstructor.campusCode}
                        onChange={(e) =>
                          handleNewInstructorChange("campusCode", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isCreatingInstructor}
                      className="w-full inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-[#102a5a] text-white hover:bg-[#1a3a6b] disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      {isCreatingInstructor ? "Creating..." : "Create Instructor"}
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-[#102a5a]">
                      Instructors
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-[#102a5a]/10 text-[#102a5a] px-2.5 py-0.5 text-xs font-semibold">
                      {instructors.length} total
                    </span>
                  </div>
                  {instructors.length === 0 ? (
                    <div className="text-sm text-slate-500 py-8 text-center">
                      No instructors created yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-500">
                            <th className="text-left py-3 pr-3 font-semibold text-xs uppercase tracking-wider">Name</th>
                            <th className="text-left py-3 pr-3 font-semibold text-xs uppercase tracking-wider">Email</th>
                            <th className="text-left py-3 pr-3 font-semibold text-xs uppercase tracking-wider">Phone</th>
                            <th className="text-left py-3 pr-3 font-semibold text-xs uppercase tracking-wider">Campus</th>
                            <th className="text-left py-3 pr-3 font-semibold text-xs uppercase tracking-wider">Linked Rounds</th>
                            <th className="text-left py-3 pr-3 font-semibold text-xs uppercase tracking-wider">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instructors.map((instructor) => {
                            const instructorId = instructor._id || instructor.id;
                            const linkedRounds = instructor.linkedRoundCodes || [];
                            const isExpanded = expandedInstructorId === instructorId;
                            return (
                              <React.Fragment key={instructorId}>
                                <tr className="border-b border-slate-100 text-slate-700 hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3 pr-3 font-semibold text-[#102a5a]">
                                    {instructor.name}
                                  </td>
                                  <td className="py-3 pr-3">{instructor.email}</td>
                                  <td className="py-3 pr-3">{instructor.phone}</td>
                                  <td className="py-3 pr-3">
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={
                                          instructorCampusDrafts[instructorId] ??
                                          instructor.campusCode ??
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleInstructorCampusChange(
                                            instructorId,
                                            e.target.value
                                          )
                                        }
                                        className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-xs bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/50 focus:border-[#FBBF24] transition-all"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateInstructorCampus(instructorId)}
                                        className="rounded-lg bg-[#FBBF24] px-2.5 py-1.5 text-[11px] font-bold text-[#102a5a] hover:bg-[#F59E0B] transition-colors shadow-sm"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-3 pr-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedInstructorId(
                                          isExpanded ? null : instructorId
                                        )
                                      }
                                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                      {linkedRounds.length} rounds
                                    </button>
                                  </td>
                                  <td className="py-3 pr-3 text-slate-500 text-xs">
                                    {instructor.createdAt
                                      ? new Date(
                                        instructor.createdAt
                                      ).toLocaleDateString()
                                      : "-"}
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className="border-b border-slate-100 text-slate-600">
                                    <td colSpan={6} className="py-3 pr-3">
                                      <div className="text-xs bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                                        <span className="font-semibold text-[#102a5a]">Linked rounds: </span>
                                        {linkedRounds.length
                                          ? linkedRounds.join(", ")
                                          : "No linked rounds"}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "messages" && (
              <MotionContainer
                key="messages"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                  <h2 className="text-base font-bold text-[#102a5a]">
                    Parent Messages & Requests
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    {["All", "New", "In Progress", "Closed"].map((status) => (
                      <button
                        key={status}
                        className={`px-2.5 py-1.5 rounded-full border text-[11px] font-medium transition-all ${messageStatusFilter === status
                            ? "bg-[#102a5a] text-white border-[#102a5a]"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        onClick={() => setMessageStatusFilter(status)}
                      >
                        {status === "In Progress" ? "In progress" : status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredMessages.map((m) => {
                    const messageId = m.id || m._id;
                    const draftValue = messageNoteDrafts[messageId] ?? m.internalNote ?? "";
                    const isDirty = draftValue !== (m.internalNote ?? "");
                    return (
                      <div
                        key={messageId}
                        className="border border-slate-200 rounded-xl px-4 py-3 text-sm flex flex-col gap-2 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[#102a5a]">
                              {m.parentName} · {m.phone}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Child age: {m.childAge}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${m.status === "New"
                                ? "bg-[#FBBF24]/20 text-[#92400e]"
                                : m.status === "In Progress"
                                  ? "bg-[#102a5a]/10 text-[#102a5a]"
                                  : "bg-emerald-50 text-emerald-700"
                                }`}
                            >
                              {m.status}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {m.message}
                        </p>
                        <div className="flex flex-col gap-2 mt-1">
                          <textarea
                            className="w-full rounded-lg border border-slate-200 text-xs px-3 py-2 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]/30 focus:border-[#FBBF24] transition-all"
                            placeholder="Internal note – e.g. sent WhatsApp message, waiting for reply..."
                            value={draftValue}
                            onChange={(e) =>
                              setMessageNoteDrafts((prev) => ({
                                ...prev,
                                [messageId]: e.target.value,
                              }))
                            }
                            rows={2}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleMessageNoteChange(messageId, draftValue)}
                              disabled={!isDirty}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all ${isDirty
                                ? "border-[#FBBF24] text-[#102a5a] bg-[#FBBF24]/10 hover:bg-[#FBBF24]/20"
                                : "border-slate-200 text-slate-400 cursor-not-allowed"
                                }`}
                            >
                              Save note
                            </button>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() =>
                                handleMessageStatusChange(
                                  messageId,
                                  "In Progress"
                                )
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold border-[#102a5a]/20 text-[#102a5a] hover:bg-[#102a5a]/5 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Mark in progress
                            </button>
                            <button
                              onClick={() =>
                                handleMessageStatusChange(messageId, "Closed")
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Mark closed
                            </button>
                            <button
                              onClick={() =>
                                handleMessageStatusChange(messageId, "New")
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border text-[10px] font-semibold border-[#FBBF24]/30 text-[#92400e] hover:bg-[#FBBF24]/10 transition-colors"
                            >
                              <XCircle className="w-3 h-3" />
                              Mark as new
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {filteredMessages.length === 0 && (
                    <p className="text-sm text-slate-500 py-4 text-center">
                      No messages match your filters.
                    </p>
                  )}
                </div>
              </MotionContainer>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-5 text-center text-xs text-slate-400 bg-white border-t border-slate-100">
        © {new Date().getFullYear()} Sparvi Lab · Admin Dashboard
      </footer>
    </>
  );
};

export default AdminDashboard;
