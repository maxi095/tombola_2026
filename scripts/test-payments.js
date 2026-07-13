import mongoose from 'mongoose';
import SellerPayment from '../src/models/sellerPayment.model.js';
import Balance from '../src/models/balance.model.js';

const mongoURI = 'mongodb://localhost/tomboladb';

async function main() {
  await mongoose.connect(mongoURI);
  console.log('Connected to DB');

  const editionId = '69cbe10e9744bc74a3c2b036'; // Edición 2026

  // 1. Obtener pagos de vendedores
  const payments = await SellerPayment.find({ edition: editionId });
  console.log(`📦 Encontrados ${payments.length} pagos de vendedores.`);

  console.log('\n--- ANULADOS / CANCELADOS / INACTIVOS PAYMENTS ---');
  const inactivePayments = payments.filter(p => p.status !== 'Activo');
  inactivePayments.forEach(p => {
    console.log(`ID: ${p._id}, Status: ${p.status}, Cash: ${p.cashAmount}, Transfer: ${p.transferAmount}, Check: ${p.checkAmount}, Tarjeta: ${p.tarjetaUnicaAmount}, Commission: ${p.commissionAmount}, Date: ${p.date}`);
  });

  // 2. Buscar si hay algún balance activo asociado a estos pagos inactivos (o que tenga la misma fecha y monto)
  console.log('\n--- VERIFICANDO BALANCES ASOCIADOS A PAGOS INACTIVOS ---');
  for (const ip of inactivePayments) {
    const totalPaymentAmount = (ip.cashAmount || 0) + (ip.transferAmount || 0) + (ip.checkAmount || 0) + (ip.tarjetaUnicaAmount || 0);
    console.log(`Buscando balances con monto ${totalPaymentAmount} y fecha cercana a ${ip.date}...`);
    
    // Buscar balances con ese monto
    const matchingBalances = await Balance.find({
      edition: editionId,
      totalAmount: totalPaymentAmount,
      status: 'Activo'
    });
    
    matchingBalances.forEach(b => {
      console.log(`🚨 POSIBLE INCONSISTENCIA: Balance ID: ${b._id}, Category: ${b.category}, Amount: ${b.totalAmount}, Status: ${b.status}, CreatedAt: ${b.createdAt}`);
    });
  }

  await mongoose.disconnect();
}

main();
