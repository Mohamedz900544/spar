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
// import AdminHeader from "./components/AdminHeader";
// import { Link, useNavigate } from "react-router-dom";
import UpdateSessionForm from "./components/UpdateSessionForm";

import Tabs from "./components/Tabs";
import OverviewTab from "./components/Tabs/OverviewTab";
import { RoundsTab } from "./components/Tabs/RoundsTab";
import { SessionsTab } from "./components/Tabs/SessionsTab";
import { EnrollmentsTab } from "./components/Tabs/EnrollmentsTab";
import { UsersTab } from "./components/Tabs/UsersTab";
// import { GalleryTab } from "./components/Tabs/GalleryTab";
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
    // meta
    // isLoading,
    loadError,

    // tabs
    // activeTab,
    // setActiveTab,

    // stats
    totalKids,
    activeSessionsCount,
    activeRoundsCount,
    publishedPhotos,
    averageOccupancy,
    newMessagesCount,

    // sessions
    sessions,
    filteredSessions,
    sessionSearch,
    setSessionSearch,
    sessionStatusFilter,
    setSessionStatusFilter,
    handleSessionStatusToggle,

    // enrollments
    enrollments,
    filteredEnrollments,
    enrollmentStatusFilter,
    setEnrollmentStatusFilter,
    handleEnrollmentStatusChange,
    handleEnrollmentNoteChange,

    // // gallery
    // galleryItems,
    // newGalleryTitle,
    // setNewGalleryTitle,
    // newGalleryFile,
    // setNewGalleryFile,
    // handleAddGalleryItem,
    // handleGalleryPublishToggle,
    // handleGalleryFeaturedToggle,

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

    // photos
    studentPhotos,
    handleAddStudentPhotos,
    // sessions
    deleteSessions,
    handleUpdateSession,
    // isSendingGalleryImage,
  } = useAdminDashboard();
  // const navigate = useNavigate()
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
      {/* Admin header (no main navbar here) */}
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
                <div className="bg-white rounded-2xl border border-[#dbeafe] p-5 shadow-sm lg:col-span-1">
                  <h2 className="text-sm md:text-base font-semibold text-slate-900 mb-3">
                    Create instructor
                  </h2>
                  <form onSubmit={handleCreateInstructor} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newInstructor.name}
                        onChange={(e) =>
                          handleNewInstructorChange("name", e.target.value)
                        }
                        className="w-full rounded-xl border border-[#dbeafe] px-3 py-2 text-xs md:text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={newInstructor.email}
                        onChange={(e) =>
                          handleNewInstructorChange("email", e.target.value)
                        }
                        className="w-full rounded-xl border border-[#dbeafe] px-3 py-2 text-xs md:text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={newInstructor.phone}
                        onChange={(e) =>
                          handleNewInstructorChange("phone", e.target.value)
                        }
                        className="w-full rounded-xl border border-[#dbeafe] px-3 py-2 text-xs md:text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        value={newInstructor.password}
                        onChange={(e) =>
                          handleNewInstructorChange("password", e.target.value)
                        }
                        className="w-full rounded-xl border border-[#dbeafe] px-3 py-2 text-xs md:text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Campus code
                      </label>
                      <input
                        type="text"
                        value={newInstructor.campusCode}
                        onChange={(e) =>
                          handleNewInstructorChange("campusCode", e.target.value)
                        }
                        className="w-full rounded-xl border border-[#dbeafe] px-3 py-2 text-xs md:text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isCreatingInstructor}
                      className="w-full inline-flex items-center justify-center rounded-xl px-4 py-2 text-xs md:text-sm font-semibold bg-[#0b63c7] text-white hover:bg-[#0a5ab4] disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isCreatingInstructor ? "Creating..." : "Create instructor"}
                    </button>
                  </form>
                </div>
                <div className="bg-white rounded-2xl border border-[#dbeafe] p-5 shadow-sm lg:col-span-2">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm md:text-base font-semibold text-slate-900">
                      Instructors
                    </h2>
                    <span className="text-[11px] text-slate-500">
                      {instructors.length} total
                    </span>
                  </div>
                  {instructors.length === 0 ? (
                    <div className="text-xs text-slate-500">
                      No instructors created yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs md:text-sm">
                        <thead>
                          <tr className="border-b border-[#e5e7eb] text-slate-500">
                            <th className="text-left py-2 pr-3">Name</th>
                            <th className="text-left py-2 pr-3">Email</th>
                            <th className="text-left py-2 pr-3">Phone</th>
                            <th className="text-left py-2 pr-3">Campus</th>
                            <th className="text-left py-2 pr-3">Linked rounds</th>
                            <th className="text-left py-2 pr-3">Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {instructors.map((instructor) => {
                            const instructorId = instructor._id || instructor.id;
                            const linkedRounds = instructor.linkedRoundCodes || [];
                            const isExpanded = expandedInstructorId === instructorId;
                            return (
                              <React.Fragment key={instructorId}>
                                <tr className="border-b border-[#eef2ff] text-slate-700">
                                  <td className="py-2 pr-3 font-semibold">
                                    {instructor.name}
                                  </td>
                                  <td className="py-2 pr-3">{instructor.email}</td>
                                  <td className="py-2 pr-3">{instructor.phone}</td>
                                  <td className="py-2 pr-3">
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
                                        className="w-28 rounded-lg border border-[#dbeafe] px-2 py-1 text-xs bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#0ea5e9]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateInstructorCampus(instructorId)}
                                        className="rounded-lg border border-[#0b63c7] px-2 py-1 text-[11px] font-semibold text-[#0b63c7] hover:bg-[#eaf2ff]"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-2 pr-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setExpandedInstructorId(
                                          isExpanded ? null : instructorId
                                        )
                                      }
                                      className="rounded-lg border border-[#dbeafe] px-2 py-1 text-[11px] text-slate-700 hover:bg-[#f1f5ff]"
                                    >
                                      {linkedRounds.length} rounds
                                    </button>
                                  </td>
                                  <td className="py-2 pr-3">
                                    {instructor.createdAt
                                      ? new Date(
                                        instructor.createdAt
                                      ).toLocaleDateString()
                                      : "-"}
                                  </td>
                                </tr>
                                {isExpanded && (
                                  <tr className="border-b border-[#eef2ff] text-slate-600">
                                    <td colSpan={6} className="py-2 pr-3">
                                      <div className="text-[11px]">
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

            {/* {activeTab === "gallery" && (
              <GalleryTab
                handleAddGalleryItem={handleAddGalleryItem}
                newGalleryTitle={newGalleryTitle}
                setNewGalleryTitle={setNewGalleryTitle}
                galleryItems={galleryItems}
                handleGalleryPublishToggle={handleGalleryPublishToggle}
                handleGalleryFeaturedToggle={handleGalleryFeaturedToggle}
                setNewGalleryFile={setNewGalleryFile}
                newGalleryFile={newGalleryFile}
                isSendingGalleryImage={isSendingGalleryImage}
              />
            )} */}

            {activeTab === "messages" && (
              <MotionContainer
                key="messages"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl border border-[#dbeafe] p-5 shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <h2 className="text-sm md:text-base font-semibold text-slate-900">
                    Parent messages & requests
                  </h2>
                  <div className="flex items-center gap-1 text-[11px]">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <button
                      className={`px-2 py-1 rounded-full border text-[10px] ${messageStatusFilter === "All"
                        ? "bg-[#0b63c7] text-white border-[#0b63c7]"
                        : "border-[#dbeafe] text-slate-700"
                        }`}
                      onClick={() => setMessageStatusFilter("All")}
                    >
                      All
                    </button>
                    <button
                      className={`px-2 py-1 rounded-full border text-[10px] ${messageStatusFilter === "New"
                        ? "bg-[#0b63c7] text-white border-[#0b63c7]"
                        : "border-[#dbeafe] text-slate-700"
                        }`}
                      onClick={() => setMessageStatusFilter("New")}
                    >
                      New
                    </button>
                    <button
                      className={`px-2 py-1 rounded-full border text-[10px] ${messageStatusFilter === "In Progress"
                        ? "bg-[#0b63c7] text-white border-[#0b63c7]"
                        : "border-[#dbeafe] text-slate-700"
                        }`}
                      onClick={() =>
                        setMessageStatusFilter("In Progress")
                      }
                    >
                      In progress
                    </button>
                    <button
                      className={`px-2 py-1 rounded-full border text-[10px] ${messageStatusFilter === "Closed"
                        ? "bg-[#0b63c7] text-white border-[#0b63c7]"
                        : "border-[#dbeafe] text-slate-700"
                        }`}
                      onClick={() => setMessageStatusFilter("Closed")}
                    >
                      Closed
                    </button>
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
                      className="border border-[#e5e7eb] rounded-xl px-3 py-2.5 text-xs md:text-sm flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">
                            {m.parentName} · {m.phone}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Child age: {m.childAge}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${m.status === "New"
                              ? "bg-[#fee2e2] text-[#b91c1c]"
                              : m.status === "In Progress"
                                ? "bg-[#e0f2fe] text-[#075985]"
                                : "bg-[#dcfce7] text-[#166534]"
                              }`}
                          >
                            {m.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] md:text-xs text-slate-600">
                        {m.message}
                      </p>
                      <div className="flex flex-col gap-2 mt-1">
                        <textarea
                          className="w-full rounded-lg border border-[#dbeafe] text-[11px] px-2 py-1 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-[#0ea5e9]"
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
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium ${isDirty
                              ? "border-[#0ea5e9] text-[#0b63c7] hover:bg-[#e0f2fe]"
                              : "border-[#e2e8f0] text-slate-400 cursor-not-allowed"
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
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium border-[#e0f2fe] text-[#075985] hover:bg-[#e0f2fe]"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Mark in progress
                          </button>
                          <button
                            onClick={() =>
                              handleMessageStatusChange(messageId, "Closed")
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium border-[#bbf7d0] text-[#166534] hover:bg-[#dcfce7]"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            Mark closed
                          </button>
                          <button
                            onClick={() =>
                              handleMessageStatusChange(messageId, "New")
                            }
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium border-[#fee2e2] text-[#b91c1c] hover:bg-[#fee2e2]"
                          >
                            <XCircle className="w-3 h-3" />
                            Mark as new
                          </button>
                        </div>
                      </div>
                    </div>
                  )})}
                  {filteredMessages.length === 0 && (
                    <p className="text-xs text-slate-500">
                      No messages match your filters.
                    </p>
                  )}
                </div>
              </MotionContainer>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] md:text-xs text-slate-500 bg-white border-t border-[#e2e8f0]">
        © {new Date().getFullYear()} Sparvi Lab · Admin Dashboard
      </footer>
    </>
  );
};

export default AdminDashboard;
