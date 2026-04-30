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

const WEEKDAY_INDEX = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
};

const toDateOnly = (value) => {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
};

const createWeeklySessions = (roundDetails) => {
    const {
        startDate,
        endDate,
        weeklySessionDay,
        weeklySessionTime,
        level,
        campus,
        sessionDurationMinutes = 120,
    } = roundDetails;

    const weekdayIndex = WEEKDAY_INDEX[weeklySessionDay];
    if (weekdayIndex === undefined) {
        throw new Error("Valid weekly session day is required");
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(weeklySessionTime || "")) {
        throw new Error("Valid weekly session time is required");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        throw new Error("Valid start date and end date are required");
    }

    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    if (start > end) {
        throw new Error("End date must be after start date");
    }

    const firstSessionDate = new Date(start);
    const daysUntilSession = (weekdayIndex - firstSessionDate.getUTCDay() + 7) % 7;
    firstSessionDate.setUTCDate(firstSessionDate.getUTCDate() + daysUntilSession);

    const sessions = [];
    for (
        const current = new Date(firstSessionDate);
        current <= end;
        current.setUTCDate(current.getUTCDate() + 7)
    ) {
        sessions.push({
            title: `Session ${sessions.length + 1}`,
            date: toDateOnly(current),
            time: weeklySessionTime,
            durationMinutes: sessionDurationMinutes,
            level,
            campus,
            status: "Draft",
        });
    }

    return sessions;
};

export const createRound = async (req, res) => {
    let code;
    let isUnique = false;

    while (!isUnique) {
        code = generateRoundCode()
        const existingRound = await Round.findOne({ code })
        if (!existingRound) {
            isUnique = true;
        };
    }

    try {
        const { sessions, ...roundDetails } = req.body;
        const sessionDurationMinutes = 120;
        const normalizedRoundDetails = {
            ...roundDetails,
            sessionDurationMinutes,
        };

        const sessionsToCreate =
            sessions && sessions.length > 0
                ? sessions.map((session) => ({
                    ...session,
                    durationMinutes: sessionDurationMinutes,
                }))
                : createWeeklySessions(normalizedRoundDetails);

        if (!sessionsToCreate.length) {
            return res.status(400).json({
                message: "No sessions fall between the selected start and end dates for this weekday",
            });
        }

        const round = await Round.create({
            ...normalizedRoundDetails,
            sessionsCount: sessionsToCreate.length,
            code,
        });

        if (sessionsToCreate.length > 0) {
            const createdSessions = await Session.insertMany(sessionsToCreate.map(session => ({
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
            return res.status(400).json({ message: "code already exists" })
        }
        if (err.message?.includes("required") || err.message?.includes("Valid") || err.message?.includes("End date")) {
            return res.status(400).json({ message: err.message });
        }
        return res.status(500).json({ message: "Server error" });
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

export const addRoundSession = async (req, res) => {
    try {
        const round = await Round.findById(req.params.id);
        if (!round) {
            return res.status(404).json({ message: "Round not found" });
        }

        const {
            title,
            date,
            time,
            campus,
            capacity,
            description,
            status,
        } = req.body;

        if (!title || !date || !time) {
            return res.status(400).json({ message: "Title, date, and time are required" });
        }

        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
            return res.status(400).json({ message: "Valid session time is required" });
        }

        const sessionDate = new Date(date);
        if (Number.isNaN(sessionDate.getTime())) {
            return res.status(400).json({ message: "Valid session date is required" });
        }

        const session = await Session.create({
            round: round._id,
            level: round.level,
            title: title.trim(),
            date: toDateOnly(sessionDate),
            time,
            durationMinutes: round.sessionDurationMinutes || 120,
            campus: campus?.trim() || round.campus,
            capacity: Number(capacity) || 12,
            status: status || "Draft",
            description: description?.trim() || "",
        });

        round.sessions.push(session._id);
        round.sessionsCount = round.sessions.length;
        await round.save();

        return res.status(201).json({ session, round });
    } catch (err) {
        console.error("Add round session error:", err);
        return res.status(500).json({ message: "Server error" });
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
