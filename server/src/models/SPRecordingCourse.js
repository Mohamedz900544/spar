import mongoose from "mongoose";

const spRecordingFileSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storedName: {
      type: String,
      required: true,
      trim: true,
    },
    contentType: {
      type: String,
      default: "application/octet-stream",
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const spRecordingLessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    order: {
      type: Number,
      default: 0,
    },
    file: {
      type: spRecordingFileSchema,
      default: null,
    },
  },
  { timestamps: true }
);

const spRecordingChapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    order: {
      type: Number,
      default: 0,
    },
    lessons: {
      type: [spRecordingLessonSchema],
      default: [],
    },
  },
  { timestamps: true }
);

const spRecordingCourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    chapters: {
      type: [spRecordingChapterSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

spRecordingCourseSchema.index({ title: 1 });

export default mongoose.model("SPRecordingCourse", spRecordingCourseSchema);
