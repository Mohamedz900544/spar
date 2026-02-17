import multer from 'multer'

//====================== multer =====================
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/gallery')
    },
    filename: (req, file, cb) => {
        const filename = `${Math.floor(Math.random() * 500)}_${Date.now()}_${file.originalname.split('.')[0]}.${file.mimetype.split("/")[1]}`
        cb(null, filename)
    }
})

export const upload = multer({
    storage: diskStorage
})

const memoryStorage = multer.memoryStorage()

export const upload2 = multer({
    storage: memoryStorage
})