const express = require("express")
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./route/userRoute")
const messageRoute = require("./route/messagesRoute")
const socket = require("socket.io");

const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());

app.use("/api/auth",userRoutes);
app.use("/api/messages",messageRoute);


mongoose.connect(process.env.MONGO_URL).
then(()=>console.log("DB connected successfully"))
.catch((error)=>{
    console.log("Db connection failed",error);
})

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server Started on Port ${process.env.PORT}`);
});

const io =socket(server,{
    cors:{
        origin:"http://localhost:3000",
        credential:"true",
    },
});

global.onlineUsers = new Map();

io.on("connection",(socket)=>{
    global.chatSocket = socket;
    socket.on("add-user",(userId)=>{
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data)=>{
        const sendUserSocket = onlineUsers.get(data.to);
        if(sendUserSocket){
            socket.to(sendUserSocket).emit("msg-recieve",data.message);
        }
    });
});