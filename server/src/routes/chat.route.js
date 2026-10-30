import express from "express";
import { SendChat } from "../controller/chat.controller.js";

const router = express.Router();

router.post("/chat", SendChat);

export default router;