import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    parentName: { type: String, required: true },
    phone: { type: String, required: true },
    childAge: { type: Number },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ["New", "In Progress", "Closed"],
      default: "New",
    },
    internalNote: { type: String, default: "" },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export default mongoose.model("Message", messageSchema);