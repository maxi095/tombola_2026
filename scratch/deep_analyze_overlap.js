import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function analyzeWinningGroup() {
    try {
        await mongoose.connect(MONGODB_URI);
        const cartones = await BingoCard.find({ edition: "69d93711e325309d39c0d895" });
        const s1_sets = cartones.map(c => ({
            num: c.number,
            n: c.cardSets.find(cs => cs.setNumber === 1).numbers.sort((a,b) => a-b)
        }));

        // Simular uno hasta encontrar un perfecto
        const balls = Array.from({ length: 70 }, (_, i) => i + 1);
        for (let i = balls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [balls[i], balls[j]] = [balls[j], balls[i]];
        }
        const ballPos = new Array(71);
        balls.forEach((b, i) => ballPos[b] = i);

        const results = s1_sets.map(s => ({
            num: s.num,
            finish: Math.max(...s.n.map(n => ballPos[n])),
            n: s.n
        })).sort((a, b) => a.finish - b.finish);

        if (results[1].finish > results[0].finish && results[1].finish === results[4].finish && results[5].finish > results[4].finish) {
            console.log("FOUND PERFECT 1+4 CASE:");
            console.log(`Lider: #${results[0].num} (dist: ${results[0].finish})`);
            console.log(`Seguidores: [#${results[1].num}, #${results[2].num}, #${results[3].num}, #${results[4].num}] (dist: ${results[1].finish})`);
            
            // Check intersection of all 5
            const allSets = [results[0].n, results[1].n, results[2].n, results[3].n, results[4].n];
            const commonToAll = allSets[0].filter(n => allSets.every(s => s.includes(n)));
            console.log(`Common to all 5: ${commonToAll.length} numbers ([${commonToAll}])`);
            
            // Check intersection of 4 followers
            const followersSets = [results[1].n, results[2].n, results[3].n, results[4].n];
            const commonToFollowers = followersSets[0].filter(n => followersSets.every(s => s.includes(n)));
            console.log(`Common to all 4 followers: ${commonToFollowers.length} numbers ([${commonToFollowers}])`);

            // Find kicker balls
            const leaderLast = results[0].n.find(n => ballPos[n] === results[0].finish);
            const followersLast = results[1].n.find(n => ballPos[n] === results[1].finish);
            console.log(`Leader kicker ball: ${leaderLast}`);
            console.log(`Followers kicker ball: ${followersLast}`);

        } else {
            console.log("This specific draw didn't produce a perfect 1+4 for the VERY FIRST winners, although the stats say it's highly likely.");
        }

    } catch (error) {
        console.error(error);
    } finally {
        await mongoose.disconnect();
    }
}

analyzeWinningGroup();
