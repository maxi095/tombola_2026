import mongoose from "mongoose";
import "dotenv/config.js";
import BingoCard from "../src/models/bingoCard.model.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";
const EDITION_ID = "69d93711e325309d39c0d895"; // 2026

async function inspectCard() {
  try {
    await mongoose.connect(MONGODB_URI);
    const card = await BingoCard.findOne({ edition: EDITION_ID, number: 1 });
    if (!card) {
      console.log("Card #1 not found");
      return;
    }

    console.log(`Card #${card.number} analysis:`);
    card.cardSets.forEach((set, i) => {
      console.log(`Set ${set.setNumber}: [${set.numbers.sort((a,b) => a-b).join(",")}]`);
    });

    // Check intersections
    for (let i = 0; i < card.cardSets.length; i++) {
        for (let j = i + 1; j < card.cardSets.length; j++) {
            const setA = new Set(card.cardSets[i].numbers);
            const setB = new Set(card.cardSets[j].numbers);
            const intersection = [...setA].filter(x => setB.has(x));
            console.log(`Intersection Set ${card.cardSets[i].setNumber} & ${card.cardSets[j].setNumber}: ${intersection.length} numbers`);
        }
    }

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

inspectCard();
