import { check, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Usuario from "../models/Usuario.js"
import { genararId, generarJWT } from '../helpers/tokens.js'
import { emailRegistro, emailRecuperarPassword } from '../helpers/email.js'

const formularioLogin = (req, res) => {
    res.render('auth/login', {
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    })
}

const autenticar = async (req, res) => {
    await check('email').isEmail().withMessage('El email ingresado no es valido ').run(req)
    await check('password').notEmpty().withMessage('El Password es obligatorio').run(req)

    let resultado = validationResult(req)


    //verificar resultados vacios
    if (!resultado.isEmpty()) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesion',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),

        })

    }

    const { email, password } = req.body
    //Comprobar si el usuario existe
    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesion',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario no existe' }]
        })

    }

    //comprobar si el usuario esta confirmado
    if (!usuario.confirmado) {
        return res.render('auth/login', {
            pagina: 'Iniciar sesion',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El usuario esta confirmado' }]
        })

    }

    //Revisar el password
    const userDB = await Usuario.findOne({ where: { email } })
    if (!bcrypt.compareSync(password, userDB.password)) {
        return res.render('auth/login', {
            pagina: 'Iniciar Sesión',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El Password es Incorrecto' }]
        })
    }

    // Autenticar al usuario
    const token = generarJWT({ id: usuario.id, nombre: usuario.nombre })

    console.log(token)

    // Almacenar en un cookie

    return res.cookie('_token', token, {
        httpOnly: true,
        // secure: true,
        // sameSite: true
    }).redirect('/mis-propiedades')

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
            csrfToken: req.csrfToken(),
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
            csrfToken: req.csrfToken(),
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
        pagina: 'Recupera tu Password',
        csrfToken: req.csrfToken()
    })
}

const resetPassword = async (req, res) => {
    //validaciones

    await check('email').isEmail().withMessage('El email ingresado no es valido ').run(req)

    let resultado = validationResult(req)


    //verificar resultados vacios
    if (!resultado.isEmpty()) {
        return res.render('auth/recuperar-password', {
            pagina: 'Recupera tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array()

        })

    }
    //buscar el usuario
    const { email } = req.body

    const usuario = await Usuario.findOne({ where: { email } })
    if (!usuario) {
        return res.render('auth/recuperar-password', {
            pagina: 'Recupera tu Password',
            csrfToken: req.csrfToken(),
            errores: [{ msg: 'El email no pertenece a ningun usuario' }]
        })
    }
    //generar un nuevo token
    usuario.token = genararId();
    await usuario.save();

    //enviar email
    emailRecuperarPassword({
        email: usuario.email,
        nombre: usuario.nombre,
        token: usuario.token
    })

    //Randerizar un msj

    res.render('templates/mensaje', {
        pagina: 'Restablece tu password',
        mensaje: 'Hemos enviado un email de con las instrucciones para restablecer el password'
    })
}

const comprobarToken = async (req, res) => {
    const { token } = req.params;

    const usuario = await Usuario.findOne({ where: { token } })

    if (!usuario) {
        return res.render('auth/confirmar-cuenta', {
            pagina: 'Reestablece tu password',
            mensaje: 'Hubo un error al validar tu informacion',
            error: true
        })
    }

    //Mostrar formulario para modificar el password
    res.render('auth/reset-password', {
        pagina: ' Reestablece tu password',
        csrfToken: req.csrfToken()
    })



}

const nuevoPassword = async (req, res) => {
    //Validar el password
    await check('password').isLength({ min: 6 }).withMessage('El Password debe ser de al menos 6 caracteres').run(req)

    let resultado = validationResult(req)
    //verificar resultados vacios
    if (!resultado.isEmpty()) {
        return res.render('auth/reset-password', {
            pagina: 'Reestablece tu Password',
            csrfToken: req.csrfToken(),
            errores: resultado.array(),
        })

    }

    const { token } = req.params
    const { password } = req.body
    //Identificar quien hace el cambio

    const usuario = await Usuario.findOne({ where: { token } })
    console.log(usuario)


    //hashear el nuevo password

    const salt = await bcrypt.genSalt(10)
    usuario.password = await bcrypt.hash(password, salt)
    usuario.token = null

    await usuario.save()

    res.render('auth/confirmar-cuenta'), {
        pagina: 'Password reestablecido',
        mensaje: 'El password se actualizo correctamente'
    }
}
export {
    formularioLogin,
    autenticar,
    formularioRegistro,
    confirmar,
    formularioRecuperarPassword,
    resetPassword,
    registrar,
    comprobarToken,
    nuevoPassword
}