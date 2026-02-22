import mongoose from "mongoose";
import Enrollment from "../models/Enrollment.js";
import Round from "../models/Round.js";
import Session from "../models/Session.js";
import SessionRating from "../models/SessionRating.js";
import User from "../models/User.js";
import ChildPhoto from "../models/ChildPhoto.js";

export const getRounds = async (req, res) => {
    try {
        const rounds = await Round.find().sort({ createdAt: 'desc' });
        return res.json({ rounds })
    } catch (error) {
        console.log(error.message)
        return res.sendStatus(500)
    }
}

/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */

// admin 
export const getRoundStudentsWithSessionAndRatings = async (req, res) => {
    const { roundId } = req.params;

    try {
        // 1. Fetch the Round (without populating via virtual)
        const roundDocument = await Round.findById(roundId, "-sessions -__v -createdAt -updatedAt");
        if (!roundDocument) return res.status(404).json({ message: "Round not found" });

        const round = roundDocument.toObject({ virtuals: true });

        // 2. Get Enrollments (The Source of Truth)
        // This finds everyone actually enrolled in this round
        const enrollments = await Enrollment.aggregate([
            {
                $match: { round: new mongoose.Types.ObjectId(roundId) }
            },
            {
                $lookup: {
                    from: "childphotos",
                    localField: "_id",
                    foreignField: "enrollment",
                    as: "childPhotos"
                }
            }
        ]);

        if (enrollments.length === 0) {
            round.roundStudents = [];
            return res.json(round);
        }

        // 3. Get unique Parent IDs from the enrollments
        const distinctParentIds = [...new Set(enrollments.map(e => e.user.toString()))];

        // 4. Fetch User Details for these Parents
        const parents = await User.find(
            { _id: { $in: distinctParentIds } },
            "-passwordHash -role -__v -createdAt -updatedAt"
        ).lean();

        // 5. Get Ratings
        const sessionRatings = await SessionRating.find({ round: roundId })
            .populate('sessionId', "title date")
            .lean();

        // 6. Merge Data (Parent + Children + Ratings)
        round.roundStudents = parents.map(parent => {

            const myRatings = sessionRatings.filter(rating =>
                rating.user && rating.user.toString() === parent._id.toString()
            );
            // Find enrollments for this specific parent
            const myEnrollments = enrollments.filter(e => e.user.toString() === parent._id.toString());

            const childrenDetails = myEnrollments.map(enrollment => {

                return {
                    enrollmentId: enrollment._id,
                    childId: enrollment.childId,
                    name: enrollment.childName,
                    status: enrollment.status,
                    photos: enrollment.childPhotos || [],
                };
            });
            return {
                ...parent,
                children: childrenDetails,
                // These are just flat arrays if your frontend still needs them at root
                ratings: myRatings,
                childPhotos: childrenDetails.flatMap(c => c.photos)
            };
        });

        return res.json(round);

    } catch (error) {
        console.error("Get round students error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}

export const getOneRound = async (req, res) => {
    try {
        const round = await Round.findById(req.params.id).populate("sessions");
        if (!round) {
            return res.status(404).json({ message: "Round not found" });
        }
        res.json({ round });
    } catch (err) {
        console.error("Get round error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

const generateRoundCode = () => {
    const random = Math.floor(1000 + Math.random() * 9999)
    return `SPRV-${random}`
}

export const createRound = async (req, res) => {
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = generateRoundCode()
        console.log(code)
        const existingRound = await Round.findOne({ code })
        console.log(existingRound)
        console.log(isUnique)
        if (!existingRound) {
            isUnique = true;
        };
    }

    try {
        const { sessions, ...roundDetails } = req.body;

        const round = await Round.create({ ...roundDetails, code });

        if (sessions && sessions.length > 0) {
            const createdSessions = await Session.insertMany(sessions.map(session => ({
                level: session?.level || round.level,
                campus: session?.campus || round.campus,
                ...session,
                round: round._id
            })))

            round.sessions = createdSessions.map(s => s._id)
            await round.save()
        }
        res.status(201).json(round);
    } catch (err) {
        console.error("Create round error:", err);
        if (err.code === 11000) {
            res.status(400).json({ message: "code already exists" })
        }
        res.status(500).json({ message: "Server error" });
    }
}

export const updateRoundStatus = async (req, res) => {
    try {
        const updated = await Round.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        console.error("Update round status error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

export const updateRound = async (req, res) => {
    try {
        const updated = await Round.findByIdAndUpdate(
            req.params.id,
            req.body, // Update the whole object or specific fields sent in body
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: "Round not found" });
        }
        res.json(updated);
    } catch (err) {
        console.error("Update round error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

export const deleteRound = async (req, res) => {
    try {
        const round = await Round.findById(req.params.id);
        if (!round) {
            return res.status(404).json({ message: "Round not found" });
        }

        const enrollments = await Enrollment.find({ round: round._id }).select("_id").lean();
        const enrollmentIds = enrollments.map((e) => e._id);

        await Promise.all([
            Session.deleteMany({ round: round._id }),
            Enrollment.deleteMany({ round: round._id }),
            SessionRating.deleteMany({ round: round._id }),
            enrollmentIds.length
                ? ChildPhoto.deleteMany({ enrollment: { $in: enrollmentIds } })
                : Promise.resolve(),
            User.updateMany(
                { linkedRounds: round._id },
                { $pull: { linkedRounds: round._id } }
            ),
            User.updateMany(
                { linkedRoundCodes: round.code },
                { $pull: { linkedRoundCodes: round.code } }
            ),
            User.updateMany(
                { "children.enrolledRounds": round._id },
                { $pull: { "children.$[].enrolledRounds": round._id } }
            ),
        ]);

        await Round.findByIdAndDelete(round._id);

        return res.json({ message: "Round deleted" });
    } catch (err) {
        console.error("Delete round error:", err);
        return res.status(500).json({ message: "Server error" });
    }
};
