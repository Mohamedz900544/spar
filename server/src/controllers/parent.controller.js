import Enrollment from "../models/Enrollment.js";
import Round from "../models/Round.js";
import Session from "../models/Session.js";
import SessionRating from "../models/SessionRating.js";
import User from "../models/User.js";
import ChildPhoto from "../models/ChildPhoto.js";
import { uploadFromStream } from "../helpers.js";
import Lead from "../models/Lead.js";
import { normalizePhoneForWhatsApp } from "../services/whatsapp.service.js";

const normalizePhoneDigits = (value) => (value || "").toString().replace(/\D/g, "");

const toComparableEgyptPhone = (value) => {
    let digits = normalizePhoneDigits(value);
    if (!digits) return { local: "", core: "", raw: "" };
    if (digits.startsWith("00")) digits = digits.slice(2);
    if (digits.startsWith("20") && digits.length >= 12) {
        digits = `0${digits.slice(2)}`;
    }
    const core = digits.startsWith("0") ? digits.slice(1) : digits;
    return { local: digits, core, raw: normalizePhoneDigits(value) };
};

const phonesMatch = (left, right) => {
    const a = toComparableEgyptPhone(left);
    const b = toComparableEgyptPhone(right);
    if (!a.core || !b.core) return false;
    if (a.local === b.local || a.core === b.core) return true;
    if (a.core.length >= 9 && b.raw.endsWith(a.core)) return true;
    if (b.core.length >= 9 && a.raw.endsWith(b.core)) return true;
    return normalizePhoneForWhatsApp(left) === normalizePhoneForWhatsApp(right);
};

const formatDate = (value) => {
    if (!value) return null;
    try {
        const d = value instanceof Date ? value : new Date(value);
        return d.toISOString().slice(0, 10);
    } catch {
        return null;
    }
};

export const getDashboardData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).lean();
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userPhone = user.phone || "";
        const userPhoneMatch = toComparableEgyptPhone(userPhone);

        const leadCandidates = userPhoneMatch.core
            ? await Lead.find({
                $or: [
                    { source: "Free Session" },
                    { "freeSession.requested": true },
                    { "freeSession.isAssigned": true },
                    { status: "Demo Booked" },
                    { "freeSession.scheduledAt": { $ne: null } },
                ],
            }).lean()
            : [];

        const freeSessions = (leadCandidates || [])
            .filter((lead) => phonesMatch(userPhone, lead.phone || ""))
            .sort((a, b) => new Date(a.freeSession?.scheduledAt || a.createdAt || 0) - new Date(b.freeSession?.scheduledAt || b.createdAt || 0))
            .map((lead) => ({
                id: lead._id.toString(),
                parentName: lead.parentName || "-",
                childName: lead.childName || "-",
                childAge: lead.childAge || null,
                phone: lead.phone || "-",
                scheduledAt: lead.freeSession?.scheduledAt || null,
                durationMinutes: lead.freeSession?.durationMinutes || 60,
                endsAt: lead.freeSession?.endsAt || null,
                status: lead.status || "",
            }));

        const linkedCodes = (user.linkedRoundCodes || []).map((c) =>
            c.toString().toUpperCase().trim()
        );

        // all rounds of specific user
        const rounds = linkedCodes.length
            ? await Round.find({
                code: { $in: linkedCodes },
            }).populate({
                path: 'sessions',
            }).lean()
            : [];

        // session ratings for each user for each round
        const userRatings = await SessionRating.find({ user: req.user?._id })
        //contains each session Id with the rating
        const ratingMap = {}
        userRatings.map(r => {
            ratingMap[r.sessionId.toString()] = { rating: r?.rating, description: r.description }
        })

        const enrollments = linkedCodes.length
            ? await Enrollment.find({
                user: user._id,
                roundCode: { $in: linkedCodes },
            }).lean()
            : [];

        const enrollmentIds = enrollments.map((e) => e._id);

        const photos = enrollmentIds.length
            ? await ChildPhoto.find({
                enrollment: { $in: enrollmentIds },
            }).lean()
            : [];

        const studentPhotos = {};
        for (const p of photos) {
            const key = p.enrollment.toString();
            if (!studentPhotos[key]) studentPhotos[key] = [];
            studentPhotos[key].push({
                id: p._id.toString(),
                enrollmentId: key,
                url: p.url,
                caption: p.caption || "",
            });
        }

        return res.json({
            parent: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                photoUrl: user.photoUrl,
                children: user.children,
            },
            rounds: rounds.map((r) => ({
                id: r._id.toString(),
                code: r.code,
                name: r.name,
                level: r.level,
                campus: r.campus,
                startDate: formatDate(r.startDate),
                endDate: formatDate(r.endDate),
                sessionsCount: r.sessionsCount,
                weeksPerSession: r.weeksPerSession,
                sessions: r.sessions.map(s => ({
                    ...s,
                    userRating: ratingMap[s._id.toString()]?.rating || null,
                    feedback: ratingMap[s._id.toString()]?.description || null
                })),
                status: r.status,
            })),
            enrollments: enrollments.map((e) => ({
                id: e._id.toString(),
                childName: e.childName,
                level: e.level,
                sessionTitle: e.sessionTitle,
                status: e.status,
                note: e.note || "",
                roundCode: e.roundCode,
                phone: e.phone || "",
            })),
            photos: photos.map((p) => ({
                id: p._id.toString(),
                enrollmentId: p.enrollment.toString(),
                url: p.url,
                caption: p.caption || "",
            })),
            studentPhotos,
            freeSessions,
        });
    } catch (err) {
        console.error("Parent Dashboard error:", err);
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
}

export const linkRound = async (req, res) => {
    try {
        const { code, childId } = req.body;

        // Validation
        if (!code) return res.status(400).json({ message: "Round code is required" });
        if (!childId) return res.status(400).json({ message: "Child ID is required" }); // New validation

        const normalizedCode = code.toString().toUpperCase().trim();

        // Get User & Round
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const round = await Round.findOne({ code: normalizedCode }).populate('sessions').lean();
        if (!round) return res.status(404).json({ message: "Round code not found" });

        if (round.sessions && round.sessions.length > 0) {
            const capacity = round.sessions[0].capacity
            const enrolled = round.sessions[0].enrolled

            if (capacity && enrolled >= capacity) {
                return res.status(400).json({ message: "This round is fully booked." });
            }


        }

        // Find the specific child inside the user
        // We need this to get the child's name for the enrollment
        const child = user.children.id(childId); // specialized mongoose method for subdocs
        if (!child) return res.status(404).json({ message: "Child not found in parent profile" });

        // Check if ALREADY enrolled
        const existing = await Enrollment.findOne({
            childId,
            roundCode: normalizedCode,
            user: user._id
        });

        if (existing) {
            return res.status(400).json({ message: `Child ${child.name} is already enrolled in this round` });
        }


        await Enrollment.create({
            user: user._id,
            childId: child._id,
            childName: child.name,
            parentName: user.name,
            phone: user.phone,
            level: round.level || "Level 1",
            sessionTitle: round.name || "",
            status: "Pending",
            roundCode: normalizedCode,
            round: round._id
        });

        await Session.updateMany({ round: round._id }, {
            $inc: { enrolled: 1 }
        })

        // Update User: Link round code to Parent (Family History)
        await User.updateOne(
            { _id: user._id },
            { $addToSet: { linkedRoundCodes: normalizedCode } }
        );

        // Update User: Link round ID to Specific Child
        await User.updateOne(
            { _id: user._id, "children._id": childId },
            { $addToSet: { "children.$.enrolledRounds": round._id } }
        );

        // --- Return Updated Data ---
        // (This part remains the same)
        const allLinkedCodes = user.linkedRoundCodes || [];
        if (!allLinkedCodes.includes(normalizedCode)) allLinkedCodes.push(normalizedCode);

        const allEnrollments = await Enrollment.find({
            user: user._id,
            roundCode: { $in: allLinkedCodes },
        }).lean();

        const allEnrollmentIds = allEnrollments.map((e) => e._id);
        const allPhotos = await ChildPhoto.find({ enrollment: { $in: allEnrollmentIds } }).lean();

        // Also return the 'round' object so the frontend can add it to the 'rounds' list immediately
        return res.json({
            round: {
                id: round._id,
                code: round.code,
                name: round.name,
                level: round.level,
                campus: round.campus,
                startDate: round.startDate,
                endDate: round.endDate,
                sessionsCount: round.sessionsCount,
                weeksPerSession: round.weeksPerSession,
                status: round.status,
                sessions: round.sessions || []
            },
            enrollments: allEnrollments.map(e => ({ ...e, id: e._id })),
            photos: allPhotos
        });

    } catch (err) {
        console.error("Link round error:", err);
        return res.status(500).json({ message: "Server error", error: err.message });
    }
}

export const rateSession = async (req, res) => {
    try {
        // You might need to send childId from frontend if a parent has 2 kids in same round
        const { roundCode, sessionId, rating, childId, feedback: description } = req.body;

        if (!roundCode || !sessionId || rating == null) {
            return res.status(400).json({ message: "Missing rating fields" });
        }

        const round = await Round.findOne({ code: roundCode.toString().toUpperCase().trim() });
        if (!round) return res.status(404).json({ message: "Round not found" });

        // Find Enrollment to confirm user/child is in this round
        // If childId is sent, be specific. If not, maybe just check parent (but specific is better)
        const query = { roundCode, user: req.user._id };
        if (childId) query.childId = childId;

        const enrollment = await Enrollment.findOne(query);
        if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });

        // Update Rating
        const updatedRating = await SessionRating.findOneAndUpdate(
            {
                user: req.user._id,
                childId: enrollment.childId, // ✅ Use the ID from the enrollment
                round: round._id,
                sessionId,
            },
            { $set: { rating, sessionId, description } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Link to Session
        await Session.findByIdAndUpdate(sessionId, { $addToSet: { ratings: updatedRating._id } });

        return res.json({ message: "Rating saved" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
}

const buildParentProfileResponse = (user) => ({
    id: user._id.toString(),
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    children: user.children || [],
    campusCode: user.campusCode || "",
    photoUrl: user.photoUrl || "",
});

export const getParentProfile = async (req, res) => {
    const { name, phone, children: childrenStr, campusCode } = req.body

    let children;
    if (childrenStr) {
        try {
            children = JSON.parse(childrenStr);
        } catch {
            return res.status(400).json({ message: "Invalid children data" });
        }
    }

    const userDoc = await User.findById(req.user._id)
    if (!userDoc) return res.status(404).json({ message: "User not found" });

    if (name) userDoc.name = name;
    if (phone) userDoc.phone = phone;
    if (campusCode !== undefined) userDoc.campusCode = campusCode;
    if (children) userDoc.children = children;

    if (req.file) {
        try {
            const result = await uploadFromStream(req.file.buffer)
            userDoc.photoUrl = result.secure_url
        } catch (error) {
            return res.status(500).json({ message: error.message })
        }
    }

    const user = await userDoc.save()

    return res.json({ user: buildParentProfileResponse(user), message: "User Updated Successfully" })
}
