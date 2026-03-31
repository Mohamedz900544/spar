// server/src/config/db.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sparvi_lab";

export const connectDB = async () => {
  try {
    console.log(MONGO_URI)
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");

    await ensureDefaultAdmin();

    // Clean up old SiteVisit data without visitorId (one-time migration)
    try {
      const col = mongoose.connection.collection("sitevisits");
      const removed = await col.deleteMany({ visitorId: { $exists: false } });
      if (removed.deletedCount > 0) {
        console.log(`✅ Removed ${removed.deletedCount} old SiteVisit records without visitorId`);
        await col.dropIndexes();
      }
    } catch (_) { /* collection may not exist yet */ }
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const ensureDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || "admin@sparvilab.com";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const name = "Main Admin";

  const admin = await User.findOne({ email });
  if (admin) {
    console.log("ℹ️ Admin user already exists:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    passwordHash, // ✅ المطلوب في الـ schema
    phone: "123456789",
    role: "admin",
  });

  console.log("✅ Default admin user created:", email);
};
