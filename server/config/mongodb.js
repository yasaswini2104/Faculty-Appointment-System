import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); 

const MONGODB_URI = process.env.MONGODB_URI;  

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            autoIndex: false,  
        });
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("Database Connection Failed", error);
        process.exit(1);  
    }
};

export default connectDB;
