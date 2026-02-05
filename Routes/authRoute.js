import express from "express"
import { forgotPassword, Login, register, resetPassword } from "../Controllers/authController.js"




const router = express.Router()

router.post("/register", register)
router.post("/login", Login )
router.post("/forgot-password", forgotPassword )
router.post("/reset-password/:id/:token", resetPassword )








export default router;