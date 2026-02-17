import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    customerPhone: { type: String, required: true, index: true },
    lastMessageText: { type: String, default: "" },
    lastMessageAt: { type: Date },
    status: {
      type: String,
      enum: ["new", "open", "closed"],
      default: "new",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);
