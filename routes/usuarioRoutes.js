import express from "express";
import { formularioLogin, autenticar, formularioRegistro, formularioRecuperarPassword,resetPassword, registrar, confirmar, comprobarToken, nuevoPassword} from "../controllers/usuarioController.js";

const router = express.Router();

router.get('/login',formularioLogin)
    .post('/login', autenticar)

router.get('/registro',formularioRegistro)
router.post('/registro',registrar)

router.get('/confirmar/:token', confirmar)

router.get('/recuperar-password',formularioRecuperarPassword)
router.post('/recuperar-password',resetPassword)

//Almacenar nueva contraseña
router.get('/recuperar-password/:token', comprobarToken)
router.post('/recuperar-password/:token', nuevoPassword)


export default router