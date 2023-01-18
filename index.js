const express = require('express')

const app = express()

app.get('/', function(req,res){
    res.send('Hola inmobiliaria')
})
app.get('/nosotros', function(req,res){
    res.send('Informacion sobre nosotros')
})
const port = 3000

app.listen(port, ()=>{
    console.log(`El servidor esta funcionando en el puerto ${port}`)
})