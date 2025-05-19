import { Router } from "express";
import { loginWithGoogle } from "../controllers/user.controller.js";

const router = Router();
router.route("/google").get(loginWithGoogle);

export default router;
