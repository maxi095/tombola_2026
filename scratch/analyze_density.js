import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function analyzeIntersectionMatrix() {
    try {
        await mongoose.connect(MONGODB_URI);
        const cartones = await BingoCard.find({ edition: "69d93711e325309d39c0d895" }).limit(100);
        const sets = cartones.map(c => new Set(c.cardSets.find(cs => cs.setNumber === 1).numbers));

        let sum = 0;
        let count = 0;
        let maxInt = 0;

        for (let i = 0; i < sets.length; i++) {
            for (let j = i + 1; j < sets.length; j++) {
                const intersect = [...sets[i]].filter(x => sets[j].has(x)).length;
                sum += intersect;
                count++;
                if (intersect > maxInt) maxInt = intersect;
            }
        }

        console.log(`Average Intersection (Sorteo 1): ${(sum/count).toFixed(2)} numbers`);
        console.log(`Max Intersection between any two: ${maxInt} numbers`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

analyzeIntersectionMatrix();
