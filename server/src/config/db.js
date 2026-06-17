// server/src/config/db.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sparvi_lab";
const LEGACY_ADMIN_EMAIL = "admin@sparvilb.com";

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    await ensureDefaultAdmin();

    // Clean up old SiteVisit data without visitorId (one-time migration)
    try {
      const col = mongoose.connection.collection("sitevisits");
      const removed = await col.deleteMany({ visitorId: { $exists: false } });
      if (removed.deletedCount > 0) {
        await col.dropIndexes();
      }
    } catch (_) {
      // Collection may not exist yet.
    }
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

const ensureDefaultAdmin = async () => {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = `${process.env.ADMIN_PASSWORD || ""}`;
  const name = (process.env.ADMIN_NAME || "Main Admin").trim();

  if (!email || !password) {
    console.warn(
      "ADMIN_EMAIL and ADMIN_PASSWORD are required to sync the admin account."
    );
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        passwordHash,
        phone: process.env.ADMIN_PHONE || "123456789",
        role: "admin",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (email !== LEGACY_ADMIN_EMAIL) {
    await User.deleteOne({ email: LEGACY_ADMIN_EMAIL, role: "admin" });
  }
};
