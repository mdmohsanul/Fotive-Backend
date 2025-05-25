import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"
import dotenv from "dotenv"

dotenv.config()

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


const uploadOnCloudinary = async(localFilePath) =>{
  try {
    if (!localFilePath) return null;
    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
       folder: 'Fotive'
    });

    // if file uploaded successfully then delete from local server
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // if file not uploaded on cloudinary then it will be stored in the server, so remove those malicius file from server
    fs.unlinkSync(localFilePath);
    return null;
  }
}

export {uploadOnCloudinary}