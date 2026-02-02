import express from 'express'; // eslint-disable-line no-unused-vars
import authRouter from './routes/authRouter.js'; // Import the auth router
import { configDotenv } from 'dotenv';
import cors from 'cors'; 
import 'dotenv/config'; // Import environment variables
import cookieParser from 'cookie-parser';   // Import cookie parser for handling cookies        
import connectDB from './config/mongodb.js'; // Import the MongoDB connection function

connectDB(); // Connect to MongoDB
const app = express(); // Create an instance of express
const PORT = process.env.PORT || 3000; // Set the port from environment variables or default to 5000

 app.use(express.json())// Parse URL-encoded bodies
app.use(cookieParser()); // Use cookie parser middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
 // Enable CORS for all routes


app.get('/', (req, res) => res.send('Hello World!')); // Respond with a simple message
app.use('/api/auth', authRouter); // Use the auth router for authentication routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`); // Log server start message
});











