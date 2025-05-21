import { Router } from "express";
import {
  getCurrentUser,
  loginWithGoogle,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/google").get(loginWithGoogle);

// secured Routes

router.route("/current-user").get(verifyJWT, getCurrentUser);
export default router;
