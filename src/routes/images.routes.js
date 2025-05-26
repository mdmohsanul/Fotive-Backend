import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import {
  deleteImage,
  favoriteImage,
  getAllImagesByAlbumId,
  getFavoriteImages,
  updateComment,
  uploadImage,
} from "../controllers/image.controllers.js";

const router = Router();

router
  .route("/:albumId/images")
  .post(verifyJWT, upload.single("image"), uploadImage);
router
  .route("/:albumId/images/:imageId/favorite")
  .patch(verifyJWT, favoriteImage);

router
  .route("/:albumId/images/:imageId/comments")
  .patch(verifyJWT, updateComment);

router.route("/:albumId/images/:imageId").delete(verifyJWT, deleteImage);
router.route("/:albumId/images").get(verifyJWT, getAllImagesByAlbumId);

router.route("/:albumId/images/favorites").get(verifyJWT, getFavoriteImages);

export default router;
