// src/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from 'dotenv'
dotenv.config()
const JWT_SECRET = process.env.JWT_SECRET;

export const authRequired = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization || "";
    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      return res.status(401).json({ message: "No token provided" });
    }
    console.log('Authorizing')
    const payload = jwt.verify(token, JWT_SECRET);

    // يدعم كذا شكل للـ payload
    const userId = payload.id || payload._id || payload.userId || payload.sub;
    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // هيبقى موجود في الراوت بعد كده
    next();
  } catch (err) {
    console.error("authRequired error:", err.stack);

    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const parentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.role !== "parent") {
    return res.status(403).json({ message: "Only parents can access this area" });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};

export const instructorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (req.user.role !== "instructor") {
    return res.status(403).json({ message: "Instructors only" });
  }
  next();
};

export const agentOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  if (!["admin", "agent"].includes(req.user.role)) {
    return res.status(403).json({ message: "Agents or admins only" });
  }
  next();
};
