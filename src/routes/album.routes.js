import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addUsersToAlbum, createAlbum, updateDescription } from "../controllers/album.controller.js";

const router = Router();

router.route("/createAlbum").post(verifyJWT,createAlbum)
// router.route("/listAlbum").get(verifyJWT,lis)
router.route("/:albumId").patch(updateDescription)
router.route("/:albumId/share").patch(addUsersToAlbum)

export default router