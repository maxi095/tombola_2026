import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";
import Edition from "../src/models/edition.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function analyze2025() {
  try {
    await mongoose.connect(MONGODB_URI);
    const edition = await Edition.findOne({ name: "2025" });
    if (!edition) {
        console.log("Edition 2025 not found");
        return;
    }

    const bingoCards = await BingoCard.find({ edition: edition._id });
    console.log(`Analyzing ${bingoCards.length} cards for 2025`);
    
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
    }

    console.log("Distribution of combination frequencies (2025):");
    for (const [count, freq] of Array.from(frequencyMap.entries()).sort((a,b) => a[0] - b[0])) {
      console.log(`- ${count} card(s) share a combo: ${freq} occurrences`);
    }

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

analyze2025();
