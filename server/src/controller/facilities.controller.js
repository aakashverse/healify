const FAST_API = process.env.FAST_API || process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export const GetFacilities = async (req, res) => {
    try {
        const response = await fetch(`${FAST_API}/search/facilities`);

        if (!response.ok) {
            const errText = await response.text();
            console.error(`FastAPI Facilities responded with status ${response.status}:`, errText);
            return res.status(response.status).json({
                status: "error",
                message: "FastAPI Facilities service returned an error",
                detail: errText
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error in GetFacilities:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Failed to communicate with facilities service",
            error: error.message
        });
    }
};

export default { GetFacilities };
