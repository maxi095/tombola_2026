import { MongoClient } from "mongodb";

const uri = "mongodb://localhost:27017";
const dbName = "tomboladb";

const client = new MongoClient(uri);

// Función para normalizar la ciudad
function normalizarCiudad(ciudad) {
  if (!ciudad) return "sin ciudad";
  return ciudad
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function main() {
  try {
    await client.connect();
    const db = client.db(dbName);
    const sales = db.collection("sales");

    const datos = await sales.aggregate([
      {
        $lookup: {
          from: "clients",
          localField: "client",
          foreignField: "_id",
          as: "client"
        }
      },
      { $unwind: "$client" },
      {
        $lookup: {
          from: "people",
          localField: "client.person",
          foreignField: "_id",
          as: "person"
        }
      },
      { $unwind: "$person" },
      {
        $lookup: {
          from: "editions",
          localField: "edition",
          foreignField: "_id",
          as: "edition"
        }
      },
      { $unwind: "$edition" },
      {
        $match: {
          "edition.name": "2024",
          status: { $ne: "Anulada" }
        }
      },
      {
        $project: {
          ciudad: "$person.city"
        }
      }
    ]).toArray();

    // Normalizamos y agrupamos manualmente en JS
    const resumen = {};
    let totalGlobal = 0;

    for (const item of datos) {
      const ciudadNormalizada = normalizarCiudad(item.ciudad);
      resumen[ciudadNormalizada] = (resumen[ciudadNormalizada] || 0) + 1;
      totalGlobal++;
    }

    const resultados = Object.entries(resumen).map(([ciudad, totalVentas]) => ({
      ciudad,
      totalVentas,
      porcentaje: Number(((totalVentas / totalGlobal) * 100).toFixed(2))
    }));

    // Ordenar de mayor a menor
    resultados.sort((a, b) => b.totalVentas - a.totalVentas);

    console.log("📊 Ventas por ciudad para edición 2025:");
    console.table(resultados);

    // Exportar a CSV si querés copiarlo a Excel:
    const csv = ["Ciudad,Total Ventas,Porcentaje"]
      .concat(resultados.map(r => `${r.ciudad},${r.totalVentas},${r.porcentaje}%`))
      .join("\n");

    console.log("\n📋 Copiá esto y pegalo en Excel:");
    console.log(csv);

  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await client.close();
  }
}

main();
