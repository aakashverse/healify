import express from "express";
import { getRecords, getRecord, createRecord, updateRecord, deleteRecord } from "../controller/records.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = express.Router();

// All health records routes require authentication
router.use(requireAuth);

router.get("/", getRecords);
router.get("/:id", getRecord);
router.post("/", createRecord);
router.put("/:id", updateRecord);
router.delete("/:id", deleteRecord);

export default router;
