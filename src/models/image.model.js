import mongoose from "mongoose"
import { v4 as uuidv4 } from "uuid";

const imageSchema = new mongoose.Schema(
  {
    imageId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    albumId: {
      type: String,
      ref: "Album",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    person: {
      type: String, // we can later give reference to User
    },
    tags: [
      {
        type: String,
      },
    ],
    isFavorite: {
      type: Boolean,
      default: false,
    },
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    size: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Image = mongoose.model("Image", imageSchema);