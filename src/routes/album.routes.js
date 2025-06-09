import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addSharedUserToAlbum,
  createAlbum,
  deleteAlbum,
  getAllAlbums,
  updateData,
} from "../controllers/album.controller.js";

const router = Router();

router.route("/createAlbum").post(verifyJWT, createAlbum);
router.route("/").get(verifyJWT, getAllAlbums);

// router.route("/listAlbum").get(verifyJWT,lis)
router.route("/:albumId").patch(verifyJWT, updateData);

router.route("/:albumId").delete(verifyJWT, deleteAlbum);

router.route("/:albumId/share").patch(verifyJWT, addSharedUserToAlbum);

export default router