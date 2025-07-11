import { Image } from "../models/image.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Album } from "../models/album.model.js";

const uploadImage = asyncHandler(async (req, res) => {
  // extract file details
  // validations
  // cloudinary save
  const { albumId } = req.params;
  const userId = req.user.userId;

  const { tags, isFavorite, commentText } = req.body;
  const file = req.file;
  if (!file) {
    throw new ApiError(401, "No file found");
  }

  const { size, path, originalname, mimetype } = file;
  if (size > 5242880) {
    fs.unlinkSync(path); // Delete the temp file
    throw new ApiError(401, "Image size should not exceed 5MB");
  }
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

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
    imageUrl: uploadedImage?.url,
    tags,
    isFavorite: isFavorite === "true",
    userId,
    size: size / (1024 * 1024),
  });
  return res
    .status(201)
    .json(new ApiResponse(200, user, "Image uploaded and saved successfully"));
});

const favoriteImage = asyncHandler(async (req, res) => {
  const { isFavorite } = req.body;
  const { imageId } = req.params;
  const user = req.user.userId;
  const image = await Image.findOne({ imageId });

  if (!image) {
    throw new ApiError(404, "Image not found");
  }
  image.isFavorite = isFavorite;
  const updatedfavImage = await image.save(); // Save the updated document

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedfavImage, "Image favorite status updated")
    );
});

const updateComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const { imageId } = req.params;

  if (!comment || comment.trim() === "") {
    throw new ApiError(400, "Comment cannot be empty");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized: Missing user ID");
  }

  const image = await Image.findOne({ imageId });

  if (!image) {
    throw new ApiError(404, "Image not found");
  }

  // ✅ Push properly formatted comment object
  image.comments.push({
    user: req.user._id,
    text: comment.trim(), // Always good to sanitize
  });

  const updatedComment = await image.save();

  res.status(200).json(new ApiResponse(200, image, "Comment added"));
});

const getCommentsForAParticularImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;

  const image = await Image.findOne({ imageId }).populate({
    path: "comments.user",
    select: "name email avatar userName", // Only fetch needed fields
  });
  if (!image) {
    throw new ApiError(404, "Image not found");
  }

  // Optional: sort comments by createdAt (newest first)
  const comments = image.comments.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const deleteImage = asyncHandler(async (req, res) => {
  const { imageId } = req.params;
  const userId = req.user?.userId; // Authenticated user

  if (!imageId) {
    throw new ApiError(400, "Image ID not provided");
  }

  // Step 1: Find the image and check ownership
  const image = await Image.findOne({ imageId });

  if (!image) {
    throw new ApiError(404, "No image found with the given ID");
  }

  if (image.userId !== userId) {
    throw new ApiError(403, "You are not authorized to delete this image");
  }

  // Step 2: Delete the image
  await Image.deleteOne({ imageId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Image deleted successfully"));
});

// get all images for a particular albumId
const imagesByAlbumId = asyncHandler(async (req, res) => {
  const { albumId } = req.params;
  if (!albumId) {
    throw new ApiError(400, "Album id is required");
  }
  const images = await Image.find({ albumId: albumId });
  res
    .status(200)
    .json(new ApiResponse(200, images, "images fetched successfully"));
});

// getAll images
const imagesByUserId = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user.userId;
  const loggedInUserEmail = req.user.email;
  const { userId } = req.params;

  if (loggedInUserId !== userId) {
    throw new ApiError(401, "Logged-in user and userId sent are different");
  }

  // 1. Get all albums shared with this user's email
  const sharedAlbums = await Album.find({ sharedUsers: loggedInUserEmail });
  const sharedAlbumIds = sharedAlbums.map((album) => album.albumId);

  // 2. Fetch images:
  //    a) owned by the user
  //    b) OR in albums shared with the user
  const images = await Image.find({
    $or: [{ userId: userId }, { albumId: { $in: sharedAlbumIds } }],
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, images, "All accessible images fetched successfully")
    );
});

const favoriteImagesInAlbum = asyncHandler(async (req, res) => {
  const { albumId } = req.params;
  const favoriteImages = await Image.find({
    albumId,
    isFavorite: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, favoriteImages, "Fetched favorite Images"));
});

const favoriteImagesForUser = asyncHandler(async (req, res) => {
  const user = req.user.userId;

  const images = await Image.find({ userId: user, isFavorite: true });
  return res
    .status(200)
    .json(new ApiResponse(200, images, "Favorite images fetched successfully"));
});
export {
  uploadImage,
  favoriteImage,
  updateComment,
  deleteImage,
  imagesByAlbumId,
  imagesByUserId,
  favoriteImagesInAlbum,
  favoriteImagesForUser,
  getCommentsForAParticularImage,
};
