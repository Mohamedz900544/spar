// server/src/models/BlockProject.js
import mongoose from "mongoose";

const blockProjectSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 120,
      default: "My page",
    },

    // Flexible JSON payload for the builder
    // {
    //   builder: { rootSectionIds, sections, blocks },
    //   zoom?: number
    // }
    data: {
      type: Object,
      required: true,
    },

    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const BlockProject = mongoose.model("BlockProject", blockProjectSchema);
export default BlockProject;
