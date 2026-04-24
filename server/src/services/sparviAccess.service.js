import bcrypt from "bcryptjs";
import { randomInt, timingSafeEqual } from "crypto";
import SparviInstructorAccess from "../models/SparviInstructorAccess.js";

const SPARVI_ACCESS_KEY = "sparvi-instructor-password";
const PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const PASSWORD_GROUP_COUNT = 3;
const PASSWORD_GROUP_LENGTH = 4;

export const normalizeSparviInstructorPassword = (value = "") =>
  `${value}`.trim().toUpperCase();

const generatePasswordGroup = () =>
  Array.from(
    { length: PASSWORD_GROUP_LENGTH },
    () => PASSWORD_ALPHABET[randomInt(0, PASSWORD_ALPHABET.length)]
  ).join("");

export const generateSparviInstructorPassword = () =>
  Array.from({ length: PASSWORD_GROUP_COUNT }, generatePasswordGroup).join("-");

export const getSparviInstructorAccessSummary = async () => {
  const doc = await SparviInstructorAccess.findOne({ key: SPARVI_ACCESS_KEY })
    .select("passwordHash rotatedAt")
    .lean();

  return {
    hasActivePassword: Boolean(doc?.passwordHash),
    rotatedAt: doc?.rotatedAt ? new Date(doc.rotatedAt).getTime() : null,
  };
};

export const rotateSparviInstructorPassword = async () => {
  const password = generateSparviInstructorPassword();
  const passwordHash = await bcrypt.hash(
    normalizeSparviInstructorPassword(password),
    12
  );
  const rotatedAt = new Date();

  await SparviInstructorAccess.findOneAndUpdate(
    { key: SPARVI_ACCESS_KEY },
    {
      $set: {
        key: SPARVI_ACCESS_KEY,
        passwordHash,
        rotatedAt,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return {
    password,
    rotatedAt: rotatedAt.getTime(),
  };
};

export const verifySparviInstructorPassword = async (candidatePassword) => {
  const normalizedPassword = normalizeSparviInstructorPassword(candidatePassword);
  if (!normalizedPassword) {
    return false;
  }

  const doc = await SparviInstructorAccess.findOne({ key: SPARVI_ACCESS_KEY })
    .select("passwordHash")
    .lean();

  if (!doc?.passwordHash) {
    return false;
  }

  return bcrypt.compare(normalizedPassword, doc.passwordHash);
};

export const constantTimeSecretEquals = (left = "", right = "") => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
};
