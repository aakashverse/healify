import express from "express";
import { SendChat } from "../controller/ChatCont";

const route = express.Router();


route.post("/chat",SendChat);

export default route;