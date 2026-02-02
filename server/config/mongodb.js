import mongoose from "mongoose";


const connectDB = async () => {

mongoose.connection.on('connected', () =>
    console.log("MongoDB connected successfully"));

    await mongoose.connect(`${process.env.MONGODB_URI}ps`);

  };
export default connectDB;
// Connect to MongoDB using the connection string from environment variables