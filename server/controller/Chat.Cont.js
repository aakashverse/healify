const URL= process.env.FAST_API;

const SendChat = async(req,res)=>{
    try {
        const chat = req.body;
        const resp = await axios.post(`${URL}/chat`, chat);

        res.status(201).send(resp.data);

    } catch (error) {
        res.send(`Some Error Occured! ${error.message}`);
    }
}

export default {SendChat}