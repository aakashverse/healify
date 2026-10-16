import express from "express"
import dotemv from "dotenv"
import cors from "cors"

const app=express();

app.use(express.json());
dotenv.config();
app.use(cors());

const PORT =process.env.PORT || 7000;


