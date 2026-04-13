import mongoose from "mongoose";
import "dotenv/config.js";
import Edition from "../src/models/edition.model.js";

async function findIDs() {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb");
    const e25 = await Edition.findOne({ name: "2025" });
    const e26 = await Edition.findOne({ name: "2026" });
    console.log(`ID 2025: ${e25?._id}`);
    console.log(`ID 2026: ${e26?._id}`);
    await mongoose.disconnect();
}
findIDs();
