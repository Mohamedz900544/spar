import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

const normalizePhone = (value) => (value || "").toString().replace(/\D/g, "");

export const UsersTab = ({
  users,
  userSearch,
  setUserSearch,
  enrollments,
  rounds,
}) => {
  const MotionContainer = motion.div;
  const [selectedUserId, setSelectedUserId] = useState(null);

  const filteredUsers = useMemo(() => {
    const q = normalizePhone(userSearch);
    if (!q) return users;
    return users.filter((u) => {
      const phoneDigits = normalizePhone(u.phone);
      return phoneDigits.includes(q);
    });
  }, [users, userSearch]);

  const roundByCode = useMemo(() => {
    const map = new Map();
    rounds.forEach((r) => {
      if (r.code) map.set(r.code, r);
    });
    return map;
  }, [rounds]);

  const selectedUser = filteredUsers.find(
    (u) => (u.id || u._id) === selectedUserId
  );

  const selectedEnrollments = useMemo(() => {
    if (!selectedUser) return [];
    const userId = selectedUser.id || selectedUser._id;
    return enrollments.filter((e) => {
      const enrollmentUserId = e.user?._id || e.user;
      return enrollmentUserId?.toString?.() === userId?.toString?.();
    });
  }, [enrollments, selectedUser]);

  const previousRounds = useMemo(() => {
    const codes = new Set();
    selectedEnrollments.forEach((e) => {
      if (e.roundCode) codes.add(e.roundCode);
    });
    return Array.from(codes);
  }, [selectedEnrollments]);

  const selectedChildren = selectedUser?.children || [];

  return (
    <MotionContainer
      key="users"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-5"
    >
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm lg:col-span-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm md:text-base font-semibold text-slate-900">
            Users
          </h2>
          <span className="text-[11px] text-slate-500">
            {filteredUsers.length} results
          </span>
        </div>
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search by phone number"
            className="w-full rounded-xl border border-[#e2e8f0] pl-9 pr-3 py-2 text-xs md:text-sm bg-white text-slate-800 outline-none focus:ring-2 focus:ring-[#FBBF24]"
          />
        </div>
        <div className="space-y-2 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
          {filteredUsers.map((u) => {
            const userId = u.id || u._id;
            const isActive = selectedUserId === userId;
            return (
              <button
                key={userId}
                type="button"
                onClick={() => setSelectedUserId(userId)}
                className={`w-full text-left border rounded-xl px-3 py-2 text-xs md:text-sm transition ${isActive
                  ? "border-[#102a5a] bg-[#f1f5f9]"
                  : "border-[#e5e7eb] hover:bg-[#f8fafc]"
                  }`}
              >
                <p className="font-semibold text-slate-800">{u.name}</p>
                <p className="text-[11px] text-slate-500">{u.phone || "-"}</p>
                <p className="text-[11px] text-slate-400">{u.email || "-"}</p>
              </button>
            );
          })}
          {filteredUsers.length === 0 && (
            <p className="text-xs text-slate-500">No users match this phone.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-sm lg:col-span-2">
        {!selectedUser ? (
          <div className="text-xs text-slate-500">
            Select a user to view full details.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h2 className="text-sm md:text-base font-semibold text-slate-900">
                  {selectedUser.name}
                </h2>
                <p className="text-[11px] text-slate-500">
                  {selectedUser.email || "-"} · {selectedUser.phone || "-"}
                </p>
              </div>
              <div className="text-[11px] text-slate-500">
                Signed up:{" "}
                {selectedUser.createdAt
                  ? new Date(selectedUser.createdAt).toLocaleDateString()
                  : "-"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#e5e7eb] p-3">
                <p className="text-[11px] text-slate-500">Children</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedChildren.length}
                </p>
              </div>
              <div className="rounded-xl border border-[#e5e7eb] p-3">
                <p className="text-[11px] text-slate-500">Enrollments</p>
                <p className="text-sm font-semibold text-slate-900">
                  {selectedEnrollments.length}
                </p>
              </div>
              <div className="rounded-xl border border-[#e5e7eb] p-3">
                <p className="text-[11px] text-slate-500">Rounds</p>
                <p className="text-sm font-semibold text-slate-900">
                  {previousRounds.length}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-700 mb-2">
                Previous rounds
              </h3>
              {previousRounds.length === 0 ? (
                <p className="text-xs text-slate-500">No rounds found.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {previousRounds.map((code) => {
                    const round = roundByCode.get(code);
                    return (
                      <div
                        key={code}
                        className="rounded-full border border-[#e2e8f0] px-3 py-1 text-[11px] text-slate-700 bg-[#f8fbff]"
                      >
                        {code}
                        {round?.name ? ` · ${round.name}` : ""}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-700 mb-2">
                Children
              </h3>
              {selectedChildren.length === 0 ? (
                <p className="text-xs text-slate-500">No children found.</p>
              ) : (
                <div className="space-y-2">
                  {selectedChildren.map((child) => (
                    <div
                      key={child._id || child.id || child.name}
                      className="border border-[#e5e7eb] rounded-xl px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-800">
                          {child.name}
                        </p>
                        <span className="text-[11px] text-slate-500">
                          Age {child.age ?? "-"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Enrolled rounds: {child.enrolledRounds?.length || 0}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-700 mb-2">
                Enrollment history
              </h3>
              {selectedEnrollments.length === 0 ? (
                <p className="text-xs text-slate-500">No enrollments found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs md:text-sm">
                    <thead>
                      <tr className="border-b border-[#e5e7eb] text-slate-500">
                        <th className="text-left py-2 pr-3">Child</th>
                        <th className="text-left py-2 pr-3">Round</th>
                        <th className="text-left py-2 pr-3">Level</th>
                        <th className="text-left py-2 pr-3">Status</th>
                        <th className="text-left py-2 pr-3">Session</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEnrollments.map((e) => (
                        <tr
                          key={e.id || e._id}
                          className="border-b border-[#f1f5f9] last:border-b-0"
                        >
                          <td className="py-2 pr-3 font-medium text-slate-800">
                            {e.childName}
                          </td>
                          <td className="py-2 pr-3 text-slate-600">
                            {e.roundCode || "-"}
                          </td>
                          <td className="py-2 pr-3 text-slate-600">
                            {e.level || "-"}
                          </td>
                          <td className="py-2 pr-3 text-slate-600">
                            {e.status || "-"}
                          </td>
                          <td className="py-2 pr-3 text-slate-600">
                            {e.sessionTitle || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </MotionContainer>
  );
};
