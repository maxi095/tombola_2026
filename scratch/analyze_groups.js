import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";
const EDITION_ID = "69d93711e325309d39c0d895";

async function analyzeGroups() {
  try {
    await mongoose.connect(MONGODB_URI);
    const bingoCards = await BingoCard.find({ edition: EDITION_ID });
    
    const setGroups = new Map();
    bingoCards.forEach(card => {
      card.cardSets.forEach(set => {
        const signature = [...set.numbers].sort((a,b) => a-b).join(",");
        if (!setGroups.has(signature)) setGroups.set(signature, []);
        setGroups.get(signature).push({ card: card.number, set: set.setNumber });
      });
    });

    const frequencyMap = new Map();
    for (const [sig, occurrences] of setGroups.entries()) {
      const count = occurrences.length;
      if (!frequencyMap.has(count)) frequencyMap.set(count, 0);
      frequencyMap.set(count, frequencyMap.get(count) + 1);
      
      if (count === 4) {
          // console.log(`Group of 4: ${sig} -> ${JSON.stringify(occurrences)}`);
      }
    }

    console.log("Distribution of combination frequencies (how many cards share the same set):");
    for (const [count, freq] of Array.from(frequencyMap.entries()).sort((a,b) => a[0] - b[0])) {
      console.log(`- ${count} card(s) share a combo: ${freq} occurrences`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

analyzeGroups();
