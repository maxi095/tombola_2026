import { MongoClient, ObjectId } from "mongodb";

const uri = "mongodb://localhost:27017";
const dbName = "tomboladb";

async function main() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const sales = db.collection("sales");
    const clientsColl = db.collection("clients");
    const sellersColl = db.collection("sellers");
    const peopleColl = db.collection("people");
    const editionsColl = db.collection("editions");

    // Obtener _id de ediciones 2024 y 2025 (por si cambian nombres o hay espacios)
    const edition2024 = await editionsColl.findOne({ name: "2024" });
    const edition2025 = await editionsColl.findOne({ name: "2025" });

    if (!edition2024) throw new Error("No se encontró la edición '2024' en la colección editions.");
    if (!edition2025) console.warn("No se encontró la edición '2025' (pero continuamos).");

    const edition2024Id = edition2024._id;
    const edition2025Id = edition2025 ? edition2025._id : null;

    // 1) Personas que compraron en edición 2024 (agrupadas por person)
    const compradores2024 = await sales.aggregate([
      { $match: { edition: edition2024Id } },

      // lookup client -> person
      {
        $lookup: {
          from: "clients",
          localField: "client",
          foreignField: "_id",
          as: "client"
        }
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: false } },

      {
        $lookup: {
          from: "people",
          localField: "client.person",
          foreignField: "_id",
          as: "person"
        }
      },
      { $unwind: { path: "$person", preserveNullAndEmptyArrays: false } },

      {
        $group: {
          _id: "$person._id",
          firstName: { $first: "$person.firstName" },
          lastName: { $first: "$person.lastName" },
          clientId: { $first: "$client._id" } // asumimos 1:1 person->client; si hubiese más, toma el primero
        }
      }
    ]).toArray();

    const personas2024Ids = compradores2024.map(p => p._id);

    // 2) Personas que compraron en 2025 (si existe la edición)
    let personas2025Ids = new Set();
    if (edition2025Id) {
      const compradores2025 = await sales.aggregate([
        { $match: { edition: edition2025Id } },
        {
          $lookup: {
            from: "clients",
            localField: "client",
            foreignField: "_id",
            as: "client"
          }
        },
        { $unwind: { path: "$client", preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: "people",
            localField: "client.person",
            foreignField: "_id",
            as: "person"
          }
        },
        { $unwind: { path: "$person", preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: "$person._id"
          }
        }
      ]).toArray();

      compradores2025.forEach(p => personas2025Ids.add(p._id.toString()));
    }

    // 3) Personas que compraron 2024 pero NO 2025
    const personasSolo2024 = compradores2024.filter(
      p => !personas2025Ids.has(p._id.toString())
    );

    // 4) Para cada personaSolo2024 intentar averiguar seller asignado
    const results = [];

    // Posibles nombres de campo en clients que podrían apuntar al seller
    const possibleClientSellerFields = ["seller", "sellerId", "assignedSeller", "vendor"];

    for (const p of personasSolo2024) {
      const personId = p._id;
      const personName = `${p.lastName} ${p.firstName}`;
      let clientDoc = await clientsColl.findOne({ person: personId });
      let clientId = clientDoc ? clientDoc._id : null;

      let foundSellerId = null;

      // 4.a) Si client existe, revisar si tiene algún campo que apunte al seller
      if (clientDoc) {
        for (const f of possibleClientSellerFields) {
          if (clientDoc[f]) {
            // normalizamos a ObjectId si viene como string
            try {
              foundSellerId = (clientDoc[f] instanceof ObjectId) ? clientDoc[f] : new ObjectId(clientDoc[f]);
              break;
            } catch (e) {
              // si no es un ObjectId válido, lo ignoramos
              foundSellerId = null;
            }
          }
        }
      }

      // 4.b) Si no encontramos seller en client, buscar en la venta (sales) de esa client en 2024
      if (!foundSellerId && clientId) {
        // buscamos una venta del client en edition 2024 que tenga campo seller
        const saleWithSeller = await sales.findOne({
          client: clientId,
          edition: edition2024Id,
          seller: { $exists: true, $ne: null }
        }, { projection: { seller: 1 } });

        if (saleWithSeller && saleWithSeller.seller) {
          try {
            foundSellerId = (saleWithSeller.seller instanceof ObjectId) ? saleWithSeller.seller : new ObjectId(saleWithSeller.seller);
          } catch (e) {
            foundSellerId = null;
          }
        }
      }

      // 4.c) Si aún no encontramos, intentar buscar "última venta" de la persona (por si clientId no existe)
      if (!foundSellerId) {
        const saleGeneral = await sales.findOne({
          "client.person": personId // solo aplicable si el documento sale almacena person dentro client embed, raro
        }, { projection: { seller: 1 } });
        if (saleGeneral && saleGeneral.seller) {
          try {
            foundSellerId = (saleGeneral.seller instanceof ObjectId) ? saleGeneral.seller : new ObjectId(saleGeneral.seller);
          } catch (e) {
            foundSellerId = null;
          }
        }
      }

      // 5) Si hallamos un sellerId, traemos seller y la person del seller para nombre
      let sellerInfo = null;
      if (foundSellerId) {
        const sellerDoc = await sellersColl.findOne({ _id: foundSellerId });
        if (sellerDoc) {
          // buscar persona asociada al seller
          const sellerPerson = sellerDoc.person ? await peopleColl.findOne({ _id: sellerDoc.person }) : null;
          sellerInfo = {
            id: sellerDoc._id.toString(),
            sellerNumber: sellerDoc.sellerNumber ?? null,
            name: sellerPerson ? `${sellerPerson.lastName} ${sellerPerson.firstName}` : null
          };
        } else {
          sellerInfo = { id: foundSellerId.toString(), sellerNumber: null, name: null };
        }
      }

      results.push({
        personId: personId.toString(),
        personName,
        clientId: clientId ? clientId.toString() : null,
        seller: sellerInfo // null si no se encontró
      });
    }

    // Impreso y JSON final
    console.log(`Cantidad que compraron en 2024: ${compradores2024.length}`);
    console.log(`Cantidad que compraron en 2024 pero NO en 2025: ${personasSolo2024.length}`);
    // console.log("\nListado (JSON):");
    // console.log(JSON.stringify(results, null, 2));

    // también una salida más amigable
    console.log("\nListado:");
    results.forEach(r => {
      const sellerTxt = r.seller
        ? `${r.seller.name || 'Sin nombre'}`
        : "Sin vendedor asignado";
      console.log(`${r.personName},  ${sellerTxt}`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

main();
