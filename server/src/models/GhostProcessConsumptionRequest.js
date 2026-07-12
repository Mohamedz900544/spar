import mongoose from "mongoose";

const ghostProcessConsumptionRequestSchema = new mongoose.Schema(
  {
    license: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GhostProcessLicense",
      required: true,
      index: true,
    },
    request_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    hardware_id: {
      type: String,
      required: true,
      trim: true,
      maxlength: 256,
    },
    remaining_before: {
      type: Number,
      default: null,
    },
    remaining_after: {
      type: Number,
      default: null,
    },
    response_json: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
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

ghostProcessConsumptionRequestSchema.index(
  { license: 1, request_id: 1 },
  { unique: true }
);

const GhostProcessConsumptionRequest = mongoose.model(
  "GhostProcessConsumptionRequest",
  ghostProcessConsumptionRequestSchema
);

export default GhostProcessConsumptionRequest;
