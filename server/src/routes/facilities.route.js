import express from "express";
import {GetFacilities} from "../controller/facilities.controller.js";

const router = express.Router();

router.get("/facilities", GetFacilities);

export default router;