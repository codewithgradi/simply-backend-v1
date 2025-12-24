import 'dotenv/config'
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import frontEndGetRooms from './routes/frontendGetRooms.js'
import visitorRoutes from './routes/visitorRoutes.js'
import companyRoutes from './routes/companyRoutes.js'
import reactivateProfileRoutes from './routes/reactivateProfileRoute.js'
import notificationRoutes from './routes/notificationRoutes.js'
import roomRoutes from './routes/roomRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import { connectDB } from './config/dbConnect.js';
import mongoose from 'mongoose';
import softwareRoutes from './routes/softwareRoutes.js'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import feedbackRoutes from './routes/feedbackRoutes.js';
// import { verifyConnection} from './emailConfig.js';

const app = express();

//CONNECT DATABASE
connectDB()


//DEVELOPMENT CONFIGURATIONS
app.use(cors({
    origin: 'http://localhost:3000',
    credentials:true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Verify email setup on startup
// verifyConnection();

//API ROUTES
app.use('/api/reactivate',reactivateProfileRoutes)
app.use('/api/front-end/rooms',frontEndGetRooms)
app.use("/api/auth",authRoutes)
app.use("/api/visitor", visitorRoutes)
app.use('/api/company', companyRoutes)
app.use('/api/rooms', roomRoutes)
app.use('/api/notification', notificationRoutes)
app.use('/api/sys', softwareRoutes)
app.use('/api/stats', analyticsRoutes)
// app.use('/api/feedback')

//ENSURES WE ONLY LISTEN FOR REQUESTS WHEN WE ARE CONNECTED

mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB")
    app.listen(process.env.PORT || 5001, "0.0.0.0", () => {
        console.log(`Server is running on PORT ${process.env.PORT}`)
    })
})