import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import Enrollment from '../models/Enrollment.js'
// import { upload2 } from '../config/multer.js'
// import cloudinary from '../config/cloudinary.js'
// import { uploadFromStream } from '../helpers.js'
// import ChildPhoto from '../models/ChildPhoto.js'

const enrollmentRoutes = Router()

// /api/admin/enrollments
enrollmentRoutes.get('/', authRequired, async (req, res) => {
    try {


        const enrollments = await Enrollment.aggregate([
            {
                $lookup: {
                    from: "childphotos",
                    localField: "_id",
                    foreignField: "enrollment",
                    as: "studentPhotos"
                },

            }, {
                $lookup: {
                    from: "rounds",
                    localField: "roundCode",
                    foreignField: "code",
                    as: "roundDetails"
                }
            }, {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            }
        ])
        return res.json({ enrollments })
    } catch (error) {
        console.log(error.stack)
        return res.json({ message: "error" })
    }
})
// enrollmentRoutes
export default enrollmentRoutes