const URL= process.env.FAST_API;

const ExplainImg = async (req,res)=>{
    try {
        const resp = await axios.post(`${URL}/explain`,req.body);

    } catch (error) {
        
    }
}


const UploadImg = async(req,res)=>{
    try {
        const resp = await axios.post(`${URL}/upload`,req.body);

    } catch (error) {
        
    }
}

export {ExplainImg,UploadImg}