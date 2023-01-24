import nodemailer from 'nodemailer'

const emailRegistro = async(datos)=>{
    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      console.log(datos)
      const { email, nombre, token } = datos

      //enviar el email
      await transport.sendMail({
        from: ' Juancito ',
        to: email,
        subject: ' Confirma tu cuenta',
        text: 'Confirma tu email',
        html: `
        <p>Hola ${nombre}, comprueba tu cuenta por favor</p>
        <p>Tu cuenta ya esta lista, solo tenes que confirmarla en el siguiente enlace
        <a href="${process.env.BACKEND_URL}:${process.env.PORT}/auth/confirmar/${token}">confirma tu cuenta</a></p>
        <p>Gracias</p>
        `
      })


}

const recuperarPassword = async(datos)=>{
  const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    console.log(datos)
    const { email, nombre, token } = datos

    //enviar el email
    await transport.sendMail({
      from: ' Juancito ',
      to: email,
      subject: ' Recupera tu contraseña',
      text: 'Recupera tu contraseña',
      html: `
      <p>Hola ${nombre}, solicitaste restablecer tu password</p>
      <p>hace click en el siguiente enlace
      <a href="${process.env.BACKEND_URL}:${process.env.PORT}/auth/confirmar/${token}">confirma tu cuenta</a></p>
      <p>Gracias</p>
      `
    })


}

export{
    emailRegistro,
    recuperarPassword
}