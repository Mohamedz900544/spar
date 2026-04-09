import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import './config/multer.js'
import publicBlocksRoutes from "./routes/blocks.public.routes.js";
import authRoutes from "./routes/authRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import adminRoutes from "./routes/admin.routes.js";
import contactRoutes from "./routes/contactRoutes.js";
import blocksRoutes from "./routes/blocks.routes.js";
import roundRoutes from "./routes/round.routes.js";
import sessionRoutes from "./routes/session.routes.js";
import galleryRoutes from "./routes/gallery.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import salesRoutes from "./routes/sales.routes.js";
import whatsappWebhookRoutes from "./routes/whatsappWebhook.routes.js";
// import "./config/cloudinary.js";
import "./automatingUpdatingStatusOfSession.js"
import "./automatingLeadFollowUpStatus.js";
import enrollmentRoutes from "./routes/enrollment.routes.js";
import fractionsRoutes from "./routes/fractions.js";
import visitRoutes from "./routes/visit.routes.js";
// import fractionsRoutes from './routes/fractions'



const app = express();

/* ------------ CORS مضبوط بدون CLIENT_URL ------------- */

const allowedOrigins = [
  "http://localhost:5174",
  "http://localhost:5173",
  "https://sparvilab.com",
  "https://www.sparvilab.com",
  process.env.CLIENT_URL
];

app.use((req, res, next) => {
  const isVisitRoute = req.path === "/api/track-visit";

  const options = isVisitRoute
    ? { origin: true, credentials: true }
    : {
        origin: (origin, callback) => {
          if (!origin) return callback(null, true);
          if (allowedOrigins.includes(origin)) {
            return callback(null, true);
          }
          return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
      };

  return cors(options)(req, res, next);
});

// ❌ متحطّش app.options("*", cors()) مع Express 5
// preflight بتتعالج أوتوماتيك من cors middleware اللي فوق

/* ------------------------------------------------------ */

app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "Sparvi Lab backend running 🚀" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/admin/rounds', roundRoutes)
app.use('/api/admin/sessions', sessionRoutes)
app.use('/api/admin/enrollments', enrollmentRoutes)
app.use('/api/admin/gallery', galleryRoutes)
app.use("/api/instructor", instructorRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blocks", publicBlocksRoutes); // <-- share is public
app.use("/api/blocks", blocksRoutes);
app.use("/api/fractions", fractionsRoutes);
app.use("/api", visitRoutes);
app.use("/webhook/whatsapp", whatsappWebhookRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

const PORT = process.env.PORT || 8300;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
});

export default app
