import mongoose from "mongoose";
import dotenv from "dotenv";
import BingoCard from "../src/models/bingoCard.model.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/tomboladb";

async function analyzeStructuralPatterns() {
  await mongoose.connect(MONGODB_URI);
  
  const editionId = "69d93711e325309d39c0d895";
  const cartones = await BingoCard.find({ edition: editionId }).limit(1001);
  
  const sets = cartones.map(c => {
    const s1 = c.cardSets.find(cs => cs.setNumber === 1);
    return { id: c._id, numbers: s1.numbers.sort((a,b) => a-b) };
  });

  const balls = Array.from({ length: 70 }, (_, i) => i + 1);
  for (let i = balls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [balls[i], balls[j]] = [balls[j], balls[i]];
  }
  const ballPos = new Array(71);
  balls.forEach((b, i) => ballPos[b] = i);

  const finishTimes = sets.map(s => ({ 
    id: s.id, 
    numbers: s.numbers,
    time: Math.max(...s.numbers.map(n => ballPos[n]))
  })).sort((a, b) => a.time - b.time);

  const winner = finishTimes[0];
  const followers = finishTimes.slice(1, 5);

  console.log("\n--- GANADOR ---");
  console.log(`ID: ${winner.id}, Tiempo: ${winner.time}, Números: ${winner.numbers.join(',')}`);

  console.log("\n--- SEGUIDORES (Siguientes 4) ---");
  followers.forEach((f, i) => {
    console.log(`[${i+1}] ID: ${f.id}, Tiempo: ${f.time}, Números: ${f.numbers.join(',')}`);
  });

  const commonInGroup = winner.numbers.filter(n => 
    followers.every(f => f.numbers.includes(n))
  );
  console.log(`\nNúmeros comunes en el grupo de 5: [${commonInGroup.length}] -> ${commonInGroup.join(',')}`);

  followers.forEach((f, i) => {
    const diffWinner = winner.numbers.filter(n => !f.numbers.includes(n));
    const diffFollower = f.numbers.filter(n => !winner.numbers.includes(n));
    console.log(`\nSeguidor ${i+1} vs Ganador:`);
    console.log(`  Solo Ganador: ${diffWinner.join(',')}`);
    console.log(`  Solo Seguidor: ${diffFollower.join(',')}`);
  });

  await mongoose.disconnect();
}

analyzeStructuralPatterns();
