import express from "express";
import { register, login, getMe, updateProfile } from "../controller/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/signup", register);
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", requireAuth, getMe);
router.put("/profile", requireAuth, updateProfile);

export default router;
