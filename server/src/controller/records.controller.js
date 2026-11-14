import { MongoHealthRecordModel as HealthRecord } from "../db/mongodb.js";

/**
 * Get all health records for authenticated user
 * GET /api/records?type=prescription&search=fever
 */
export const getRecords = async (req, res) => {
    try {
        const { type, search } = req.query;
        const records = await HealthRecord.getAllByUserId(req.userId, { type, search });

        return res.status(200).json({
            status: "success",
            count: records.length,
            data: records
        });
    } catch (error) {
        console.error("Get records error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve health records: " + error.message
        });
    }
};

/**
 * Get single health record by ID
 * GET /api/records/:id
 */
export const getRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await HealthRecord.getById(id, req.userId);

        if (!record) {
            return res.status(404).json({
                status: "error",
                message: "Health record not found."
            });
        }

        return res.status(200).json({
            status: "success",
            data: record
        });
    } catch (error) {
        console.error("Get record error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve health record: " + error.message
        });
    }
};

/**
 * Create a new health record
 * POST /api/records
 */
export const createRecord = async (req, res) => {
    try {
        const {
            title,
            record_type,
            date,
            doctor_name,
            facility_name,
            diagnosis,
            medicines,
            vital_stats,
            attachment_name,
            attachment_path,
            tags
        } = req.body;

        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                status: "error",
                message: "Record title is required (e.g. 'Viral Fever Prescription' or 'Blood Test')."
            });
        }

        const newRecord = await HealthRecord.create(req.userId, {
            title: title.trim(),
            record_type: record_type || "prescription",
            date: date || new Date().toISOString().split("T")[0],
            doctor_name: doctor_name || "",
            facility_name: facility_name || "",
            diagnosis: diagnosis || "",
            medicines: Array.isArray(medicines) ? medicines : [],
            vital_stats: typeof vital_stats === "object" && vital_stats !== null ? vital_stats : {},
            attachment_name: attachment_name || "",
            attachment_path: attachment_path || "",
            tags: tags || ""
        });

        return res.status(201).json({
            status: "success",
            message: "Health record saved successfully to your health locker.",
            data: newRecord
        });
    } catch (error) {
        console.error("Create record error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to save health record: " + error.message
        });
    }
};

/**
 * Update an existing health record
 * PUT /api/records/:id
 */
export const updateRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await HealthRecord.update(id, req.userId, req.body);

        if (!updated) {
            return res.status(404).json({
                status: "error",
                message: "Health record not found or unauthorized to update."
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Health record updated successfully.",
            data: updated
        });
    } catch (error) {
        console.error("Update record error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to update health record: " + error.message
        });
    }
};

/**
 * Delete a health record
 * DELETE /api/records/:id
 */
export const deleteRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const record = await HealthRecord.getById(id, req.userId);

        if (!record) {
            return res.status(404).json({
                status: "error",
                message: "Health record not found."
            });
        }

        await HealthRecord.delete(id, req.userId);

        return res.status(200).json({
            status: "success",
            message: "Health record removed successfully."
        });
    } catch (error) {
        console.error("Delete record error:", error);
        return res.status(500).json({
            status: "error",
            message: "Failed to delete health record: " + error.message
        });
    }
};

export default {
    getRecords,
    getRecord,
    createRecord,
    updateRecord,
    deleteRecord
};
