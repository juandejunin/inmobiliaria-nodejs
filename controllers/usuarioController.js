import { check, validationResult } from 'express-validator'
import Usuario from "../models/Usuario.js"
import { genararId } from '../helpers/tokens.js'
import { emailRegistro } from '../helpers/email.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión'
    })
}

const formularioRegistro = (req, res) => {
    res.render('auth/registro', {
        pagina: 'Crear Cuenta',
        csrfToken: req.csrfToken()
        
    })
    
}
const registrar = async (req, res) => {

    //validaciones
    await check('nombre').notEmpty().withMessage('Nombre no puede estar vacio').run(req)
    await check('email').isEmail().withMessage('El email ingresado no es valido ').run(req)
    await check('password').isLength({ min: 6 }).withMessage('El Password debe ser de al menos 6 caracteres').run(req)
    await check('repetir_password').equals(req.body.password).withMessage('Los Passwords no son iguales').run(req)
    let resultado = validationResult(req)


    //verificar resultados vacios
    if (!resultado.isEmpty()) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            // csrfToken: req.csrfToken(),
            errores: resultado.array(),
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })

    }
    //extraer los datos
    const { nombre, email, password } = req.body
    //verificar que el usuario no este registrado
    const existeUsuario = await Usuario.findOne({ where: { email } })
    if (existeUsuario) {
        return res.render('auth/registro', {
            pagina: 'Crear Cuenta',
            errores: [{ msg: 'El usuario ya esta registrado' }],
            usuario: {
                nombre: req.body.nombre,
                email: req.body.email
            }
        })
        return;
    }
    // Almacenar usuario
    const usuario = await Usuario.create({
        nombre,
        email,
        password,
        token: genararId()
    })

    //enviar email de confirmacion
    emailRegistro({
        nombre: usuario.nombre,
        email: usuario.email,
        token: usuario.token
    })


    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje', {
        pagina: 'Cuenta creada correctamente',
        mensaje: 'Hemos enviado un email de confirmacion, presiona en el enlace'
    })

}
//funcion  que comprueba una cuenta
const confirmar = async (req, res) => {
    const { token } = req.params
    console.log(token)
    //  Verificar si el toquen es valido
    const usuario = await Usuario.findOne({ where: { token } })
    console.log(usuario)

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Error al confirmar tu cuenta',
            mensaje: 'Hubo un error al confirmar tu cuenta, por favor intenta de nuevo',
            error: true
        })
    }
    //Confirmar la cuenta
    usuario.token = null
    usuario.confirmado = true
    await usuario.save()
    res.render('auth/confirmar-cuenta', {
        pagina: 'Cuenta confirmada',
        mensaje: 'La cuenta se confirmo exitosamente'
    })

    console.log(usuario)
}

const formularioRecuperarPassword = (req, res) => {
    res.render('auth/recuperar-password', {
        pagina: 'Recupera tu Password'
    })
}
export {
    formularioLogin,
    formularioRegistro,
    confirmar,
    formularioRecuperarPassword,
    registrar
}