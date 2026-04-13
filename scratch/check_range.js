import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";
const EDITION_ID = "69d93711e325309d39c0d895";

async function checkNumberRange() {
  try {
    await mongoose.connect(MONGODB_URI);
    const bingoCards = await BingoCard.find({ edition: EDITION_ID });
    
    let min = 100, max = 0;
    bingoCards.forEach(card => {
        card.cardSets.forEach(set => {
            set.numbers.forEach(n => {
                if (n < min) min = n;
                if (n > max) max = n;
            });
        });
    });

    console.log(`Number range in 2026: ${min} to ${max}`);

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkNumberRange();
