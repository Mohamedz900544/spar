import mongoose from "mongoose";

const inboxMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    from: {
      type: String,
      enum: ["customer", "agent"],
      required: true,
    },
    text: { type: String, default: "" },
    timestamp: { type: Date, required: true },
    rawPayload: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model("InboxMessage", inboxMessageSchema);
