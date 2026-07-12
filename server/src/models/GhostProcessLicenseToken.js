import mongoose from "mongoose";

const ghostProcessLicenseTokenSchema = new mongoose.Schema(
  {
    license: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GhostProcessLicense",
      required: true,
      index: true,
    },
    token_hash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    issued_at: {
      type: Date,
      default: Date.now,
    },
    revoked_at: {
      type: Date,
      default: null,
    },
  },
  {
    versionKey: false,
  }
);

const GhostProcessLicenseToken = mongoose.model(
  "GhostProcessLicenseToken",
  ghostProcessLicenseTokenSchema
);

export default GhostProcessLicenseToken;
