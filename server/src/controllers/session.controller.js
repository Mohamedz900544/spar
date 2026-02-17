import Session from "../models/Session.js";

export async function getAllSessions(req, res) {
    try {
        console.log(req.query.date)
        const date = req.query?.date ? req.query.date.replace(/\//g, '-') : null;
        console.log(date)
        const filter = date ? { date } : {}
        const sessions = await Session.find(filter).populate('round', { sessions: 0 }).sort();
        return res.json({ sessions })
    } catch (error) {
        console.log(error.stack)
        return res.sendStatus(500)
    }
}

export async function createSession(req, res) {
    try {
        const session = await Session.create(req.body);
        res.status(201).json(session);
    } catch (err) {
        console.error("Create session error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

export async function updateSessionStatus(req, res) {
    try {
        const updated = await Session.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        console.error("Update session status error:", err);
        res.status(500).json({ message: "Server error" });
    }
}

export const updateSession = async (req, res) => {
    const sessionId = req.params.id
    const session = await Session.findById(sessionId)
    if (!session) {
        return res.status(404).json({ message: "session not found" })
    }

    const { title, campus, capacity, time, date, description } = req.body

    session.title = title || session.title;
    session.campus = campus || session.campus;
    session.capacity = capacity || session.capacity;
    session.time = time || session.time;
    session.date = date || session.date;
    session.description = description || session.description;

    await session.save()
    return res.json({ session, message: "session updated successfully" })
}

export const deleteSession = async (req, res) => {
    try {
        console.log(req.params.id)
        const session = await Session.findById(req.params.id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        await session.deleteOne();

        const sessions = await Session.find();

        res.json({ message: "Session deleted successfully", sessions });
    } catch (err) {
        console.log(err.message)
        res.status(500).json({ message: "Server error" });
    }
}