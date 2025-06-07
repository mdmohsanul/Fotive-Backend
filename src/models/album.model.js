import mongoose from "mongoose";
import { v4 as uuidv4 } from 'uuid';

const albumSchema = new mongoose.Schema(
  {
    albumId: {
      type: String,
      default: uuidv4,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Album name is required"],
      unique: true,
    },
    description: {
      type: String,
    },
    ownerId: {
      type: String,
      ref: "User",
      required: true,
    },
    // sharedUsers:[
    //     {
    //         type:String,
    //         match:[/^\S+@\S+\.\S+$/,"shared user email is not valid"]
    //     }
    // ]
    sharedUsers: {
      type: [String],
      validate: {
        validator: function (emails) {
          const emailRegex = /^\S+@\S+\.\S+$/;
          return emails.every((email) => emailRegex.test(email));
        },
        message: "One or more shared user emails are invalid",
      },
      default: [],
    },
  },
  { timestamps: true }
);

export const Album = mongoose.model("Album",albumSchema)