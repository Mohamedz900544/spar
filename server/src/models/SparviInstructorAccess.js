import mongoose from "mongoose";

const sparviInstructorAccessSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "sparvi-instructor-password",
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 20,
    },
    rotatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const SparviInstructorAccess = mongoose.model(
  "SparviInstructorAccess",
  sparviInstructorAccessSchema
);

export default SparviInstructorAccess;
