import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function whoWinsEveryTime() {
    try {
        await mongoose.connect(MONGODB_URI);
        const cartones = await BingoCard.find({ edition: "69d93711e325309d39c0d895" });
        const s1_sets = cartones.map(c => ({
            num: c.number,
            n: c.cardSets.find(cs => cs.setNumber === 1).numbers.sort((a,b) => a-b)
        }));

        const balls = Array.from({ length: 70 }, (_, i) => i + 1);

        for (let t = 1; t <= 10; t++) {
            // Shuffle
            for (let i = balls.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [balls[i], balls[j]] = [balls[j], balls[i]];
            }
            const ballPos = new Array(71);
            balls.forEach((b, i) => ballPos[b] = i);

            const results = s1_sets.map(s => ({
                num: s.num,
                finish: Math.max(...s.n.map(n => ballPos[n]))
            })).sort((a, b) => a.finish - b.finish);

            console.log(`Draw #${t} winners: 1st: #${results[0].num}, 2nd ties: [#${results[1].num}, #${results[2].num}, #${results[3].num}, #${results[4].num}]`);
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

whoWinsEveryTime();
