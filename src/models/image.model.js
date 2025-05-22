import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid"

const imageSchema = new mongoose.Schema({
     imageId:{
        type:String,
        default:uuidv4,
        unique:true,
     },
    albumId: {
  type: String, 
  ref: 'Album',
  required:true
},
name:{
    type:String,
},
tags:[
    {
        type:String
    }
]

},{timestamps:true})