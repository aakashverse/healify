import { verifyToken } from "../utils/auth.util.js";
import { User } from "../models/User.model.js"


export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "error",
                message: "Authentication required. Please log in to access this resource."
            });
        }

        const token = authHeader.split(" ")[1];
        const payload = verifyToken(token);

        if (!payload || !payload.userId) {
            return res.status(401).json({
                status: "error",
                message: "Session expired or invalid token. Please log in again."
            });
        }

        const user = await User.findById(payload.userId);
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "User account no longer exists."
            });
        }

        req.user = user;
        req.userId = user.id || (user._id ? user._id.toString() : payload.userId);
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(500).json({
            status: "error",
            message: "Authentication processing error."
        });
    }
};


export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const payload = verifyToken(token);
            if (payload && payload.userId) {
                const user = await User.findById(payload.userId);
                if (user) {
                    req.user = user;
                    req.userId = user.id || (user._id ? user._id.toString() : payload.userId);
                }
            }
        }
    } catch {
        // Silently continue for optional auth
    }
    next();
};

export default { requireAuth, optionalAuth };
