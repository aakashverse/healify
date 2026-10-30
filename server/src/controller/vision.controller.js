const FAST_API = process.env.FAST_API || process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export const ExplainImg = async (req, res) => {
    try {
        const response = await fetch(`${FAST_API}/vision/explain`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`FastAPI Vision Explain responded with status ${response.status}:`, errText);
            return res.status(response.status).json({
                status: "error",
                message: "Failed to analyze prescription image",
                detail: errText
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error in ExplainImg:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Failed to communicate with vision explanation service",
            error: error.message
        });
    }
};

export const UploadImg = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: "error",
                message: "No file uploaded. Please attach a prescription image (.jpg, .png, etc.)"
            });
        }

        const formData = new FormData();
        const fileBlob = new Blob([req.file.buffer], {
            type: req.file.mimetype || "application/octet-stream"
        });
        formData.append("file", fileBlob, req.file.originalname || "prescription.jpg");

        const response = await fetch(`${FAST_API}/vision/upload`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`FastAPI Vision Upload responded with status ${response.status}:`, errText);
            return res.status(response.status).json({
                status: "error",
                message: "Failed to upload and analyze prescription",
                detail: errText
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error in UploadImg:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Failed to upload and process prescription file",
            error: error.message
        });
    }
};

export default { ExplainImg, UploadImg };
