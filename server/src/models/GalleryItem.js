// src/models/GalleryItem.js
import mongoose from "mongoose";

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    // date: { type: String, required: true }, // "2024-12-20"
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    featured: { type: Boolean, default: false },
    fileName: { type: String }, // اسم الصورة في التخزين
  },
  { timestamps: true }
);

export default mongoose.model("GalleryItem", galleryItemSchema);
