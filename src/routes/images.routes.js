import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import { uploadImage } from "../controllers/image.controllers.js";

const router = Router();

router.route("/:albumId/images").post(verifyJWT,upload.single("image"), uploadImage)

export default router
