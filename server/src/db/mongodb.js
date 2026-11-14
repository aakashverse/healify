import mongoose from "mongoose";
import { User } from "../models/User.model.js";
import { HealthRecord } from "../models/HealthRecord.model.js";


let isConnected = false;

export function isMongoConnected() {
    return isConnected && mongoose.connection.readyState === 1;
}

export async function connectMongoDB() {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/healu";

    try {
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 3000,
            connectTimeoutMS: 3000
        });

        isConnected = true;
        console.log("MongoDB Connected successfully to database: " + mongoose.connection.name);
        return true;
    } catch (error) {
        isConnected = false;
        console.warn("MongoDB] Connection failed (" + error.message + ")");
        return false;
    }
}

// Clean Data Access Layer wrapping Mongoose
export const MongoUserModel = {
    async findByEmail(email) {
        if (!email) return null;
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) return null;
        const userObj = user.toJSON();
        userObj.password_hash = user.passwordHash;
        return userObj;
    },

    async findById(id) {
        if (!id) return null;
        const user = await User.findById(id);
        if (!user) return null;
        const userObj = user.toJSON();
        userObj.password_hash = user.passwordHash;
        return userObj;
    },

    async create({ name, email, passwordHash, phone, age, gender, bloodGroup, allergies }) {
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            passwordHash,
            phone: phone ? phone.trim() : "",
            age: age ? Number(age) : null,
            gender: gender ? gender.trim() : "",
            bloodGroup: bloodGroup ? bloodGroup.trim().toUpperCase() : "",
            allergies: allergies ? allergies.trim() : ""
        });
        return user.toJSON();
    },

    async updateProfile(id, updates) {
        const allowed = {};
        if (updates.name !== undefined) allowed.name = updates.name.trim();
        if (updates.phone !== undefined) allowed.phone = updates.phone.trim();
        if (updates.age !== undefined) allowed.age = Number(updates.age);
        if (updates.gender !== undefined) allowed.gender = updates.gender.trim();
        if (updates.blood_group !== undefined) allowed.bloodGroup = updates.blood_group.trim().toUpperCase();
        if (updates.bloodGroup !== undefined) allowed.bloodGroup = updates.bloodGroup.trim().toUpperCase();
        if (updates.allergies !== undefined) allowed.allergies = updates.allergies.trim();

        const updated = await User.findByIdAndUpdate(id, allowed, { new: true, runValidators: true });
        return updated ? updated.toJSON() : null;
    }
};

export const MongoHealthRecordModel = {
    async getAllByUserId(userId, { type, search } = {}) {
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
    },

    async getById(id, userId) {
        const record = await HealthRecord.findOne({ _id: id, userId });
        return record ? record.toJSON() : null;
    },

    async create(userId, data) {
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
            tags: Array.isArray(data.tags)
                ? data.tags.map((t) => String(t).trim()).filter(Boolean)
                : typeof data.tags === "string"
                ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
                : []
        });

        return record.toJSON();
    },

    async update(id, userId, updates) {
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
    },

    async delete(id, userId) {
        const res = await HealthRecord.deleteOne({ _id: id, userId });
        return res.deletedCount > 0;
    }
};
