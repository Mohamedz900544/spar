// src/models/Session.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    round: { type: mongoose.Schema.Types.ObjectId, ref: "Round" },
    level: { type: String, required: true }, // "Level 1"
    title: { type: String, required: true },
    date: { type: String, required: true },  // "2025-01-10"
    time: { type: String, required: true },  // "16:00"
    campus: { type: String, required: true },
    capacity: { type: Number, default: 12 },
    enrolled: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Active", "Full", "Draft", "Completed"],
      default: "Draft",
    },
    ratings: [
      {
        type: mongoose.Types.ObjectId,
        ref: "SessionRating"
      }
    ],
    description: {
      type: String,

    }
  },
  { timestamps: true }
);
// sessionSchema.virtual('ratings',)
export default mongoose.model("Session", sessionSchema);
