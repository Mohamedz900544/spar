import Round from "../models/Round.js";
import Session from "../models/Session.js";
import Enrollment from "../models/Enrollment.js";
import Message from "../models/Message.js";
import GalleryItem from "../models/GalleryItem.js";

export const getDashboardData = async (req, res) => {
  try {
    const sessions = await Session.find();
    const enrollments = await Enrollment.find();
    const rounds = await Round.find();
    const messages = await Message.find();
    const galleryItems = await GalleryItem.find();

    res.json({
      sessions,
      enrollments,
      rounds,
      messages,
      galleryItems,
      studentPhotos: {},
      roundRatings: []
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createRound = async (req, res) => {
  const round = await Round.create(req.body);
  res.json(round);
};

export const updateRoundStatus = async (req, res) => {
  const updated = await Round.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(updated);
};

export const createSession = async (req, res) => {
  const session = await Session.create(req.body);
  res.json(session);
};

export const updateSessionStatus = async (req, res) => {
  const updated = await Session.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(updated);
};

export const updateEnrollment = async (req, res) => {
  const updated = await Enrollment.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const updateMessage = async (req, res) => {
  const updated = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const createGalleryItem = async (req, res) => {
  const item = await GalleryItem.create(req.body);
  res.json(item);
};

export const toggleGalleryStatus = async (req, res) => {
  const updated = await GalleryItem.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(updated);
};

export const toggleGalleryFeatured = async (req, res) => {
  const updated = await GalleryItem.findByIdAndUpdate(req.params.id, { featured: req.body.featured }, { new: true });
  res.json(updated);
};
