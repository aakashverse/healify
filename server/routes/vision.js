import express from "express";
import { UploadImg,ExplainImg } from "../controller/Vis.cont";

const route = express.Router();


route.post("/explain",ExplainImg);
route.post("/upload",UploadImg);