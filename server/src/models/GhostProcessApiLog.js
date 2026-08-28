import mongoose from "mongoose";

const ghostProcessApiLogSchema = new mongoose.Schema(
  {
    license: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GhostProcessLicense",
      default: null,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      trim: true,
    },
    method: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    hardware_id: {
      type: String,
      trim: true,
      default: null,
    },
    app_version: {
      type: String,
      trim: true,
      default: null,
    },
    request_id: {
      type: String,
      trim: true,
      default: null,
    },
    status_code: {
      type: Number,
      required: true,
    },
    ok: {
      type: Boolean,
      default: false,
    },
    error_code: {
      type: String,
      default: null,
      trim: true,
    },
    message: {
      type: String,
      default: null,
      trim: true,
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    minimize: false,
    versionKey: false,
  }
);

ghostProcessApiLogSchema.index({ license: 1, created_at: -1 });
ghostProcessApiLogSchema.index({ endpoint: 1, created_at: -1 });

const GhostProcessApiLog = mongoose.model(
  "GhostProcessApiLog",
  ghostProcessApiLogSchema
);

export default GhostProcessApiLog;
