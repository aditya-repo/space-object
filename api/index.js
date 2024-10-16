const express = require("express")
const app = express()
const cors = require("cors")
const mainRouter = require('./routes/index')

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.get('/', (req, res)=> res.json({mesage: "Hello Home!"}))
app.use('/', mainRouter)

app.listen(3030, ()=>{
    console.log("Server started on PORT: 3030");
})

