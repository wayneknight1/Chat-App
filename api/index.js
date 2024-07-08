const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const dotenv = require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('./Models/User')
const ws = require('ws')
const Message = require('./Models/Message')
 
app.use(express.json()); // Add this line to parse JSON bodies
app.use(cookieParser())
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from this origin
  credentials: true // Allow cookies to be sent
}));

mongoose.connect(process.env.MONGO_URI).then(() =>{
    console.log('mongoose connection successfull')
})
const jwt_secret = process.env.JWT_SECRET
const bcryptSalt = bcrypt.genSaltSync(10)


app.get('/profile',(req,res) => {
    const token = req.cookies?.token
    if(token){
    jwt.verify(token, jwt_secret, {}, (err,userData) => {
        if(err) throw err;
        res.json(userData)
    })}
    // else{
    //     res.status(401).json('No token')
    // }
})

app.post('/login',async (req,res)=>{
    const {username, password} = req.body;
    const foundUser = await User.findOne({username: username})
    if(foundUser){
    const passOk =  bcrypt.compareSync(password, foundUser?.password)
    if(passOk){
        jwt.sign({userId: foundUser._id, username: foundUser.username},jwt_secret,(err,token)=>{
            if(err)
                throw err;
            res.cookie('token',token,{sameSite:'none',secure: true}).json({
                id: foundUser._id
            })
        })
    }
}
})

app.post('/register',async (req,res) => {
    const {username, password} = req.body
    const hashedPassword = bcrypt.hashSync(password,bcryptSalt)
    const createdUser = await User.create({username, password: hashedPassword})
    jwt.sign({userId: createdUser._id, username},jwt_secret,(err,token) =>{
        if(err)
            throw err;
        res.cookie('token',token,{sameSite: 'none', secure: true}).json({
            id: createdUser._id,
        
        })
    })
})

app.get('/test',(req,res)=>{
    res.send('On the test route')
})

const server = app.listen(4000, () => console.log('Listening on port 4000'))

const wss = new ws.Server({server})

wss.on('connection', (connection,req) => {
    //read username and id from the from the cookie for connection
    console.log('connection request for ws received!')
    console.log(req.headers)
    const cookies = req.headers.cookie;
    if(cookies){
        const tokenCookieString = cookies.split(';').find(cookie => cookie.startsWith('token='))
        // console.log(tokenCookieString)
        if(tokenCookieString){
            const token = tokenCookieString.split('=')[1]
            jwt.verify(token,jwt_secret,(err,userData) => {
                if(err) throw err;
                const {username, userId} = userData;
                connection.username = username;
                connection.userId = userId;
            })
        }
    }

    [...wss.clients].forEach(client => {
        client.send(JSON.stringify(
            {
                online: [...wss.clients].map(c => ({userId:c.userId, username: c.username}))
            }
        ))
    })

    connection.on('message',async (message) => {
        const messageData = JSON.parse(message.toString())
        const {recipient, text} = messageData;
        if(recipient && text){
         const messageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text
            });
            [...wss.clients].filter(c => c.userId === recipient)
            .forEach(c => c.send(JSON.stringify({
                text, 
                sender: connection.userId,
                recipient,
                id: messageDoc._id
            })))
        }
    } )

})