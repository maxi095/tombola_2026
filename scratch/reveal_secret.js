import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";
import Edition from "../src/models/edition.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function revealSecret() {
    try {
        await mongoose.connect(MONGODB_URI);
        const edition = await Edition.findOne({ name: "2026" });
        const bingoCards = await BingoCard.find({ edition: edition._id });

        const s1_sets = bingoCards.map(c => ({
            number: c.number,
            numbers: c.cardSets.find(cs => cs.setNumber === 1).numbers.sort((a,b) => a-b)
        }));

        // Simular uno solo
        const balls = Array.from({ length: 70 }, (_, i) => i + 1);
        for (let i = balls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [balls[i], balls[j]] = [balls[j], balls[i]];
        }
        const ballPos = new Array(71);
        balls.forEach((b, i) => ballPos[b] = i);

        const results = s1_sets.map(s => ({
            number: s.number,
            finish: Math.max(...s.numbers.map(n => ballPos[n])),
            numbers: s.numbers
        })).sort((a, b) => a.finish - b.finish);

        console.log("WINNER 1:");
        console.log(`Card #${results[0].number} finished at ball index ${results[0].finish}`);
        console.log(`Numbers: ${results[0].numbers.join(",")}`);

        console.log("\nNEXT 4 WINNERS (Simultaneous):");
        for (let i = 1; i <= 4; i++) {
            console.log(`Card #${results[i].number} finished at ball index ${results[i].finish}`);
            console.log(`Numbers: ${results[i].numbers.join(",")}`);
        }

        // Compare Winner 1 and Winner 2
        const w1 = new Set(results[0].numbers);
        const w2 = new Set(results[1].numbers);
        const inter = results[0].numbers.filter(n => w2.has(n));
        console.log(`\nIntersection W1 & W2: ${inter.length} numbers`);
        console.log(`W1 unique: ${results[0].numbers.filter(n => !w2.has(n))}`);
        console.log(`W2 unique: ${results[1].numbers.filter(n => !w1.has(n))}`);

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

revealSecret();
