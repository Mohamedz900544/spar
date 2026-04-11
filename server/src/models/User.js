// src/models/User.js
import mongoose from "mongoose";

const childSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    age: {
      type: Number,
      min: 3,
      max: 18,
      required: true,
    },
    enrolledRounds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Round",
      },
    ],
  }, { timestamps: true }
);

const TIME_RANGE_REGEX = /^(?:([01]\d|2[0-3]):([0-5]\d)|24:00)$/;

const workingHourSlotSchema = new mongoose.Schema(
  {
    start: {
      type: String,
      required: true,
      trim: true,
      match: TIME_RANGE_REGEX,
    },
    end: {
      type: String,
      required: true,
      trim: true,
      match: TIME_RANGE_REGEX,
    },
  },
  { _id: false }
);

const workingHoursDaysSchema = new mongoose.Schema(
  {
    sunday: { type: [workingHourSlotSchema], default: [] },
    monday: { type: [workingHourSlotSchema], default: [] },
    tuesday: { type: [workingHourSlotSchema], default: [] },
    wednesday: { type: [workingHourSlotSchema], default: [] },
    thursday: { type: [workingHourSlotSchema], default: [] },
    friday: { type: [workingHourSlotSchema], default: [] },
    saturday: { type: [workingHourSlotSchema], default: [] },
  },
  { _id: false }
);

const workingHoursSchema = new mongoose.Schema(
  {
    timezone: {
      type: String,
      trim: true,
      default: "Africa/Cairo",
    },
    slotDurationMinutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 180,
    },
    days: {
      type: workingHoursDaysSchema,
      default: () => ({}),
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // اسم ولي الأمر أو الأدمن
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    // بنخزن هنا الـ bcrypt hash مش الباسورد الخام
    passwordHash: {
      type: String,
      required: true,
      minlength: 8, // الهـاش نفسه طويل، مفيش مشكلة
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    token: {
      type: mongoose.Types.ObjectId,
      ref: "Token"
    },
    // يفرق بين لوحة الأب ولوحة الأدمن
    role: {
      type: String,
      enum: ["parent", "admin", "instructor", "agent"],
      default: "parent",
    },

    // أولاد ولي الأمر (لو حابب تستخدمها بعدين)
    children: {
      type: [childSchema],
      default: [],
    },
    photoUrl: { type: String, default: "" },
    // كود الكامبس (لو هتستخدمه في الفروع)
    campusCode: {
      type: String,
      trim: true,
    },

    phone: { type: String, default: "" },
    /* 
      ✅ هنستخدمها مع parent dashboard + الراوتر اللي بيعمل populate
      هنا بنخزن IDs بتاعة الـ Round عشان نقدر نعمل:
      User.findById(...).populate("linkedRounds")
    */
    linkedRounds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Round",
      },
    ],

    /*
      اختياري: لو حابب كمان تخزن الكود كنص (SPRV-101 ...)
      ممكن تستخدمه في لوجيك تاني أو للبحث
    */
    linkedRoundCodes: [
      {
        type: String,
        trim: true,
      },
    ],
    workingHours: {
      type: workingHoursSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash; // مهم ما نرجعش الهـاش في الـ API
      },
    },
  }
);

// تأكيد إن الإيميل unique فعلاً
// userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
export default User;
