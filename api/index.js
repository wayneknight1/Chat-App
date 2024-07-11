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

const PORT = process.env.PORT || 4000

 
app.use(express.json()); // Add this line to parse JSON bodies
app.use(cookieParser())
app.use(cors({
   origin: ['https://silver-pithivier-67c5a4.netlify.app','https://668fddcd2a3e2025d4a941b3--silver-pithivier-67c5a4.netlify.app','https://668fd651c07f281d4b9188b9--kaleidoscopic-longma-bb201e.netlify.app','http://localhost:5173'],
  credentials: true // Allow cookies to be sent
}));

mongoose.connect(process.env.MONGO_URI).then(() =>{
    console.log('mongoose connection successfull')
})
const jwt_secret = process.env.JWT_SECRET
const bcryptSalt = bcrypt.genSaltSync(10)

const verifyJWT = (req, res, next) => {
    const token = req.cookies?.token;
    if (token) {
        jwt.verify(token, jwt_secret, (err, userData) => {
            if (err) {
                return res.status(403).json({ error: 'Token verification failed' });
            }
            req.userData = userData;
            next();
        });
    } else {
        return res.status(401).json({ error: 'No token provided' });
    }
};

app.get('/people',async (req,res) => {
    const users = await User.find({},{_id: 1, username: 1})
    res.json(users)
})

app.get('/profile',verifyJWT,(req,res) => {
    const token = req.cookies?.token
    console.log('cookies in /profile are '+JSON.stringify(req.cookies))
    if(token){
    jwt.verify(token, jwt_secret, {}, (err,userData) => {
        if(err) throw err;
        res.json(userData)
    })
    // console.log('token in /profile is '+JSON.stringify(token))
    }
    // else{
    //     res.status(401).json('No token')
    // }
})

async function getUserDataFromRequest(req){
    return new Promise((resolve, reject) => {
        const token = req.cookies?.token
    if(token){
    jwt.verify(token, jwt_secret, {}, (err,userData) => {
        if(err) throw err;
        resolve(userData)
    })}
    else{
        reject('No token!')
    }
    })
    
}

app.get('/messages/:userId',async(req,res) =>{
    const {userId} = req.params;
    const userData = await getUserDataFromRequest(req)
    const ourUserId = userData.userId
    // console.log([userId, ourUserId])
    const messages = await Message.find({
        sender: {$in: [userId, ourUserId]},
        recipient: {$in: [userId, ourUserId]}
    }).sort({createdAt: 1})
    res.json(messages)
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
            // console.log('successfully signed the cookie with token '+token)
            res.cookie('token',token,{sameSite:'none',secure: true}).json({
                id: foundUser._id
            })
        })
    }
}
})

app.post('/logout', (req,res)=>{
    res.cookie('token',null,{sameSite:'none', secure: true}).json('ok')
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

const server = app.listen(PORT, () => console.log('Listening on port 4000'))

const wss = new ws.Server({server})

wss.on('connection', (connection,req) => {
    //read username and id from the from the cookie for connection

    function notifyAboutOnlinePeople(){
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify(
                {
                    online: [...wss.clients].map(c => ({userId:c.userId, username: c.username}))
                }
            ))
        })
    }


    connection.isAlive = true;
    connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            clearInterval(connection.timer)
            connection.terminate();
            notifyAboutOnlinePeople()
        },1000)
    },10000)

    connection.on('pong',() => {
        clearInterval(connection.deathTimer)
    })

    const cookies = req.headers.cookie;
    if(cookies){
        const tokenCookieString = cookies.split(';').find(cookie => cookie.startsWith('token='))
        // console.log(tokenCookieString)
            const token = tokenCookieString.split('=')[1]
            console.log('token is '+token)
            jwt.verify(token,jwt_secret,(err,userData) => {
                if(err) throw err;
                const {username, userId} = userData;
                connection.username = username;
                connection.userId = userId;
            })
        
    }

    notifyAboutOnlinePeople()

    // [...wss.clients].forEach(client => {
    //     client.send(JSON.stringify(
    //         {
    //             online: [...wss.clients].map(c => ({userId:c.userId, username: c.username}))
    //         }
    //     ))
    // })

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
                _id: messageDoc._id
            })))
        }
    } )

})