import mongoose from "mongoose";

const MedicineSubSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        dosage: { type: String, default: "" },
        schedule: {
            morning: { type: Boolean, default: false },
            afternoon: { type: Boolean, default: false },
            night: { type: Boolean, default: false }
        },
        meal_timing: { type: String, default: "after_food" },
        timing: { type: String, default: "" },
        duration: { type: String, default: "" },
        instructions: { type: String, default: "" },
        warning: { type: String, default: "" }
    },
    { _id: false }
);

const HealthRecordSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
            index: true
        },
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true
        },
        recordType: {
            type: String,
            enum: ["prescription", "consultation", "lab_report", "other"],
            default: "prescription",
            index: true
        },
        date: {
            type: String,
            default: () => new Date().toISOString().split("T")[0],
            index: true
        },
        doctorName: {
            type: String,
            trim: true,
            default: ""
        },
        facilityName: {
            type: String,
            trim: true,
            default: ""
        },
        diagnosis: {
            type: String,
            trim: true,
            default: ""
        },
        medicines: {
            type: [MedicineSubSchema],
            default: []
        },
        vitalStats: {
            type: mongoose.Schema.Types.Mixed,
            default: () => ({})
        },
        attachmentName: {
            type: String,
            default: ""
        },
        attachmentPath: {
            type: String,
            default: ""
        },
        tags: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id ? ret._id.toString() : ret.id;
                ret.record_type = ret.recordType;
                ret.doctor_name = ret.doctorName;
                ret.facility_name = ret.facilityName;
                ret.vital_stats = ret.vitalStats || {};
                ret.attachment_name = ret.attachmentName || "";
                ret.attachment_path = ret.attachmentPath || "";
                delete ret._id;
                delete ret.__v;
                return ret;
            }
        }
    }
);

// Compound text index for search across titles, diagnosis, doctors, facilities, and tags
HealthRecordSchema.index({
    title: "text",
    diagnosis: "text",
    doctorName: "text",
    facilityName: "text",
    tags: "text"
});

HealthRecordSchema.statics.getAllByUserId = async function (userId, { type, search } = {}) {
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
    const records = await this.find(filter).sort({ date: -1, createdAt: -1 });
    return records.map((r) => r.toJSON());
};

HealthRecordSchema.statics.getById = async function (id, userId) {
    const record = await this.findOne({ _id: id, userId });
    return record ? record.toJSON() : null;
};

export const HealthRecord = mongoose.models.HealthRecord || mongoose.model("HealthRecord", HealthRecordSchema);
export default HealthRecord;
