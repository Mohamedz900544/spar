import mongoose from "mongoose";

const childPhotoSchema = new mongoose.Schema(
  {
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const ChildPhoto = mongoose.model("ChildPhoto", childPhotoSchema);
export default ChildPhoto;
