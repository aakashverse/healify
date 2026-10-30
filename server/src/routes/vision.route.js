import express from "express";
import multer from "multer";
import {UploadImg, ExplainImg} from "../controller/vision.controller.js";

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10 MB tak
});

router.post("/explain", ExplainImg);
router.post("/upload", upload.single("file"), UploadImg);

export default router;
