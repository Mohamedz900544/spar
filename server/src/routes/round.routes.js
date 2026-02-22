import { Router } from 'express'
import { createRound, deleteRound, getOneRound, getRounds, getRoundStudentsWithSessionAndRatings, updateRound, updateRoundStatus } from "../controllers/round.controller.js";
import { adminOnly, authRequired } from '../middleware/auth.js';
import Enrollment from '../models/Enrollment.js';
import { upload2 } from '../config/multer.js';
import { uploadFromStream } from '../helpers.js';
import ChildPhoto from '../models/ChildPhoto.js';

const router = Router()

// /api/admin/rounds/.....
router.get('/', authRequired, adminOnly, getRounds)
router.get('/:roundId/students', authRequired, adminOnly, getRoundStudentsWithSessionAndRatings)

router.post('/', authRequired, adminOnly, createRound);

router.patch("/:id/status", authRequired, adminOnly, updateRoundStatus);

router.get("/:id", authRequired, adminOnly, getOneRound);

router.put("/:id", authRequired, adminOnly, updateRound);
router.delete("/:id", authRequired, adminOnly, deleteRound);
router.post('/:roundId/students/:studentId/image', authRequired, upload2.array('image'), async (req, res) => {
    try {
        let enrollmentUrl;
        const { studentId, roundId } = req.params
        const enrollment = await Enrollment.findOne({ user: studentId, round: roundId })

        if (!enrollment) {
            return res.status(404).json({ message: "no enrollment found for this account" })
        }

        if (req.files && req.files.length > 0) {
            for (const imageFile of req.files) {
                const result = await uploadFromStream(imageFile.buffer)
                enrollmentUrl = result.secure_url;
                await ChildPhoto.create({
                    caption: "",
                    url: enrollmentUrl,
                    enrollment: enrollment._id
                })
            }
            return res.status(200).json({ message: "Images uploaded successfully" });

        } else {
            console.error("No Files Provided");
            return res.status(400).json({ message: "No files provided" });
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "error" })
    }

})


export default router
