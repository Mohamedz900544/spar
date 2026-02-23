// src/models/Enrollment.js
import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    // ولي الأمر (لو موجود من التوكن)
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    childId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },

    childName: { type: String, required: true, trim: true },
    parentName: { type: String, trim: true },
    phone: { type: String, trim: true },

    level: { type: String, required: true },          // Level 1 / Level 2 ...
    sessionTitle: { type: String, required: true },   // "Electricity Basics"

    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Waiting", "Cancelled"],
      default: "Pending",
    },

    note: { type: String, trim: true },

    // ممكن يبقى فاضي لحد ما الأب يدخل الكود
    roundCode: { type: String, trim: true, default: "" },
    round: { type: mongoose.Types.ObjectId, ref: "Round" },
    attendance: [
      {
        session: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
        present: { type: Boolean, default: false },
        markedAt: { type: Date, default: Date.now },
        markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: true }
);

const Enrollment = mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
