const FAST_API = process.env.FAST_API || process.env.FASTAPI_URL || "http://127.0.0.1:8000";

export const SendChat = async (req, res) => {
    try {
        const message = req.body.message || req.body.prompt || req.body.query;

        if (!message || typeof message !== "string" || !message.trim()) {
            return res.status(400).json({
                status: "error",
                message: "A valid 'message' string is required."
            });
        }

        const response = await fetch(`${FAST_API}/user/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ message: message.trim() })
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`FastAPI Chat responded with status ${response.status}:`, errText);
            return res.status(response.status).json({
                status: "error",
                message: "FastAPI AI service returned an error",
                detail: errText
            });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Error in SendChat:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Failed to communicate with AI chat service",
            error: error.message
        });
    }
};

export default { SendChat };
