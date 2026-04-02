// src/models/SiteVisit.js
import mongoose from "mongoose";

const siteVisitSchema = new mongoose.Schema({
  // Store the date part (YYYY-MM-DD) for easy daily grouping
  date: { type: String, required: true },
  // Unique browser visitor id (persisted in localStorage)
  visitorId: { type: String, required: true },
  // Total visits from this visitor on this date
  visits: { type: Number, default: 1 },
  // Last time we saw this visitor
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

// One record per visitor per day
siteVisitSchema.index({ date: 1, visitorId: 1 }, { unique: true });
siteVisitSchema.index({ lastSeen: 1 });

export default mongoose.model("SiteVisit", siteVisitSchema);
