import mongoose from "mongoose";

const ghostProcessKeyVersionSchema = new mongoose.Schema(
  {
    singleton_key: {
      type: String,
      default: "openai",
      unique: true,
      immutable: true,
    },
    openai_key_version: {
      type: String,
      required: true,
      trim: true,
    },
    refreshed_at: {
      type: Date,
      default: Date.now,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const GhostProcessKeyVersion = mongoose.model(
  "GhostProcessKeyVersion",
  ghostProcessKeyVersionSchema
);

export default GhostProcessKeyVersion;
