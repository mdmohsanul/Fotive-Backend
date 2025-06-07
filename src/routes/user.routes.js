import { Router } from "express";
import {
  changeCurrentUserPassword,
  getAllUsers,
  getCurrentUser,
  loginUser,
  loginWithGoogle,
  logoutUser,
  registerUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/google").get(loginWithGoogle);
router.route("/signup").post(registerUser);
router.route("/login").post(loginUser);
// secured Routes

router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/").get(verifyJWT, getAllUsers);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentUserPassword);

export default router;
