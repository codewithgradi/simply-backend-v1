import 'dotenv/config'
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import visitorRoutes from './routes/visitorRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import roomRoutes from './routes/roomRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import { connectDB } from './config/dbConnect.js';
import mongoose from 'mongoose';
import softwareRoutes from './routes/softwareRoutes.js'
import cookieParser from 'cookie-parser'
import whatsAppRoutes from './routes/whatsAppRoutes.js'
import { createServer } from 'http'; 
import { Server } from 'socket.io';
import cors from 'cors'

const app = express();

//CONNECT DATABASE
connectDB()
const httpServer = createServer(app); 

const io = new Server(httpServer, {
    cors: {
        origin: "*", // Adjust this for production security
        methods: ["GET", "POST"],
        credentials:true
    },
    allowEIO3:true
});

app.set('socketio', io);

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join-company-room', (companyId) => {
    if (companyId) {
      socket.join(companyId);
      console.log(`Socket ${socket.id} joined room: ${companyId}`);
      
      // OPTIONAL: Tell the frontend the room join was successful
      socket.emit('room-joined', { success: true });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

//DEVELOPMENT CONFIGURATIONS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials:true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())



//API ROUTES
app.use("/api/auth",authRoutes)
app.use("/api/visitor", visitorRoutes)
app.use('/api/company', companyRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/notification', notificationRoutes)
app.use('/api/sys', softwareRoutes)
app.use('/api/whatsapp',whatsAppRoutes)
app.use('/api/stats',analyticsRoutes)


//SERVER
// const server = app.listen(process.env.PORT || 5001, "0.0.0.0", () => {
//     console.log(`Server is running on PORT ${process.env.PORT}`)
// })


//ENSURES WE ONLY LISTEN FOR REQUESTS WHEN WE ARE CONNECTED

mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB")
    httpServer.listen(process.env.PORT || 5001, "0.0.0.0", () => {
        console.log(`Server is running on PORT ${process.env.PORT}`)
    })
})