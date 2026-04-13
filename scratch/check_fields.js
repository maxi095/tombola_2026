import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";
const EDITION_ID = "69d93711e325309d39c0d895";

async function checkFields() {
  try {
    await mongoose.connect(MONGODB_URI);
    const card = await BingoCard.findOne({ edition: EDITION_ID });
    console.log("Card example:");
    console.log(`- number: ${card.number}`);
    console.log(`- numbers (deprecated): [${card.numbers.length}]`);
    console.log(`- cardSets: [${card.cardSets.length}]`);
    
    if (card.numbers.length > 0) {
        console.log(`Example numbers: ${card.numbers.slice(0, 5)}...`);
    } else {
        console.log("The 'numbers' field is EMPTY.");
    }
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

checkFields();
