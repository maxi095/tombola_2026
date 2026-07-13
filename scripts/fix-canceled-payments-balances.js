import mongoose from 'mongoose';
import SellerPayment from '../src/models/sellerPayment.model.js';
import Balance from '../src/models/balance.model.js';

const mongoURI = 'mongodb://localhost/tomboladb';

async function main() {
  console.log('⚡ Conectando a MongoDB...');
  await mongoose.connect(mongoURI);
  console.log('✅ Conectado.');

  // 1. Encontrar todos los pagos anulados
  const canceledPayments = await SellerPayment.find({ status: 'Anulado' });
  console.log(`🔍 Se encontraron ${canceledPayments.length} pagos de vendedores en estado "Anulado".`);

  let updatedBalancesCount = 0;

  for (const payment of canceledPayments) {
    console.log(`➡️ Procesando pago anulado ID: ${payment._id} (Monto total: ${(payment.cashAmount || 0) + (payment.transferAmount || 0) + (payment.checkAmount || 0) + (payment.tarjetaUnicaAmount || 0)})...`);
    
    // Buscar balances activos asociados a este pago anulado
    const associatedBalances = await Balance.find({
      sellerPaymentRef: payment._id,
      status: 'Activo'
    });

    if (associatedBalances.length > 0) {
      console.log(`   🚨 Encontrados ${associatedBalances.length} balances activos huérfanos.`);
      
      const result = await Balance.updateMany(
        { sellerPaymentRef: payment._id, status: 'Activo' },
        { 
          status: 'Anulado',
          observations: 'Anulado automáticamente por script de consistencia de datos'
        }
      );
      
      updatedBalancesCount += result.modifiedCount;
      console.log(`   ✅ Se anularon ${result.modifiedCount} balances.`);
    } else {
      console.log(`   👍 No hay balances activos asociados a este pago.`);
    }
  }

  console.log(`\n🎉 Sincronización completada. Se actualizaron ${updatedBalancesCount} documentos de Balance en total.`);
  await mongoose.disconnect();
}

main();
