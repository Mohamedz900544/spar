// src/models/SiteVisit.js
import mongoose from "mongoose";

const siteVisitSchema = new mongoose.Schema({
  // Store a fingerprint so we count unique visitors, not page reloads
  fingerprint: { type: String, required: true },
  // Store only the date part (YYYY-MM-DD) for easy daily grouping
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Composite unique index: one record per fingerprint per day
siteVisitSchema.index({ fingerprint: 1, date: 1 }, { unique: true });
// Index on date for fast daily count queries
siteVisitSchema.index({ date: 1 });

export default mongoose.model("SiteVisit", siteVisitSchema);
