import mongoose from "mongoose";
import dotenv from "dotenv";
import BingoCard from "../src/models/bingoCard.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function checkDuplicatesIn2026() {
  await mongoose.connect(MONGODB_URI);
  
  const editionId = "69d93711e325309d39c0d895";
  const cartones = await BingoCard.find({ edition: editionId });
  
  console.log(`Checking for duplicates in Edition 2026 (${cartones.length} cards)...`);

  for (let s = 1; s <= 5; s++) {
    const setStrings = cartones.map(c => {
      const set = c.cardSets.find(cs => cs.setNumber === s);
      return set ? set.numbers.sort((a,b) => a-b).join(',') : null;
    }).filter(n => n !== null);

    const total = setStrings.length;
    const unique = new Set(setStrings).size;
    
    console.log(`Sorteo #${s}: Total ${total} | Unique ${unique} | Duplicates ${total - unique}`);
    
    if (total !== unique) {
      // Analizar frecuencia de duplicidad
      const counts = {};
      setStrings.forEach(s => counts[s] = (counts[s] || 0) + 1);
      const freq = {};
      Object.values(counts).forEach(v => freq[v] = (freq[v] || 0) + 1);
      console.log(`  Frequency of card sets:`, freq);
    }
  }

  await mongoose.disconnect();
}

checkDuplicatesIn2026();
