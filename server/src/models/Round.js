import mongoose from "mongoose";

const WEEKDAY_VALUES = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

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
    weeklySessionDay: {
      type: String,
      enum: WEEKDAY_VALUES,
      required: true,
    },
    weeklySessionTime: {
      type: String,
      required: true,
      trim: true,
      match: TIME_REGEX,
    },
    twoSessionsPerWeek: { type: Boolean, default: false },
    sessionsPerWeek: { type: Number, enum: [1, 2], default: 1 },
    secondWeeklySessionDay: {
      type: String,
      enum: WEEKDAY_VALUES,
      trim: true,
    },
    secondWeeklySessionTime: {
      type: String,
      trim: true,
      match: TIME_REGEX,
    },
    sessionDurationMinutes: { type: Number, default: 120 },
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
