import cloudinary from 'cloudinary'
import dotenv from 'dotenv'
dotenv.config()
console.log(process.env.API_KEY)
cloudinary.v2.config({
    cloud_name: process.env.cloud_name,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

export default cloudinary