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
    hidden_from_logs: {
      type: Boolean,
      default: false,
      index: true,
    },
    logs_hidden_at: {
      type: Date,
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
ghostProcessConsumptionRequestSchema.index({
  license: 1,
  hidden_from_logs: 1,
  created_at: -1,
});
ghostProcessConsumptionRequestSchema.index({
  hidden_from_logs: 1,
  created_at: -1,
});

const GhostProcessConsumptionRequest = mongoose.model(
  "GhostProcessConsumptionRequest",
  ghostProcessConsumptionRequestSchema
);

export default GhostProcessConsumptionRequest;
