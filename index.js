import express from 'express'
import usuarioRoutes from './routes/usuarioRoutes.js'
import db from './config/db.js'
import e from 'express'
// Crear la app
const app = express()

//conexion a la base de datos
try {
    await db.authenticate();
    console.log('Conectado a la base de datos')
    
} catch (error) {
    console.log(error)
}
// Habilitar Pug
app.set('view engine', 'pug')
app.set('views', './views')

//Carpeta publica
app.use(express.static('public'))

// Routing
app.use('/auth', usuarioRoutes)

//Definir el puerto y arrancar el proyecto
const port = 3000
app.listen(port, ()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})