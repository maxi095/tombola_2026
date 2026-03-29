import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb://localhost:27017";
const dbName = "tomboladb";

async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const sales = db.collection("sales");

    const ventasPorVendedor = await sales.aggregate([
      // Join con editions
      {
        $lookup: {
          from: "editions",
          localField: "edition",
          foreignField: "_id",
          as: "edition"
        }
      },
      { $unwind: "$edition" },

      // ✅ Filtrar edición 2024 y que no estén anuladas
      {
        $match: {
          "edition.name": "2025",
          status: { $ne: "Anulada" }
        }
      },

      // Join con sellers
      {
        $lookup: {
          from: "sellers",
          localField: "seller",
          foreignField: "_id",
          as: "seller"
        }
      },
      { $unwind: "$seller" },

      // Join con people
      {
        $lookup: {
          from: "people",
          localField: "seller.person",
          foreignField: "_id",
          as: "person"
        }
      },
      { $unwind: "$person" },

      // Agrupar por persona
      {
        $group: {
          _id: "$person._id",
          firstName: { $first: "$person.firstName" },
          lastName: { $first: "$person.lastName" },
          totalVentas: { $sum: 1 }
        }
      },

      // Ordenar por ventas descendente
      { $sort: { totalVentas: -1 } }
    ]).toArray();

    console.log(`Ventas por vendedor (sin anuladas) para edición 2025:\n`);
    ventasPorVendedor.forEach(v => {
      console.log(`${v.firstName} ${v.lastName}, ${v.totalVentas}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

main();
