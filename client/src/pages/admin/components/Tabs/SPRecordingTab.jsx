import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileArchive,
  FolderPlus,
  ListPlus,
  Pencil,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getTokenOrRedirect } from "../../../../helpers/helpers";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const createClientId = () =>
  `draft-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const emptyLesson = () => ({
  clientId: createClientId(),
  id: "",
  title: "",
  file: null,
  existingFile: null,
});

const emptyChapter = () => ({
  clientId: createClientId(),
  id: "",
  title: "",
  lessons: [emptyLesson()],
});

const createEmptyDraft = () => ({
  id: "",
  title: "",
  chapters: [emptyChapter()],
});

const parseJsonOrThrow = async (res, fallbackMessage) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
};

const toDraft = (course) => ({
  id: course.id || course._id || "",
  title: course.title || "",
  chapters: (course.chapters || []).map((chapter) => ({
    clientId: chapter.id || chapter._id || createClientId(),
    id: chapter.id || chapter._id || "",
    title: chapter.title || "",
    lessons: (chapter.lessons || []).map((lesson) => ({
      clientId: lesson.id || lesson._id || createClientId(),
      id: lesson.id || lesson._id || "",
      title: lesson.title || "",
      file: null,
      existingFile: lesson.file || null,
    })),
  })),
});

const getCourseLessonCount = (course) =>
  (course.chapters || []).reduce(
    (sum, chapter) => sum + (chapter.lessons?.length || 0),
    0
  );

const getFileLabel = (lesson) => {
  if (lesson.file) return lesson.file.name;
  if (lesson.existingFile?.originalName) return lesson.existingFile.originalName;
  return "";
};

export const SPRecordingTab = () => {
  const MotionSection = motion.section;
  const [courses, setCourses] = useState([]);
  const [draft, setDraft] = useState(createEmptyDraft);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileInputResetKey, setFileInputResetKey] = useState(0);

  const selectedCourse = useMemo(
    () => courses.find((course) => (course.id || course._id) === selectedCourseId),
    [courses, selectedCourseId]
  );

  const loadCourses = async () => {
    const token = getTokenOrRedirect();
    if (!token) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/admin/sp-recordings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await parseJsonOrThrow(res, "Failed to load SP recordings");
      setCourses(data.courses || []);
    } catch (err) {
      console.error("Load SP recordings error:", err);
      toast.error(err.message || "Failed to load SP recordings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const resetDraft = () => {
    setDraft(createEmptyDraft());
    setSelectedCourseId("");
    setFileInputResetKey((value) => value + 1);
  };

  const editCourse = (course) => {
    const courseId = course.id || course._id;
    setSelectedCourseId(courseId);
    setDraft(toDraft(course));
    setFileInputResetKey((value) => value + 1);
  };

  const updateDraftField = (field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  const updateChapter = (chapterClientId, field, value) => {
    setDraft((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.clientId === chapterClientId
          ? { ...chapter, [field]: value }
          : chapter
      ),
    }));
  };

  const updateLesson = (chapterClientId, lessonClientId, field, value) => {
    setDraft((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.clientId === chapterClientId
          ? {
              ...chapter,
              lessons: chapter.lessons.map((lesson) =>
                lesson.clientId === lessonClientId
                  ? { ...lesson, [field]: value }
                  : lesson
              ),
            }
          : chapter
      ),
    }));
  };

  const addChapter = () => {
    setDraft((prev) => ({
      ...prev,
      chapters: [...prev.chapters, emptyChapter()],
    }));
  };

  const removeChapter = (chapterClientId) => {
    setDraft((prev) => ({
      ...prev,
      chapters: prev.chapters.filter(
        (chapter) => chapter.clientId !== chapterClientId
      ),
    }));
  };

  const addLesson = (chapterClientId) => {
    setDraft((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.clientId === chapterClientId
          ? { ...chapter, lessons: [...chapter.lessons, emptyLesson()] }
          : chapter
      ),
    }));
  };

  const removeLesson = (chapterClientId, lessonClientId) => {
    setDraft((prev) => ({
      ...prev,
      chapters: prev.chapters.map((chapter) =>
        chapter.clientId === chapterClientId
          ? {
              ...chapter,
              lessons: chapter.lessons.filter(
                (lesson) => lesson.clientId !== lessonClientId
              ),
            }
          : chapter
      ),
    }));
  };

  const validateDraft = () => {
    if (!draft.title.trim()) {
      toast.error("Course name is required");
      return false;
    }

    if (!draft.chapters.length) {
      toast.error("Add at least one chapter");
      return false;
    }

    for (const chapter of draft.chapters) {
      if (!chapter.title.trim()) {
        toast.error("Every chapter needs a title");
        return false;
      }
      if (!chapter.lessons.length) {
        toast.error(`Add at least one lesson under "${chapter.title}"`);
        return false;
      }
      for (const lesson of chapter.lessons) {
        if (!lesson.title.trim()) {
          toast.error(`Every lesson under "${chapter.title}" needs a title`);
          return false;
        }
        if (!lesson.file && !lesson.existingFile?.id) {
          toast.error(`Attach a .sparvi file for "${lesson.title}"`);
          return false;
        }
        if (lesson.file && !lesson.file.name.toLowerCase().endsWith(".sparvi")) {
          toast.error("Only .sparvi files are allowed");
          return false;
        }
      }
    }

    return true;
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    if (!validateDraft()) return;

    const token = getTokenOrRedirect();
    if (!token) return;

    const formData = new FormData();
    const payload = {
      title: draft.title.trim(),
      chapters: draft.chapters.map((chapter, chapterIndex) => ({
        id: chapter.id || undefined,
        title: chapter.title.trim(),
        order: chapterIndex,
        lessons: chapter.lessons.map((lesson, lessonIndex) => {
          const fileField = lesson.file
            ? `lessonFile_${chapterIndex}_${lessonIndex}`
            : null;
          if (lesson.file) {
            formData.append(fileField, lesson.file);
          }
          return {
            id: lesson.id || undefined,
            title: lesson.title.trim(),
            order: lessonIndex,
            fileField,
          };
        }),
      })),
    };

    formData.append("payload", JSON.stringify(payload));

    const isEditing = Boolean(draft.id);
    const url = isEditing
      ? `${API_BASE_URL}/api/admin/sp-recordings/${draft.id}`
      : `${API_BASE_URL}/api/admin/sp-recordings`;

    try {
      setIsSaving(true);
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await parseJsonOrThrow(
        res,
        isEditing ? "Failed to update SP recording" : "Failed to create SP recording"
      );
      const savedCourse = data.course;

      setCourses((prev) => {
        const savedId = savedCourse.id || savedCourse._id;
        const exists = prev.some((course) => (course.id || course._id) === savedId);
        if (!exists) return [savedCourse, ...prev];
        return prev.map((course) =>
          (course.id || course._id) === savedId ? savedCourse : course
        );
      });
      setSelectedCourseId(savedCourse.id || savedCourse._id);
      setDraft(toDraft(savedCourse));
      setFileInputResetKey((value) => value + 1);
      toast.success(isEditing ? "SP recording updated" : "SP recording created");
    } catch (err) {
      console.error("Save SP recording error:", err);
      toast.error(err.message || "Could not save SP recording");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCourse = async (course) => {
    const courseId = course.id || course._id;
    const confirmed = window.confirm(`Delete "${course.title}"?`);
    if (!confirmed) return;

    const token = getTokenOrRedirect();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/sp-recordings/${courseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await parseJsonOrThrow(res, "Failed to delete SP recording");
      setCourses((prev) =>
        prev.filter((item) => (item.id || item._id) !== courseId)
      );
      if (selectedCourseId === courseId) {
        resetDraft();
      }
      toast.success("SP recording deleted");
    } catch (err) {
      console.error("Delete SP recording error:", err);
      toast.error(err.message || "Could not delete SP recording");
    }
  };

  return (
    <MotionSection
      key="sp-recording"
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-1 gap-5 xl:grid-cols-3"
    >
      <form
        onSubmit={saveCourse}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2"
      >
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-bold text-[#102a5a]">
              {draft.id ? "Edit SP Recording" : "Create SP Recording"}
            </h2>
            {selectedCourse && (
              <p className="mt-1 text-xs font-semibold text-slate-400">
                Last update:{" "}
                {selectedCourse.updatedAt
                  ? new Date(selectedCourse.updatedAt).toLocaleString()
                  : "-"}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resetDraft}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <Plus className="h-3.5 w-3.5" />
              New
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#102a5a] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#1a3a6b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" />
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Course name
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => updateDraftField("title", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/40"
              placeholder="e.g. Scratch Level 1"
            />
          </div>

          <div className="space-y-4">
            {draft.chapters.map((chapter, chapterIndex) => (
              <section
                key={chapter.clientId}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="min-w-0 flex-1">
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Chapter {chapterIndex + 1}
                    </label>
                    <input
                      type="text"
                      value={chapter.title}
                      onChange={(e) =>
                        updateChapter(chapter.clientId, "title", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/40"
                      placeholder="Chapter title"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeChapter(chapter.clientId)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>

                <div className="space-y-3">
                  {chapter.lessons.map((lesson, lessonIndex) => {
                    const fileLabel = getFileLabel(lesson);
                    return (
                      <div
                        key={lesson.clientId}
                        className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.75fr)_auto]"
                      >
                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            Lesson {lessonIndex + 1}
                          </label>
                          <input
                            type="text"
                            value={lesson.title}
                            onChange={(e) =>
                              updateLesson(
                                chapter.clientId,
                                lesson.clientId,
                                "title",
                                e.target.value
                              )
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-all focus:border-[#FBBF24] focus:ring-2 focus:ring-[#FBBF24]/40"
                            placeholder="Lesson title"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-semibold text-slate-600">
                            .sparvi file
                          </label>
                          <label className="flex min-h-[42px] cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:border-[#FBBF24] hover:bg-[#FBBF24]/10">
                            <span className="inline-flex min-w-0 items-center gap-2">
                              <UploadCloud className="h-4 w-4 shrink-0 text-[#102a5a]" />
                              <span className="truncate">
                                {lesson.file ? "Replace selected" : "Upload file"}
                              </span>
                            </span>
                            <input
                              key={`${fileInputResetKey}-${lesson.clientId}`}
                              type="file"
                              accept=".sparvi"
                              className="hidden"
                              onChange={(e) =>
                                updateLesson(
                                  chapter.clientId,
                                  lesson.clientId,
                                  "file",
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                          </label>
                          {fileLabel && (
                            <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{fileLabel}</span>
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeLesson(chapter.clientId, lesson.clientId)
                          }
                          className="inline-flex h-10 w-10 items-center justify-center self-end rounded-lg border border-rose-200 bg-rose-50 text-rose-700 transition-colors hover:bg-rose-100"
                          aria-label="Delete lesson"
                          title="Delete lesson"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => addLesson(chapter.clientId)}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#102a5a] transition-colors hover:bg-slate-50"
                >
                  <ListPlus className="h-3.5 w-3.5" />
                  Add lesson
                </button>
              </section>
            ))}
          </div>

          <button
            type="button"
            onClick={addChapter}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#102a5a] transition-colors hover:bg-slate-50"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            Add chapter
          </button>
        </div>
      </form>

      <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#102a5a]">SP Recordings</h2>
          <span className="rounded-full bg-[#102a5a]/10 px-2.5 py-0.5 text-xs font-bold text-[#102a5a]">
            {courses.length}
          </span>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
            Loading...
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-500">
            No SP recordings yet.
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => {
              const courseId = course.id || course._id;
              const isActive = courseId === selectedCourseId;
              return (
                <article
                  key={courseId}
                  className={`rounded-xl border px-3 py-3 transition-colors ${
                    isActive
                      ? "border-[#102a5a] bg-[#102a5a]/5"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {course.title}
                      </p>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500">
                        {course.chapters?.length || 0} chapters -{" "}
                        {getCourseLessonCount(course)} lessons
                      </p>
                    </div>
                    <FileArchive className="h-4 w-4 shrink-0 text-[#102a5a]" />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => editCourse(course)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#102a5a] transition-colors hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCourse(course)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-700 transition-colors hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </aside>
    </MotionSection>
  );
};
