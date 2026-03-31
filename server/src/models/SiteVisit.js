// src/models/SiteVisit.js
import mongoose from "mongoose";

const siteVisitSchema = new mongoose.Schema({
  // Store the date part (YYYY-MM-DD) for easy daily grouping
  date: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Index on date for fast daily count queries
siteVisitSchema.index({ date: 1 });

export default mongoose.model("SiteVisit", siteVisitSchema);
