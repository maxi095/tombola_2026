import mongoose from "mongoose";
import { MONGODB_URI } from "./config.js";

export const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        
        // Enmascarar credenciales si la URI contiene usuario/password para evitar fugas en logs
        const safeURI = MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@');
        console.log("DB is connected to:", safeURI);
    } catch (error) {
        console.error("Error connecting to the database:", error.message);
    }
};
