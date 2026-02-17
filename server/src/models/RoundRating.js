// src/models/RoundRating.js
import mongoose from "mongoose";

const roundRatingSchema = new mongoose.Schema(
  {
    roundCode: { type: String, required: true }, // "SPRV-101"
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("RoundRating", roundRatingSchema);
