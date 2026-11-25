import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const TOKEN_EXPIRY = "30d"; // 30 days session

function getJwtSecret() {
    return process.env.JWT_SECRET || "healu-secure-clinical-jwt-secret-key-2026-portal";
}

/**
 * Hashes a plaintext password using bcrypt
 */
export async function hashPassword(password) {
    if (!password || typeof password !== "string") {
        throw new Error("Password must be a valid string");
    }
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

/**
 * Synchronous password hashing helper
 */
export function hashPasswordSync(password) {
    if (!password || typeof password !== "string") {
        throw new Error("Password must be a valid string");
    }
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash
 */
export async function verifyPassword(password, storedHash) {
    if (!password || !storedHash || typeof storedHash !== "string") {
        return false;
    }
    return await bcrypt.compare(password, storedHash);
}

/**
 * Synchronous password verification helper
 */
export function verifyPasswordSync(password, storedHash) {
    if (!password || !storedHash || typeof storedHash !== "string") {
        return false;
    }
    return bcrypt.compareSync(password, storedHash);
}

/**
 * Generates an industry-standard signed JWT token
 */
export function generateToken(user, expiresIn = TOKEN_EXPIRY) {
    const userId = user.id || (user._id ? user._id.toString() : user.userId);
    const payload = {
        userId,
        email: user.email,
        name: user.name
    };

    return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

/**
 * Verifies a JWT token signature and expiration using jsonwebtoken
 */
export function verifyToken(token) {
    if (!token || typeof token !== "string") return null;

    try {
        return jwt.verify(token, getJwtSecret());
    } catch {
        return null;
    }
}

export default {
    hashPassword,
    hashPasswordSync,
    verifyPassword,
    verifyPasswordSync,
    generateToken,
    verifyToken
};
