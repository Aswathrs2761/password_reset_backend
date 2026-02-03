import express from "express";
import {
  login,
  register,
  forgotPassword,
  resetpassword
} from "../Controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

/* ✅ FIXED (was /forgot-Password) */
router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:id/:token", resetpassword);

export default router;
