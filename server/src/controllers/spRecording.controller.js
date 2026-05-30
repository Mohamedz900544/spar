import mongoose from "mongoose";
import path from "path";
import SPRecordingCourse from "../models/SPRecordingCourse.js";

const GRIDFS_BUCKET_NAME = "spRecordingFiles";
const SPARVI_EXTENSION = ".sparvi";

const getBucket = () => {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB connection is not ready");
  }

  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: GRIDFS_BUCKET_NAME,
  });
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const sanitizeFileName = (value = "recording.sparvi") => {
  const name = path.basename(value).replace(/[^a-zA-Z0-9._ -]/g, "_");
  return name.toLowerCase().endsWith(SPARVI_EXTENSION)
    ? name
    : `${name}${SPARVI_EXTENSION}`;
};

const ensureSparviFile = (file) => {
  const extension = path.extname(file?.originalname || "").toLowerCase();
  if (extension !== SPARVI_EXTENSION) {
    throw new Error("Only .sparvi files are allowed");
  }
};

const parsePayload = (req) => {
  if (req.body?.payload) {
    try {
      return JSON.parse(req.body.payload);
    } catch {
      throw new Error("Invalid recording payload JSON");
    }
  }

  return req.body || {};
};

const getFilesByField = (files = []) =>
  files.reduce((items, file) => {
    items[file.fieldname] = file;
    return items;
  }, {});

const uploadFileToGridFS = async (file, metadata = {}) => {
  ensureSparviFile(file);

  const bucket = getBucket();
  const originalName = sanitizeFileName(file.originalname);
  const storedName = `${Date.now()}-${Math.round(
    Math.random() * 1e9
  )}-${originalName}`;

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(storedName, {
      contentType: file.mimetype || "application/octet-stream",
      metadata: {
        ...metadata,
        originalName,
      },
    });

    uploadStream.on("error", reject);
    uploadStream.on("finish", () => {
      resolve({
        fileId: uploadStream.id,
        originalName,
        storedName,
        contentType: file.mimetype || "application/octet-stream",
        size: file.size || 0,
        uploadedAt: new Date(),
      });
    });

    uploadStream.end(file.buffer);
  });
};

const deleteGridFile = async (fileId) => {
  if (!fileId || !isValidObjectId(fileId)) return;

  try {
    await getBucket().delete(toObjectId(fileId));
  } catch (err) {
    if (err?.code !== "ENOENT" && err?.message !== "FileNotFound") {
      console.warn("Could not delete SP recording file:", err.message);
    }
  }
};

const collectFileIds = (course) => {
  const ids = [];

  for (const chapter of course?.chapters || []) {
    for (const lesson of chapter.lessons || []) {
      if (lesson.file?.fileId) {
        ids.push(lesson.file.fileId.toString());
      }
    }
  }

  return ids;
};

const findLessonById = (course, lessonId) => {
  for (const chapter of course?.chapters || []) {
    for (const lesson of chapter.lessons || []) {
      if (lesson._id?.toString() === lessonId?.toString()) {
        return { chapter, lesson };
      }
    }
  }

  return null;
};

const buildExistingLessonMap = (course) => {
  const lessons = {};

  for (const chapter of course?.chapters || []) {
    for (const lesson of chapter.lessons || []) {
      lessons[lesson._id.toString()] = lesson;
    }
  }

  return lessons;
};

const buildChaptersFromPayload = async ({
  payload,
  filesByField,
  existingCourse,
  uploadedFileIds,
  keptFileIds,
}) => {
  const title = `${payload.title || ""}`.trim();
  if (!title) {
    throw new Error("Course name is required");
  }

  if (!Array.isArray(payload.chapters) || payload.chapters.length === 0) {
    throw new Error("At least one chapter is required");
  }

  const existingLessons = buildExistingLessonMap(existingCourse);
  const chapters = [];

  for (const [chapterIndex, chapter] of payload.chapters.entries()) {
    const chapterTitle = `${chapter.title || ""}`.trim();
    if (!chapterTitle) {
      throw new Error(`Chapter ${chapterIndex + 1} title is required`);
    }

    if (!Array.isArray(chapter.lessons) || chapter.lessons.length === 0) {
      throw new Error(`Chapter "${chapterTitle}" needs at least one lesson`);
    }

    const lessons = [];

    for (const [lessonIndex, lesson] of chapter.lessons.entries()) {
      const lessonTitle = `${lesson.title || ""}`.trim();
      if (!lessonTitle) {
        throw new Error(
          `Lesson ${lessonIndex + 1} title is required in "${chapterTitle}"`
        );
      }

      const existingLesson = lesson.id ? existingLessons[lesson.id] : null;
      const uploadedFile = lesson.fileField
        ? filesByField[lesson.fileField]
        : null;

      let fileMetadata = existingLesson?.file || null;

      if (uploadedFile) {
        fileMetadata = await uploadFileToGridFS(uploadedFile, {
          courseTitle: title,
          chapterTitle,
          lessonTitle,
        });
        uploadedFileIds.push(fileMetadata.fileId.toString());
      } else if (fileMetadata?.fileId) {
        keptFileIds.add(fileMetadata.fileId.toString());
      }

      if (!fileMetadata?.fileId) {
        throw new Error(`Lesson "${lessonTitle}" needs a .sparvi file`);
      }

      lessons.push({
        ...(existingLesson?._id ? { _id: existingLesson._id } : {}),
        title: lessonTitle,
        order: Number.isFinite(Number(lesson.order))
          ? Number(lesson.order)
          : lessonIndex,
        file: fileMetadata,
      });
    }

    chapters.push({
      ...(chapter.id ? { _id: chapter.id } : {}),
      title: chapterTitle,
      order: Number.isFinite(Number(chapter.order))
        ? Number(chapter.order)
        : chapterIndex,
      lessons,
    });
  }

  return { title, chapters };
};

const toCourseDto = (course, { downloadBasePath = "/api/sparvi/recordings" } = {}) => {
  const courseId = course._id?.toString?.() || course.id;

  return {
    id: courseId,
    _id: courseId,
    title: course.title,
    chapters: (course.chapters || []).map((chapter) => ({
      id: chapter._id?.toString?.() || chapter.id,
      _id: chapter._id?.toString?.() || chapter.id,
      title: chapter.title,
      order: chapter.order || 0,
      lessons: (chapter.lessons || []).map((lesson) => {
        const lessonId = lesson._id?.toString?.() || lesson.id;
        const hasFile = Boolean(lesson.file?.fileId);
        return {
          id: lessonId,
          _id: lessonId,
          title: lesson.title,
          order: lesson.order || 0,
          fileUploaded: hasFile,
          file: hasFile
            ? {
                id: lesson.file.fileId?.toString?.() || lesson.file.fileId,
                originalName: lesson.file.originalName,
                contentType: lesson.file.contentType,
                size: lesson.file.size || 0,
                uploadedAt: lesson.file.uploadedAt,
              }
            : null,
          downloadUrl: hasFile
            ? `${downloadBasePath}/${courseId}/lessons/${lessonId}/download`
            : null,
        };
      }),
    })),
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };
};

export const listAdminSPRecordingCourses = async (req, res) => {
  try {
    const courses = await SPRecordingCourse.find()
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({
      ok: true,
      courses: courses.map((course) =>
        toCourseDto(course, { downloadBasePath: "/api/admin/sp-recordings" })
      ),
    });
  } catch (err) {
    console.error("List SP recordings error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

export const listPublicSPRecordingCourses = async (req, res) => {
  try {
    const courses = await SPRecordingCourse.find()
      .sort({ title: 1, updatedAt: -1 })
      .lean();

    return res.json({
      ok: true,
      courses: courses.map((course) =>
        toCourseDto(course, { downloadBasePath: "/api/sparvi/recordings" })
      ),
    });
  } catch (err) {
    console.error("List public SP recordings error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

export const getPublicSPRecordingCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ ok: false, message: "Invalid course id" });
    }

    const course = await SPRecordingCourse.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ ok: false, message: "Course not found" });
    }

    return res.json({
      ok: true,
      course: toCourseDto(course, {
        downloadBasePath: "/api/sparvi/recordings",
      }),
    });
  } catch (err) {
    console.error("Get public SP recording error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

export const createSPRecordingCourse = async (req, res) => {
  const uploadedFileIds = [];

  try {
    const payload = parsePayload(req);
    const filesByField = getFilesByField(req.files);
    const keptFileIds = new Set();
    const { title, chapters } = await buildChaptersFromPayload({
      payload,
      filesByField,
      existingCourse: null,
      uploadedFileIds,
      keptFileIds,
    });

    const course = await SPRecordingCourse.create({
      title,
      chapters,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    return res.status(201).json({
      ok: true,
      course: toCourseDto(course, {
        downloadBasePath: "/api/admin/sp-recordings",
      }),
    });
  } catch (err) {
    await Promise.all(uploadedFileIds.map(deleteGridFile));
    console.error("Create SP recording error:", err);
    return res.status(400).json({
      ok: false,
      message: err.message || "Could not save SP recording",
    });
  }
};

export const updateSPRecordingCourse = async (req, res) => {
  const uploadedFileIds = [];

  try {
    const { courseId } = req.params;
    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ ok: false, message: "Invalid course id" });
    }

    const course = await SPRecordingCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ ok: false, message: "Course not found" });
    }

    const existingFileIds = collectFileIds(course);
    const keptFileIds = new Set();
    const payload = parsePayload(req);
    const filesByField = getFilesByField(req.files);
    const { title, chapters } = await buildChaptersFromPayload({
      payload,
      filesByField,
      existingCourse: course,
      uploadedFileIds,
      keptFileIds,
    });

    course.title = title;
    course.chapters = chapters;
    course.updatedBy = req.user?._id;
    await course.save();

    const removedFileIds = existingFileIds.filter((fileId) => {
      return !keptFileIds.has(fileId) && !uploadedFileIds.includes(fileId);
    });
    await Promise.all(removedFileIds.map(deleteGridFile));

    return res.json({
      ok: true,
      course: toCourseDto(course, {
        downloadBasePath: "/api/admin/sp-recordings",
      }),
    });
  } catch (err) {
    await Promise.all(uploadedFileIds.map(deleteGridFile));
    console.error("Update SP recording error:", err);
    return res.status(400).json({
      ok: false,
      message: err.message || "Could not update SP recording",
    });
  }
};

export const deleteSPRecordingCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!isValidObjectId(courseId)) {
      return res.status(400).json({ ok: false, message: "Invalid course id" });
    }

    const course = await SPRecordingCourse.findById(courseId);
    if (!course) {
      return res.status(404).json({ ok: false, message: "Course not found" });
    }

    const fileIds = collectFileIds(course);
    await course.deleteOne();
    await Promise.all(fileIds.map(deleteGridFile));

    return res.json({
      ok: true,
      courseId,
      deletedFilesCount: fileIds.length,
    });
  } catch (err) {
    console.error("Delete SP recording error:", err);
    return res.status(500).json({ ok: false, message: "Server error" });
  }
};

export const downloadSPRecordingLessonFile = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    if (!isValidObjectId(courseId) || !isValidObjectId(lessonId)) {
      return res.status(400).json({ ok: false, message: "Invalid id" });
    }

    const course = await SPRecordingCourse.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ ok: false, message: "Course not found" });
    }

    const match = findLessonById(course, lessonId);
    const lesson = match?.lesson;
    if (!lesson?.file?.fileId) {
      return res.status(404).json({ ok: false, message: "File not found" });
    }

    const fileId = lesson.file.fileId.toString();
    const fileName = sanitizeFileName(
      lesson.file.originalName || `${lesson.title}.sparvi`
    );

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Length", lesson.file.size || 0);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName.replace(/"/g, "")}"`
    );
    res.setHeader("X-SP-Course-Name", encodeURIComponent(course.title || ""));
    res.setHeader("X-SP-Chapter-Name", encodeURIComponent(match.chapter.title || ""));
    res.setHeader("X-SP-Lesson-Name", encodeURIComponent(lesson.title || ""));

    const downloadStream = getBucket().openDownloadStream(toObjectId(fileId));
    downloadStream.on("error", (err) => {
      console.error("Download SP recording error:", err);
      if (!res.headersSent) {
        res.status(404).json({ ok: false, message: "File not found" });
      } else {
        res.destroy(err);
      }
    });
    downloadStream.pipe(res);
  } catch (err) {
    console.error("Download SP recording error:", err);
    if (!res.headersSent) {
      return res.status(500).json({ ok: false, message: "Server error" });
    }
    return res.destroy(err);
  }
};
