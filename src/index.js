const express=require('express')
const app=express()
require('./db/mongoose')

const UserRouter=require("../src/router/users")
const TaskRouter=require("../src/router/tasks")
app.use(express.json())

app.use(UserRouter)
app.use(TaskRouter)















const PORT=process.env.PORT


app.listen(PORT,()=>{

    console.log('Port '+PORT+" is up and running");

})