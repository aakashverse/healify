
const URL= process.env.FAST_API;

const GetFacilities = async(req,res)=>{
     try {
         const resp = await axios.get(`${URL}/facilities`);
         res.status(201).send(resp);

     } catch (error) {
        res.send(`Some Error Occured! ${error.message}`);
     }
}


export default {GetFacilities}