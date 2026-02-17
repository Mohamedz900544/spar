import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { authRequired } from "../middleware/auth.js";
import { upload2 } from "../config/multer.js";
import { body, validationResult } from 'express-validator'
import { createValidationToken, sendVerificationMail, uploadFromStream } from "../helpers.js";
import jsonwebtoken from 'jsonwebtoken'
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "change_this_in_env";

// ✅ نولّد توكن بالطريقة اللي الميدل وير متوقعها
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(), // 👈 ده اللي authRequired بيشوفه أول حاجة
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ✅ نرجّع يوزر نظيف من غير الباسورد
const buildSafeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone, // ✅ add
  role: user.role,
  children: user.children || [],
  campusCode: user.campusCode || null,
  photoUrl: user.photoUrl,
});

// ===================================
// SIGNUP
// ===================================
router.post("/signup", upload2.single('profilePhoto'), [
  body('name')
    .notEmpty().withMessage('Name is Required'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Not Valid Email'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }),
  body('phone')
    .notEmpty().withMessage('phone is required')
    .isMobilePhone().withMessage('Phone is not valid'),
], async (req, res) => {
  try {
    const { name, email, password, phone, role, child, campusCode } = req.body;

    const result = validationResult(req)

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.mapped(), message: "Invalid required Fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    let parsedChild = child;
    if (typeof child === "string") {
      try {
        parsedChild = JSON.parse(child);
      } catch (e) {
        console.log("Child data is not a JSON string, keeping raw value", e.message);
      }
    }
    const childrenArray =
      parsedChild && parsedChild.name && parsedChild.age
        ? [{ name: parsedChild.name, age: parsedChild.age }]
        : [];
    let photoUrl = undefined;
    if (req.file) {
      try {
        const result = await uploadFromStream(req.file.buffer);
        photoUrl = result.secure_url;
        console.log("Upload success:", photoUrl);

      } catch (error) {
        console.error("Cloudinary Error:", error);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }
    // == Email Verification == 
    // const verificationToken = createValidationToken({ email })
    // const sendResult = await sendVerificationMail(email, verificationToken)

    // console.log(sendResult)
    // if (sendResult.rejected && sendResult.rejected.length) {

    //   return res.status(400).json({ message: "failed to send email" })
    // }

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: role === "admin" ? "admin" : "parent",
      children: childrenArray,
      campusCode: campusCode || undefined,
      photoUrl
    });

    const token = generateToken(user);
    const safeUser = buildSafeUser(user);

    return res.status(201).json({
      message: "User created and Email has been sent to your mails please check your mails",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      phone: phone || "",
      passwordHash,
      role: role === "admin" ? "admin" : "agent",
    });

    const token = generateToken(user);
    const safeUser = buildSafeUser(user);

    return res.status(201).json({
      message: "User created",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===================================
// LOGIN
// ===================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "email isn't used" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Password is incorrect" });
    }

    // if (!user.isVerified) {
    //   const verificationToken = createValidationToken({ email: user.email })
    //   await sendVerificationMail(user.email, verificationToken)
    //   return res.status(401).json({ message: "email is not verified" })
    // }

    const token = generateToken(user);
    const safeUser = buildSafeUser(user);

    return res.json({
      message: "Logged in",
      token,
      user: safeUser,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ===================================
// ME (استخدم نفس الـ middleware)
// ===================================
router.get("/me", authRequired, async (req, res) => {
  try {
    const safeUser = buildSafeUser(req.user);
    return res.json({ user: safeUser });
  } catch (err) {
    console.error("Me error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
});


// email verification
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  console.log('verification')
  if (!token) {
    return res.status(401).json({ message: "No Token Found" })
  }
  try {
    const decoded = jsonwebtoken.verify(token, process.env.VERIFICATION_SECRET)

    const result = await User.updateOne(
      { email: decoded.email },
      { $set: { isVerified: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User has been verified successfully" });
  } catch (error) {
    console.log(error.message)
    return res.status(400).json({ message: "Invalid or expired token" });
  }
})
export default router;
