import express from "express";
import { formularioLogin, formularioRegistro, formularioRecuperarPassword} from "../controllers/usuarioController.js";

const router = express.Router();

router.get('/login',formularioLogin)
router.get('/registro',formularioRegistro)
router.get('/recuperar-password',formularioRecuperarPassword)

export default router