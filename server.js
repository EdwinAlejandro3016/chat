const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUser} = require('./utils/users');

const server = http.createServer(app);
const io = socketIO(server);

const botName = 'CharCord Bot';
//static files
app.use(express.static(path.join(__dirname,'public')));


//Run when client connects
io.on('connection', socket=>{

    socket.on('joinRoom',({username,room})=>{

        const user = userJoin(socket.id,username,room);

        socket.join(user.room)
        //Welcome current user
        socket.emit('message',formatMessage(botName,' Welcome to Chat'));

        //broadcast when a user connects
        socket.broadcast.to(user.room).emit('message',formatMessage(botName,`${user.username} has joined the chat`));
        //send users and room info
        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUser(user.room)
        })    
    })

    // Listen for Chat Message
    socket.on('chatMessage',msg=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

        //Runs when client disconnects
        socket.on('disconnect',()=>{
            const user = userLeave(socket.id);

            if(user){
                io.to(user.room).emit('message',formatMessage(botName,`${user.username} has left the chat`));
                //send users and room info
                io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUser(user.room)
                 })  
            
            }

        })
})

const PORT = 3000 || process.env.PORT;

server.listen(PORT,()=>{
    console.log('listen server on PORT ',PORT);
})