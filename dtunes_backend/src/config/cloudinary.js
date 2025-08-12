import {v2 as cloudinary} from 'cloudinary';
import {CloudinaryStorage} from 'multer-storage-cloudinary'

function connectCloudinary(){
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY,
    })

    const storage = new CloudinaryStorage({
        cloudinary,
        folder: 'test',
        allowedFormats: ['jpeg', 'png', 'jpg', 'mp3'],
    })

    // return cloudinary, storage;
    console.log('Connected to cloudinary')
}

export default connectCloudinary;

// export {cloudinary, storage};