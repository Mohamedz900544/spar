import { Router } from 'express'
import { adminOnly, authRequired } from '../middleware/auth.js';

import { upload } from '../config/multer.js';
import { getGalleryPhotos, getImage, updateGalleryFeatured, updateGallerystatus, uploadGalleryPhoto } from '../controllers/gallery.controller.js';


const router = Router()
// /api/admin/gallery/....
router.get('/', authRequired, getGalleryPhotos)

router.get('/:image_name', getImage)

router.post("/", authRequired, adminOnly, upload.single('image'), uploadGalleryPhoto);

router.patch("/:id/status", authRequired, adminOnly, updateGallerystatus);

router.patch("/:id/featured", authRequired, adminOnly, updateGalleryFeatured);

export default router