import 'dotenv/config'
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import visitorRoutes from './routes/visitorRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import roomRoutes from './routes/roomRoutes.js'
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
        methods: ["GET", "POST"]
    }
});

app.set('socketio', io);

io.on('connection', (socket) => {
    socket.on('join-company-room', (companyId) => {
        socket.join(companyId);
        console.log(`Company ${companyId} joined socket room`);
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


//SERVER
const server = app.listen(process.env.PORT || 5001, "0.0.0.0", () => {
    console.log(`Server is running on PORT ${process.env.PORT}`)
})


//ENSURES WE ONLY LISTEN FOR REQUESTS WHEN WE ARE CONNECTED

mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB")
    app.listen(process.env.PORT || 5001, "0.0.0.0", () => {
        console.log(`Server is running on PORT ${process.env.PORT}`)
    })
})