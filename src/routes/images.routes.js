import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.js";
import {
  deleteImage,
  favoriteImage,
  favoriteImagesForUser,
  favoriteImagesInAlbum,
  getCommentsForAParticularImage,
  imagesByAlbumId,
  imagesByUserId,
  updateComment,
  uploadImage,
} from "../controllers/image.controllers.js";

const router = Router();

router
  .route("/:albumId/images")
  .post(verifyJWT, upload.single("image"), uploadImage);

router.route("/images/:imageId/favorite").patch(verifyJWT, favoriteImage);

router.route("/images/:imageId/comment").patch(verifyJWT, updateComment);
router
  .route("/images/:imageId/comments")
  .get(verifyJWT, getCommentsForAParticularImage);


router.route("/:userId/images/:imageId").delete(verifyJWT, deleteImage);

router.route("/:albumId/images").get(verifyJWT, imagesByAlbumId);
router.route("/user/:userId/images").get(verifyJWT, imagesByUserId);
router
  .route("/:albumId/images/favorites")
  .get(verifyJWT, favoriteImagesInAlbum);
router.route("/user/:userId/favorites").get(verifyJWT, favoriteImagesForUser);
export default router;
