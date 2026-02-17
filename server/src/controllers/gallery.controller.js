import path from 'path'
import GalleryItem from '../models/GalleryItem.js';

export const getGalleryPhotos = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const gallery = await GalleryItem.find()
            return res.json(gallery)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
}

export const getImage = async (req, res) => {

    const imageName = req.params.image_name
    const imageUrl = path.join(process.cwd(), 'images', 'gallery', imageName);
    res.sendFile(imageUrl, (err) => {
        if (err) {
            console.error('Error sending file:', err);
            if (!res.headersSent) {
                res.status(404).send('Image not found');
            }
        }
    })
}


export const uploadGalleryPhoto = async (req, res) => {
    try {
        const { title } = req.body;
        const file = req.file

        const item = await GalleryItem.create({ title, fileName: file.filename });
        res.status(201).json(item);
    } catch (err) {
        console.error("Create gallery error:", err);
        res.status(500).json({ message: "Server error" });
    }
}


export const updateGallerystatus = async (req, res) => {
    try {
        const updated = await GalleryItem.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        console.error("Update gallery status error:", err);
        res.status(500).json({ message: "Server error" });
    }
}


export const updateGalleryFeatured = async (req, res) => {
    try {
        const updated = await GalleryItem.findByIdAndUpdate(
            req.params.id,
            { featured: req.body.featured },
            { new: true }
        );
        res.json(updated);
    } catch (err) {
        console.error("Update featured error:", err);
        res.status(500).json({ message: "Server error" });
    }
}