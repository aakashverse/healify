import "dotenv/config";

import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.route.js";
import facilitiesRoutes from "./routes/facilities.route.js";
import visionRoutes from "./routes/vision.route.js";
import authRoutes from "./routes/auth.route.js";
import recordsRoutes from "./routes/records.route.js";
import { connectMongoDB } from "./db/mongodb.js";

// Initialize Database (Atlas -> Local MongoDB -> Embedded SQLite fallback)
await connectMongoDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Root & Healthcheck
app.get("/", (req, res) => {
    res.json({
        message: "Heal-U Node.js Backend Server is running",
        version: "1.0.0",
        endpoints: {
            health: "/health",
            auth: "/api/auth",
            records: "/api/records",
            chat: "/api/chat",
            facilities: "/api/facilities",
            vision_explain: "/api/explain",
            vision_upload: "/api/upload"
        }
    });
});

app.get("/health", (req, res) => {
    res.json({ status: "healthy", service: "heal-u-node-backend", timestamp: new Date() });
});

// Mount Routes under /api
app.use("/api/auth", authRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api", chatRoutes);
app.use("/api", facilitiesRoutes);
app.use("/api", visionRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandled Server Error:", err);
    res.status(500).json({
        status: "error",
        message: err.message || "Internal server error"
    });
});

app.listen(PORT, () => {
    console.log(`Heal-U Node Server is running on port ${PORT}`);
});
