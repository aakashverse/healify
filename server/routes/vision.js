import express from "express";
import multer from "multer";
import { UploadImg,ExplainImg } from "../controller/Vis.cont";

const route = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

route.post("/explain",ExplainImg);
router.post("/upload", upload.single("file"), UploadImg);

export default route;