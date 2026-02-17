import mongoose from "mongoose";

const roundSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    level: { type: String, required: true, trim: true },
    campus: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    sessionsCount: { type: Number, default: 6 },
    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session"
      }
    ],
    weeksPerSession: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["Active", "Planned", "Completed"],
      default: "Planned",
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

roundSchema.virtual('roundStudents', {
  ref: "User",
  localField: "_id",
  foreignField: "linkedRounds"
})

const Round = mongoose.model("Round", roundSchema);


export default Round;
