import mongoose from "mongoose";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { User } from "../models/User.model.js";
import { HealthRecord } from "../models/HealthRecord.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isConnected = false;
let connectPromise = null;
let fallbackDb = null;

async function getFallbackDb() {
    if (fallbackDb) return fallbackDb;

    const { DatabaseSync } = await import("node:sqlite");
    const dataDir = path.resolve(__dirname, "../../data");
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, "healu.db");
    fallbackDb = new DatabaseSync(dbPath);
    fallbackDb.exec("PRAGMA foreign_keys = ON;");
    fallbackDb.exec("PRAGMA journal_mode = WAL;");

    fallbackDb.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            phone TEXT DEFAULT '',
            age INTEGER,
            gender TEXT DEFAULT '',
            blood_group TEXT DEFAULT '',
            allergies TEXT DEFAULT '',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS health_records (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            record_type TEXT NOT NULL DEFAULT 'prescription',
            date TEXT NOT NULL,
            doctor_name TEXT DEFAULT '',
            facility_name TEXT DEFAULT '',
            diagnosis TEXT DEFAULT '',
            medicines TEXT DEFAULT '[]',
            vital_stats TEXT DEFAULT '{}',
            attachment_name TEXT DEFAULT '',
            attachment_path TEXT DEFAULT '',
            tags TEXT DEFAULT '[]',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );
    `);

    return fallbackDb;
}

function mapSqliteUser(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        passwordHash: row.password_hash,
        password_hash: row.password_hash,
        phone: row.phone || "",
        age: row.age ?? null,
        gender: row.gender || "",
        bloodGroup: row.blood_group || "",
        blood_group: row.blood_group || "",
        allergies: row.allergies || "",
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

function mapSqliteRecord(row) {
    if (!row) return null;
    let medicines = [];
    let vitalStats = {};
    let tags = [];
    try { medicines = JSON.parse(row.medicines || "[]"); } catch { medicines = []; }
    try { vitalStats = JSON.parse(row.vital_stats || "{}"); } catch { vitalStats = {}; }
    try {
        const parsedTags = JSON.parse(row.tags || "[]");
        tags = Array.isArray(parsedTags) ? parsedTags : [];
    } catch {
        tags = row.tags ? String(row.tags).split(",").map((t) => t.trim()).filter(Boolean) : [];
    }

    return {
        id: row.id,
        userId: row.user_id,
        title: row.title,
        recordType: row.record_type,
        record_type: row.record_type,
        date: row.date,
        doctorName: row.doctor_name || "",
        doctor_name: row.doctor_name || "",
        facilityName: row.facility_name || "",
        facility_name: row.facility_name || "",
        diagnosis: row.diagnosis || "",
        medicines,
        vitalStats,
        vital_stats: vitalStats,
        attachmentName: row.attachment_name || "",
        attachment_name: row.attachment_name || "",
        attachmentPath: row.attachment_path || "",
        attachment_path: row.attachment_path || "",
        tags,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

export function isMongoConnected() {
    return isConnected && mongoose.connection.readyState === 1;
}

async function tryConnectUri(uri, label) {
    try {
        await mongoose.connect(uri, {
            dbName: "healu",
            serverSelectionTimeoutMS: 4000,
            connectTimeoutMS: 4000
        });
        isConnected = true;
        console.log(`✓ [Database] Connected to ${label} (db: ${mongoose.connection.name})`);
        return true;
    } catch (error) {
        isConnected = false;
        console.warn(`⚠️  [Database] ${label} connection failed (${error.message})`);
        try {
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }
        } catch {
            // Ignore cleanup errors
        }
        return false;
    }
}

export async function connectMongoDB() {
    if (isMongoConnected()) return true;
    if (connectPromise) return connectPromise;

    connectPromise = (async () => {
        const configuredUri = process.env.MONGODB_URI?.trim();
        const localUri = "mongodb://127.0.0.1:27017/healu";

        // 1. Try configured MONGODB_URI (Atlas or custom)
        if (configuredUri) {
            const label = configuredUri.includes("mongodb+srv://") ? "MongoDB Atlas" : "Configured MongoDB";
            if (await tryConnectUri(configuredUri, label)) {
                return true;
            }
        }

        // 2. Automatically fall back to local MongoDB if configured URI failed or wasn't local
        if (!configuredUri || configuredUri !== localUri) {
            if (await tryConnectUri(localUri, "Local MongoDB (127.0.0.1:27017)")) {
                return true;
            }
        }

        // 3. Zero-crash offline SQLite fallback
        await getFallbackDb();
        console.log("ℹ️  [Database] Using Embedded SQLite Fallback (MongoDB unavailable)");
        return false;
    })();

    try {
        return await connectPromise;
    } finally {
        connectPromise = null;
    }
}

export async function ensureDatabaseReady() {
    if (isMongoConnected()) return true;
    if (fallbackDb) return false;
    return await connectMongoDB();
}

// Unified User Data Access Layer (MongoDB primary, SQLite fallback)
export const MongoUserModel = {
    async findByEmail(email) {
        if (!email) return null;
        const normalized = email.toLowerCase().trim();
        await ensureDatabaseReady();

        if (isMongoConnected()) {
            const user = await User.findOne({ email: normalized });
            if (!user) return null;
            const userObj = user.toJSON();
            userObj.passwordHash = user.passwordHash;
            userObj.password_hash = user.passwordHash;
            return userObj;
        }

        const db = await getFallbackDb();
        const row = db.prepare("SELECT * FROM users WHERE email = ?").get(normalized);
        return mapSqliteUser(row);
    },

    async findById(id) {
        if (!id) return null;
        await ensureDatabaseReady();

        if (isMongoConnected()) {
            if (!mongoose.Types.ObjectId.isValid(id)) return null;
            const user = await User.findById(id);
            if (!user) return null;
            const userObj = user.toJSON();
            userObj.passwordHash = user.passwordHash;
            userObj.password_hash = user.passwordHash;
            return userObj;
        }

        const db = await getFallbackDb();
        const row = db.prepare("SELECT * FROM users WHERE id = ?").get(String(id));
        return mapSqliteUser(row);
    },

    async create({ name, email, passwordHash, password_hash, phone, age, gender, bloodGroup, blood_group, allergies }) {
        await ensureDatabaseReady();
        const finalHash = passwordHash || password_hash;
        const finalBloodGroup = (bloodGroup || blood_group || "").trim().toUpperCase();
        const normalizedEmail = email.toLowerCase().trim();

        if (isMongoConnected()) {
            const user = await User.create({
                name: name.trim(),
                email: normalizedEmail,
                passwordHash: finalHash,
                phone: phone ? String(phone).trim() : "",
                age: age ? Number(age) : null,
                gender: gender ? String(gender).trim() : "",
                bloodGroup: finalBloodGroup,
                allergies: allergies ? String(allergies).trim() : ""
            });
            return user.toJSON();
        }

        const db = await getFallbackDb();
        const id = new mongoose.Types.ObjectId().toString();
        const now = new Date().toISOString();
        db.prepare(`
            INSERT INTO users (id, name, email, password_hash, phone, age, gender, blood_group, allergies, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id,
            name.trim(),
            normalizedEmail,
            finalHash,
            phone ? String(phone).trim() : "",
            age ? Number(age) : null,
            gender ? String(gender).trim() : "",
            finalBloodGroup,
            allergies ? String(allergies).trim() : "",
            now,
            now
        );
        const created = mapSqliteUser(db.prepare("SELECT * FROM users WHERE id = ?").get(id));
        delete created.passwordHash;
        delete created.password_hash;
        return created;
    },

    async updateProfile(id, updates) {
        await ensureDatabaseReady();

        if (isMongoConnected()) {
            if (!mongoose.Types.ObjectId.isValid(id)) return null;
            const allowed = {};
            if (updates.name !== undefined) allowed.name = updates.name.trim();
            if (updates.phone !== undefined) allowed.phone = updates.phone.trim();
            if (updates.age !== undefined) allowed.age = updates.age ? Number(updates.age) : null;
            if (updates.gender !== undefined) allowed.gender = updates.gender.trim();
            if (updates.blood_group !== undefined) allowed.bloodGroup = updates.blood_group.trim().toUpperCase();
            if (updates.bloodGroup !== undefined) allowed.bloodGroup = updates.bloodGroup.trim().toUpperCase();
            if (updates.allergies !== undefined) allowed.allergies = updates.allergies.trim();

            const updated = await User.findByIdAndUpdate(id, allowed, { new: true, runValidators: true });
            return updated ? updated.toJSON() : null;
        }

        const db = await getFallbackDb();
        const existing = db.prepare("SELECT * FROM users WHERE id = ?").get(String(id));
        if (!existing) return null;

        const name = updates.name !== undefined ? updates.name.trim() : existing.name;
        const phone = updates.phone !== undefined ? updates.phone.trim() : existing.phone;
        const age = updates.age !== undefined ? (updates.age ? Number(updates.age) : null) : existing.age;
        const gender = updates.gender !== undefined ? updates.gender.trim() : existing.gender;
        const bloodGroup = updates.blood_group !== undefined
            ? updates.blood_group.trim().toUpperCase()
            : updates.bloodGroup !== undefined
            ? updates.bloodGroup.trim().toUpperCase()
            : existing.blood_group;
        const allergies = updates.allergies !== undefined ? updates.allergies.trim() : existing.allergies;
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE users SET name = ?, phone = ?, age = ?, gender = ?, blood_group = ?, allergies = ?, updated_at = ?
            WHERE id = ?
        `).run(name, phone, age, gender, bloodGroup, allergies, now, String(id));

        const updated = mapSqliteUser(db.prepare("SELECT * FROM users WHERE id = ?").get(String(id)));
        delete updated.passwordHash;
        delete updated.password_hash;
        return updated;
    }
};

// Unified Health Record Data Access Layer (MongoDB primary, SQLite fallback)
export const MongoHealthRecordModel = {
    async getAllByUserId(userId, { type, search } = {}) {
        await ensureDatabaseReady();

        if (isMongoConnected()) {
            const filter = { userId };
            if (type && type !== "all") {
                filter.recordType = type;
            }
            if (search && search.trim()) {
                const regex = new RegExp(search.trim(), "i");
                filter.$or = [
                    { title: regex },
                    { diagnosis: regex },
                    { doctorName: regex },
                    { facilityName: regex },
                    { tags: regex }
                ];
            }
            const records = await HealthRecord.find(filter).sort({ date: -1, createdAt: -1 });
            return records.map((r) => r.toJSON());
        }

        const db = await getFallbackDb();
        let sql = "SELECT * FROM health_records WHERE user_id = ?";
        const params = [String(userId)];
        if (type && type !== "all") {
            sql += " AND record_type = ?";
            params.push(type);
        }
        if (search && search.trim()) {
            sql += " AND (title LIKE ? OR diagnosis LIKE ? OR doctor_name LIKE ? OR facility_name LIKE ? OR tags LIKE ?)";
            const pattern = `%${search.trim()}%`;
            params.push(pattern, pattern, pattern, pattern, pattern);
        }
        sql += " ORDER BY date DESC, created_at DESC";
        const rows = db.prepare(sql).all(...params);
        return rows.map(mapSqliteRecord);
    },

    async getById(id, userId) {
        await ensureDatabaseReady();

        if (isMongoConnected()) {
            if (!mongoose.Types.ObjectId.isValid(id)) return null;
            const record = await HealthRecord.findOne({ _id: id, userId });
            return record ? record.toJSON() : null;
        }

        const db = await getFallbackDb();
        const row = db.prepare("SELECT * FROM health_records WHERE id = ? AND user_id = ?").get(String(id), String(userId));
        return mapSqliteRecord(row);
    },

    async create(userId, data) {
        await ensureDatabaseReady();
        const normalizedTags = Array.isArray(data.tags)
            ? data.tags.map((t) => String(t).trim()).filter(Boolean)
            : typeof data.tags === "string"
            ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [];

        if (isMongoConnected()) {
            const record = await HealthRecord.create({
                userId,
                title: data.title ? data.title.trim() : "Medical Record",
                recordType: data.record_type || data.recordType || "prescription",
                date: data.date || new Date().toISOString().split("T")[0],
                doctorName: data.doctor_name || data.doctorName || "",
                facilityName: data.facility_name || data.facilityName || "",
                diagnosis: data.diagnosis || "",
                medicines: data.medicines || [],
                vitalStats: data.vital_stats || data.vitalStats || {},
                attachmentName: data.attachment_name || data.attachmentName || "",
                attachmentPath: data.attachment_path || data.attachmentPath || "",
                tags: normalizedTags
            });
            return record.toJSON();
        }

        const db = await getFallbackDb();
        const id = new mongoose.Types.ObjectId().toString();
        const now = new Date().toISOString();
        db.prepare(`
            INSERT INTO health_records (
                id, user_id, title, record_type, date, doctor_name, facility_name,
                diagnosis, medicines, vital_stats, attachment_name, attachment_path, tags, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            id,
            String(userId),
            data.title ? data.title.trim() : "Medical Record",
            data.record_type || data.recordType || "prescription",
            data.date || now.split("T")[0],
            data.doctor_name || data.doctorName || "",
            data.facility_name || data.facilityName || "",
            data.diagnosis || "",
            JSON.stringify(data.medicines || []),
            JSON.stringify(data.vital_stats || data.vitalStats || {}),
            data.attachment_name || data.attachmentName || "",
            data.attachment_path || data.attachmentPath || "",
            JSON.stringify(normalizedTags),
            now,
            now
        );
        return mapSqliteRecord(db.prepare("SELECT * FROM health_records WHERE id = ?").get(id));
    },

    async update(id, userId, updates) {
        await ensureDatabaseReady();

        if (isMongoConnected()) {
            if (!mongoose.Types.ObjectId.isValid(id)) return null;
            const updateDoc = {};
            if (updates.title !== undefined) updateDoc.title = updates.title.trim();
            if (updates.record_type !== undefined) updateDoc.recordType = updates.record_type;
            if (updates.recordType !== undefined) updateDoc.recordType = updates.recordType;
            if (updates.date !== undefined) updateDoc.date = updates.date;
            if (updates.doctor_name !== undefined) updateDoc.doctorName = updates.doctor_name.trim();
            if (updates.doctorName !== undefined) updateDoc.doctorName = updates.doctorName.trim();
            if (updates.facility_name !== undefined) updateDoc.facilityName = updates.facility_name.trim();
            if (updates.facilityName !== undefined) updateDoc.facilityName = updates.facilityName.trim();
            if (updates.diagnosis !== undefined) updateDoc.diagnosis = updates.diagnosis.trim();
            if (updates.medicines !== undefined) updateDoc.medicines = updates.medicines;
            if (updates.vital_stats !== undefined) updateDoc.vitalStats = updates.vital_stats;
            if (updates.vitalStats !== undefined) updateDoc.vitalStats = updates.vitalStats;
            if (updates.tags !== undefined) {
                updateDoc.tags = Array.isArray(updates.tags)
                    ? updates.tags.map((t) => String(t).trim()).filter(Boolean)
                    : typeof updates.tags === "string"
                    ? updates.tags.split(",").map((t) => t.trim()).filter(Boolean)
                    : [];
            }

            const updated = await HealthRecord.findOneAndUpdate(
                { _id: id, userId },
                { $set: updateDoc },
                { new: true, runValidators: true }
            );
            return updated ? updated.toJSON() : null;
        }

        const db = await getFallbackDb();
        const existing = db.prepare("SELECT * FROM health_records WHERE id = ? AND user_id = ?").get(String(id), String(userId));
        if (!existing) return null;

        const title = updates.title !== undefined ? updates.title.trim() : existing.title;
        const recordType = updates.record_type || updates.recordType || existing.record_type;
        const date = updates.date !== undefined ? updates.date : existing.date;
        const doctorName = updates.doctor_name !== undefined ? updates.doctor_name.trim() : updates.doctorName !== undefined ? updates.doctorName.trim() : existing.doctor_name;
        const facilityName = updates.facility_name !== undefined ? updates.facility_name.trim() : updates.facilityName !== undefined ? updates.facilityName.trim() : existing.facility_name;
        const diagnosis = updates.diagnosis !== undefined ? updates.diagnosis.trim() : existing.diagnosis;
        const medicines = updates.medicines !== undefined ? JSON.stringify(updates.medicines) : existing.medicines;
        const vitalStats = updates.vital_stats !== undefined ? JSON.stringify(updates.vital_stats) : updates.vitalStats !== undefined ? JSON.stringify(updates.vitalStats) : existing.vital_stats;
        let tags = existing.tags;
        if (updates.tags !== undefined) {
            const arr = Array.isArray(updates.tags)
                ? updates.tags.map((t) => String(t).trim()).filter(Boolean)
                : typeof updates.tags === "string"
                ? updates.tags.split(",").map((t) => t.trim()).filter(Boolean)
                : [];
            tags = JSON.stringify(arr);
        }
        const now = new Date().toISOString();

        db.prepare(`
            UPDATE health_records
            SET title = ?, record_type = ?, date = ?, doctor_name = ?, facility_name = ?,
                diagnosis = ?, medicines = ?, vital_stats = ?, tags = ?, updated_at = ?
            WHERE id = ? AND user_id = ?
        `).run(title, recordType, date, doctorName, facilityName, diagnosis, medicines, vitalStats, tags, now, String(id), String(userId));

        return mapSqliteRecord(db.prepare("SELECT * FROM health_records WHERE id = ? AND user_id = ?").get(String(id), String(userId)));
    },

    async delete(id, userId) {
        await ensureDatabaseReady();

        if (isMongoConnected()) {
            if (!mongoose.Types.ObjectId.isValid(id)) return false;
            const res = await HealthRecord.deleteOne({ _id: id, userId });
            return res.deletedCount > 0;
        }

        const db = await getFallbackDb();
        const res = db.prepare("DELETE FROM health_records WHERE id = ? AND user_id = ?").run(String(id), String(userId));
        return res.changes > 0;
    }
};
