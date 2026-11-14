import { User } from "../models/User.model.js"
import { hashPassword, verifyPassword, generateToken } from "../utils/auth.util.js";

// Helper to safely serialize user object and remove sensitive credentials
function sanitizeUser(user) {
    if (!user) return null;
    const obj = typeof user.toJSON === "function" 
        ? user.toJSON() 
        : (typeof user.toObject === "function" ? user.toObject() : { ...user });
    delete obj.passwordHash;
    delete obj.password_hash;
    return obj;
}

// Simple email format validator
function isValidEmail(email) {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Register a new user account
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, age, gender, blood_group, allergies } = req.body;

        if (!name || typeof name !== "string" || name.trim().length < 2) {
            return res.status(400).json({
                status: "error",
                message: "Please enter a valid full name (minimum 2 characters)."
            });
        }

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                status: "error",
                message: "Please enter a valid email address."
            });
        }

        if (!password || typeof password !== "string" || password.length < 6) {
            return res.status(400).json({
                status: "error",
                message: "Password must be at least 6 characters long."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({email: normalizedEmail});
        if (existingUser) {
            return res.status(409).json({
                status: "error",
                message: "An account with this email already exists. Please log in instead."
            });
        }

        const passwordHash = await hashPassword(password);
        const newUser = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            phone: phone ? String(phone).trim() : "",
            age: age ? Number(age) : null,
            gender: gender ? String(gender).trim() : "",
            bloodGroup: blood_group ? String(blood_group).trim().toUpperCase() : "",
            allergies: allergies ? String(allergies).trim() : ""
        });

        const token = generateToken(newUser);

        return res.status(201).json({
            status: "success",
            message: "Account created successfully! Welcome to Heal-U.",
            token,
            user: sanitizeUser(newUser)
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to register account: " + error.message
        });
    }
};

/**
 * Log in to existing user account
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                status: "error",
                message: "Please enter your registered email address."
            });
        }

        if (!password || typeof password !== "string") {
            return res.status(400).json({
                status: "error",
                message: "Please enter your password."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findByEmail(normalizedEmail);

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password. Please check your credentials."
            });
        }

        const isPasswordCorrect = await verifyPassword(password, user.passwordHash || user.password_hash);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password. Please check your credentials."
            });
        }

        const token = generateToken(user);

        return res.status(200).json({
            status: "success",
            message: "Logged in successfully! Welcome back.",
            token,
            user: sanitizeUser(user)
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to log in: " + error.message
        });
    }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            status: "success",
            user: sanitizeUser(req.user)
        });
    } catch (error) {
        console.error("getMe error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve user profile."
        });
    }
};

/**
 * Update authenticated user profile
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
    try {
        const { name, phone, age, gender, blood_group, allergies } = req.body;

        const updated = await User.updateProfile(req.userId, {
            name: name ? String(name).trim() : undefined,
            phone: phone !== undefined ? String(phone).trim() : undefined,
            age: age !== undefined ? (age ? Number(age) : null) : undefined,
            gender: gender !== undefined ? String(gender).trim() : undefined,
            blood_group: blood_group !== undefined ? String(blood_group).trim().toUpperCase() : undefined,
            allergies: allergies !== undefined ? String(allergies).trim() : undefined
        });

        return res.status(200).json({
            status: "success",
            message: "Profile updated successfully.",
            user: sanitizeUser(updated)
        });

    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to update profile: " + error.message
        });
    }
};

export default {
    register,
    login,
    getMe,
    updateProfile
};
