import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const albumSchema = new mongoose.Schema({
    albumId :{
        type:String,
        default:uuidv4,
        unique:true
    },
    name:{
        type:String,
        required:[true,"Album name is required"],
        unique:true
    },
    description:{
        type:String
    },
    ownerId :{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    sharedUsers:[
        {
            type:String,
            match:[/^\S+@\S+\.\S+$/,"shared user email is not valid"]
        }
    ]
},{timestamps:true})

export const Album = mongoose.model("Album",albumSchema)