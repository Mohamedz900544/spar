// src/models/SiteVisit.js
import mongoose from "mongoose";

const siteVisitSchema = new mongoose.Schema({
  // Store the date part (YYYY-MM-DD) for easy daily grouping
  date: { type: String, required: true },
  // Unique browser visitor id (persisted in localStorage)
  visitorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// One record per visitor per day
siteVisitSchema.index({ date: 1, visitorId: 1 }, { unique: true });

export default mongoose.model("SiteVisit", siteVisitSchema);
