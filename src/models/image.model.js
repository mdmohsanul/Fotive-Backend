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
    userId: {
      type: String,
      ref: "User",
      required: true,
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
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    imageUrl: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
    },
  },
  { timestamps: true }
);

export const Image = mongoose.model("Image", imageSchema);