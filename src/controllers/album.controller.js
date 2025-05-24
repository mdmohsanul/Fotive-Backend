import { Album } from "../models/album.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createAlbum = asyncHandler(async (req,res) => {
    const owner = req.user._id
    console.log(owner)
    console.log(req.body)
    const {name,description} = req.body;
    if (!name || name.trim() === "") {
      throw new ApiError(401,"Album name is required")
      }
    //  const owner = req.user._id

     const album = await Album.create({
        name,
        description:description || "",
        ownerId:owner
     })
     return res.status(200).json(new ApiResponse(
        200,
        album,
        "Album created Successfully"
     ))
})

const getAllAlbums = asyncHandler(async(req,res) => {
    const userId = req.user._id
    if(!userId){
        throw new ApiError(400,"User Id not found")
    }
    const albums = await Album.find({_id : userId})
    return res.status(200).json(new ApiResponse(
        200,
        albums,
        "Albums fetched successfully"
    ))
})

const updateDescription = asyncHandler(async(req,res) => {
    const {description} = req.body;
    const {albumId} = req.params;
    if(!albumId){
        throw new ApiError(400,"AlbumId is required")
    }
    if(!description || description.trim() === ""){
        throw new ApiError(400,"Description is required")
    }
   
    const album = await Album.findOneAndUpdate({albumId:albumId},{
        $set : {description}
    },{new:true})
    if (!album) {
        throw new ApiError(404, "Album not found or unauthorized");
      }

    return res.status(200).json(new ApiResponse(
        200,
        album,
        "Album description updated successfully"
    ))
})

// add a single user at a time
 const addUsersToAlbum = asyncHandler(async (req,res) => {
   // accepts a single email as string
    const {sharedUsers} = req.body;
    const {albumId} = req.params;
    if(!albumId){
        throw new ApiError(400,"AlbumId is required")
    }
    if (!sharedUsers || sharedUsers.trim() === "") {
        throw new ApiError(400, "Users is required");
      }
   
    const album = await Album.findOne({albumId:albumId})
   album.sharedUsers.push(sharedUsers)
    album.sharedUsers = [...new Set(album.sharedUsers)]; // remove duplicates manually
    
    await album.save(); 

    return res.status(200).json(new ApiResponse(
        200,
        album,
        "Users added successfully"
    ))
 })

const deleteAlbum = asyncHandler(async(req,res) => {
    const {albumId} = req.body;
    if(!albumId){
        throw new ApiError(400,"Album Id not found")
    }
    const associtedImages = await Image.({albumId:albumId})

})

export {createAlbum,updateDescription,addUsersToAlbum}

