import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";
const EDITION_ID = "69d93711e325309d39c0d895";

async function checkInternalOverlaps() {
  try {
    await mongoose.connect(MONGODB_URI);
    const bingoCards = await BingoCard.find({ edition: EDITION_ID });
    
    let cardsWithInternalDuplicates = 0;
    bingoCards.forEach(card => {
        const signatures = card.cardSets.map(s => [...s.numbers].sort((a,b) => a-b).join(","));
        const uniqueSignatures = new Set(signatures);
        if (uniqueSignatures.size < signatures.length) {
            cardsWithInternalDuplicates++;
            if (cardsWithInternalDuplicates < 5) {
                console.log(`Card #${card.number} has internal duplicates: ${signatures.length - uniqueSignatures.size} sets repeat numbers.`);
            }
        }
    });

    console.log(`Total cards with internal duplicates: ${cardsWithInternalDuplicates} out of ${bingoCards.length}`);

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkInternalOverlaps();
