import express from "express";
import { formularioLogin, formularioRegistro, formularioRecuperarPassword,resetPassword, registrar, confirmar} from "../controllers/usuarioController.js";

const router = express.Router();

router.get('/login',formularioLogin)

router.get('/registro',formularioRegistro)
router.post('/registro',registrar)

router.get('/confirmar/:token', confirmar)
router.get('/recuperar-password',formularioRecuperarPassword)
router.post('/recuperar-password',resetPassword)

//Almacenar nueva contraseña
router.get('/recuperar-password/:token', comprobarToken)
router.post('/recuperar-password/:token', nuevoToken)


export default router