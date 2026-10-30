import express from "express";
import {GetFacilities} from "../controller/Faci.Cont";

const route = express.Router();


route.get("/facilities",GetFacilities);

export default route;