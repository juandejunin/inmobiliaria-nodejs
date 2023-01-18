import express from "express";
const router = express.Router();

router.get('/',(req,res)=>{
    res.send('Hola inmobiliaria')
})
router.post('/',(req,res)=>{
    res.json('{msg:"Respuesta por POST"}')
})
 export default router