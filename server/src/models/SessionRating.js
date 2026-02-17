import mongoose from "mongoose";

const sessionRatingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    childId: { type: mongoose.Schema.Types.ObjectId },

    round: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Round",
      required: true,
    },
    sessionId: {
      type: mongoose.Types.ObjectId, // 1–6 من level1Sessions
      ref: "Session",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    description: {
      type: String,
    }
  },
  { timestamps: true }
);

sessionRatingSchema.index(
  { user: 1, round: 1, sessionId: 1 },
  { unique: true }
);

const SessionRating = mongoose.model("SessionRating", sessionRatingSchema);
export default SessionRating;
