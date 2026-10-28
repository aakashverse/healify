
import axios from "axios";
import FormData from "form-data";

const URL= process.env.FAST_API;

const ExplainImg = async (req,res)=>{
    try {
        const resp = await axios.post(`${URL}/explain`,req.body);
        return res.status(200).json(resp.data);

    } catch (error) {
        console.error("Error in ExplainImg:", error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            status: "error",
            message: error.response?.data?.detail || "Failed to analyze prescription"
        });
    }
}


const UploadImg = async(req,res)=>{
    try {
        // const resp = await axios.post(`${URL}/upload`,req.body);
        if (!req.file) {
            return res.status(400).json({ status: "error", message: "No file uploaded" });
        }

        const form = new FormData();
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

          //file to buffer
        const resp = await axios.post(`${URL}/upload`, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        return res.status(200).json(resp.data);

    } catch (error) {
         console.error("Error in UploadImg:", error.response?.data || error.message);
        return res.status(error.response?.status || 500).json({
            status: "error",
            message: error.response?.data?.detail || "Failed to upload and analyze prescription"
        });        
    }
}

export {ExplainImg,UploadImg}