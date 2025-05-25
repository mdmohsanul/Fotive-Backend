import { Image } from "../models/image.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";

const uploadImage = asyncHandler(async (req, res) => {
  // extract file details
  // validations
  // cloudinary save
  const { albumId } = req.params;
  const { tags, isFavorite, comments } = req.body;
  const file = req.file;
  if (!file) {
    throw new ApiError(401, "No file found");
  }

  const { size, path, originalname, mimetype } = file;
  if (size > 5242880) {
    fs.unlinkSync(path); // Delete the temp file
    throw new ApiError(401, "Image size should not exceed 5MB");
  }
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(mimetype)) {
    //  Delete the file if invalid
    fs.unlinkSync(path);
    throw new ApiError(400, "Only JPEG, PNG, or WEBP images are allowed");
  }

  if (!path) {
    throw new ApiError(400, "Path is required");
  }

  // upload file on cloudinary and it return a url string
  const uploadedImage = await uploadOnCloudinary(path);

  if (!uploadedImage) {
    throw new ApiError(400, "Image file is required");
  }
  // entry on database
  const user = await Image.create({
    albumId,
    name: originalname.split(".")[0],
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
});

export { uploadImage };
