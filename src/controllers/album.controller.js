import { Album } from "../models/album.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Image } from "../models/image.model.js";
import { User } from "../models/user.model.js";

const createAlbum = asyncHandler(async (req, res) => {
  const owner = req.user.userId;
  const { name, description } = req.body;
  if (!name || name.trim() === "") {
    throw new ApiError(401, "Album name is required");
  }

  const isSameName = await Album.findOne({ name });

  if (isSameName) {
    throw new ApiError(401, "This name is already taken");
  }

  const album = await Album.create({
    name,
    description: description || "",
    ownerId: owner,
  });
  return res
    .status(200)
    .json(new ApiResponse(200, album, "Album created Successfully"));
});

const getAllAlbums = asyncHandler(async (req, res) => {
  const userId = req.user.userId;
  const userEmail = req.user.email;

  if (!userId || !userEmail) {
    throw new ApiError(400, "User credentials not found");
  }

  // Fetch albums either owned by the user or shared with their email
  const albums = await Album.find({
    $or: [{ ownerId: userId }, { sharedUsers: userEmail }],
  });

  return res
    .status(200)
    .json(new ApiResponse(200, albums, "Albums fetched successfully"));
});

const updateData = asyncHandler(async (req, res) => {
  const { description, name } = req.body;
  const { albumId } = req.params;
  const user = req.user.userId;

  const findAlbum = await Album.findOne({ albumId });

  if (!(findAlbum.ownerId === user)) {
    throw new ApiError(403, "Only Album owner can update details");
  }
  if (!albumId) {
    throw new ApiError(400, "AlbumId is required");
  }
  if (!description || description.trim() === "") {
    throw new ApiError(400, "Description is required");
  }

  const album = await Album.findOneAndUpdate(
    { albumId: albumId },
    {
      $set: { description, name },
    },
    { new: true }
  );
  if (!album) {
    throw new ApiError(404, "Album not found or unauthorized");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, album, "Album description updated successfully")
    );
});

const deleteAlbum = asyncHandler(async (req, res) => {
  const { albumId } = req.params;
  const user = req.user.userId;

  const findAlbum = await Album.findOne({ albumId });

  if (!(findAlbum.ownerId === user)) {
    throw new ApiError(403, "Only Album owner can delete album");
  }

  if (!albumId) {
    throw new ApiError(400, "Album Id not provided");
  }

  const deletionResult = await Album.deleteOne({ albumId: albumId });

  if (deletionResult.deletedCount === 0) {
    throw new ApiError(404, "No album found with the given ID");
  }

  // delete associated images
  const findImages = await Image.find({ albumId });

  if (findImages.length > 0) {
    await Image.deleteMany({ albumId });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Album deleted successfully"));
});

// useremail from dropdown
// albumId params se
const addSharedUserToAlbum = asyncHandler(async (req, res) => {
  const { albumId } = req.params;
  const { email } = req.body;
  const userId = req.user.userId;

  const album = await Album.findOne({ albumId });
  if (!albumId) {
    throw new ApiError(404, "Album not found");
  }

  // only album owner can share
  if (album.ownerId !== userId) {
    throw new ApiError(403, "Only owner can share the album");
  }

  // you can share album to the registered user
  const findUser = await User.findOne({ email });
  if (!findUser) {
    throw new ApiError(403, "The selected user is not registered");
  }

  // check if user email is already exists
  if (album.sharedUsers.includes(email)) {
    throw new ApiError(409, "Album already shared for this user");
  }

  album.sharedUsers.push(email);
  const updatedAlbum = await album.save();

  res
    .status(200)
    .json(new ApiResponse(200, updatedAlbum, "Album shared successfully"));
});

export {
  createAlbum,
  updateData,
  deleteAlbum,
  getAllAlbums,
  addSharedUserToAlbum,
};

