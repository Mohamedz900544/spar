import mongoose from "mongoose";

const ghostProcessLicenseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: 120,
    },
    customer_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    hardware_id: {
      type: String,
      trim: true,
      default: null,
      maxlength: 256,
    },
    remaining_questions: {
      type: Number,
      min: 0,
      default: 0,
    },
    window_start: {
      type: Date,
      default: null,
    },
    window_end: {
      type: Date,
      default: null,
    },
    window_timezone: {
      type: String,
      trim: true,
      default: "Africa/Cairo",
      maxlength: 80,
    },
    status: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
      index: true,
    },
    openai_key_version_ack: {
      type: String,
      default: null,
      trim: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
    activated_at: {
      type: Date,
      default: null,
    },
    last_seen_at: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

ghostProcessLicenseSchema.index({ hardware_id: 1 });

const GhostProcessLicense = mongoose.model(
  "GhostProcessLicense",
  ghostProcessLicenseSchema
);

export default GhostProcessLicense;
