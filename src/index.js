require('env2')('./.env');
const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.PORT || 4000

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => {
    console.log(`Server is running on ${port}`)
})

//hash password 
// const bcrypt = require('bcrypt')

// const hashedFunc = async ()=>{
//     let pass = '123456ro'
//     let hashedPass = await bcrypt.hash(pass, 10)
//     console.log({pass}, {hashedPass});

//     const isMatch = await bcrypt.compare(pass, hashedPass)
//     console.log(isMatch);
// }

// hashedFunc()
