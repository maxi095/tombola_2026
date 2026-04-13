import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";
const EDITION_ID = "69d93711e325309d39c0d895";

async function analyzePerSorteo() {
  try {
    await mongoose.connect(MONGODB_URI);
    const bingoCards = await BingoCard.find({ edition: EDITION_ID });
    
    for (let s = 1; s <= 5; s++) {
        console.log(`\n--- ANALYZING SORTEO #${s} ---`);
        const setGroups = new Map();
        
        bingoCards.forEach(card => {
            const set = card.cardSets.find(cs => cs.setNumber === s);
            if (!set) return;
            const signature = [...set.numbers].sort((a,b) => a-b).join(",");
            if (!setGroups.has(signature)) setGroups.set(signature, []);
            setGroups.get(signature).push(card.number);
        });

        const frequencyMap = new Map();
        for (const [sig, cards] of setGroups.entries()) {
            const count = cards.length;
            if (!frequencyMap.has(count)) frequencyMap.set(count, 0);
            frequencyMap.set(count, frequencyMap.get(count) + 1);
            
            if (count > 1 && frequencyMap.get(count) < 2) {
                // console.log(`Example shared combo in Sorteo ${s} (shared by ${count}): ${sig.slice(0, 20)}... -> Cards: ${cards.join(",")}`);
            }
        }

        console.log(`Sorteo #${s} Distribution (how many cards share the same combo):`);
        for (const [count, freq] of Array.from(frequencyMap.entries()).sort((a,b) => a[0] - b[0])) {
            console.log(`- ${count} card(s) share a combo: ${freq} occurrences`);
        }
        console.log(`Total distinct combinations in Sorteo #${s}: ${setGroups.size}`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

analyzePerSorteo();
