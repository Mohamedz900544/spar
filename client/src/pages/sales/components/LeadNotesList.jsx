import { formatDateTime } from "../salesHelpers";

const getNoteTime = (note) => {
  const time = new Date(note?.createdAt || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const LeadNotesList = ({ notes = [], max = 3, emptyText = "No saved notes yet." }) => {
  const latestNotes = [...notes]
    .sort((a, b) => getNoteTime(b) - getNoteTime(a))
    .slice(0, max);

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold text-[#102a5a]">Saved Notes</p>
        {notes.length > max && (
          <span className="text-[10px] text-slate-500">
            Latest {max} of {notes.length}
          </span>
        )}
      </div>

      {latestNotes.length === 0 ? (
        <p className="text-[11px] text-slate-400">{emptyText}</p>
      ) : (
        latestNotes.map((note, index) => (
          <div
            key={note?._id || note?.id || `${note?.createdAt || "note"}-${index}`}
            className="rounded-lg bg-slate-100 px-2 py-1.5"
          >
            <p className="whitespace-pre-wrap break-words text-[11px] leading-relaxed text-slate-700">
              {note?.text}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              {note?.createdByName || "Sales"} - {formatDateTime(note?.createdAt)}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default LeadNotesList;
