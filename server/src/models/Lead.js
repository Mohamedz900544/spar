import mongoose from "mongoose";

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Demo Booked",
  "Follow-up",
  "Busy Call Later",
  "Closed - Won",
  "Closed - Lost",
];

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByName: { type: String, trim: true, default: "" },
    createdByRole: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    parentName: { type: String, required: true, trim: true, maxlength: 200 },
    childName: { type: String, required: true, trim: true, maxlength: 200 },
    childAge: { type: Number, min: 3, max: 18 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    source: {
      type: String,
      enum: ["Free Session", "Contact Form", "Manual", "Other"],
      default: "Free Session",
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "New",
    },
    lostReason: { type: String, trim: true, default: "" },
    paymentLink: { type: String, trim: true, default: "" },
    notes: { type: [noteSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    callLater: {
      scheduledAt: { type: Date, default: null },
      scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      scheduledByName: { type: String, trim: true, default: "" },
      scheduledAtSet: { type: Date, default: null },
      reminderSentAt: { type: Date, default: null },
      reminderLastAttemptAt: { type: Date, default: null },
      reminderLastError: { type: String, trim: true, default: "" },
    },
    freeSession: {
      requested: { type: Boolean, default: false },
      isAssigned: { type: Boolean, default: false },
      scheduledAt: { type: Date, default: null },
      durationMinutes: { type: Number, default: 60, min: 1, max: 600 },
      endsAt: { type: Date, default: null },
      followUpDueAt: { type: Date, default: null },
      movedToFollowUpAt: { type: Date, default: null },
      instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      instructorName: { type: String, trim: true, default: "" },
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      assignedByName: { type: String, trim: true, default: "" },
      assignedAt: { type: Date, default: null },
      reminderSentAt: { type: Date, default: null },
      parentWelcomeSentAt: { type: Date, default: null },
      parentAssignmentNotifiedAt: { type: Date, default: null },
      parentReminderSentAt: { type: Date, default: null },
    },
    trainerEvaluation: {
      strengths: { type: String, trim: true, default: "" },
      favoriteProject: { type: String, trim: true, default: "" },
      updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      updatedByName: { type: String, trim: true, default: "" },
      updatedAt: { type: Date, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ phone: 1 });

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;
