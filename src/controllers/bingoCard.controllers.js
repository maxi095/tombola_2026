import BingoCard from '../models/bingoCard.model.js';
import Sale from "../models/sale.model.js";
import Quota from "../models/quota.model.js";

import mongoose from 'mongoose';
import dayjs from 'dayjs';

// Obtener todas las tarjetas de bingo (excluyendo cardSets pesados para listados)
export const getBingoCards = async (req, res) => {
    try {
        const filter = {};

        if (req.query.status) {
            filter.status = req.query.status;
        }
        if (req.query.edition) {
            filter.edition = req.query.edition;
        }

        const bingoCards = await BingoCard.find(filter)
            .select('-cardSets -numbers')
            .populate({
                path: 'seller',
                populate: { path: 'person' }
            })
            .populate(['edition', 'user'])
            .lean();
        res.json(bingoCards);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Obtener una tarjeta de bingo por ID (incluye cardSets completo)
export const getBingoCard = async (req, res) => {
    try {
        const bingoCard = await BingoCard.findById(req.params.id).populate(['edition', 'user']);
        if (!bingoCard) return res.status(404).json({ message: 'Bingo card not found' });
        res.json(bingoCard);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Crear una nueva tarjeta de bingo
export const createBingoCard = async (req, res) => {
    try {
        const { edition, number, status } = req.body;

        const newBingoCard = new BingoCard({
            edition,
            number,
            status,
            user: req.user.id
        });

        const savedBingoCard = await newBingoCard.save();
        res.json(savedBingoCard);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Editar una tarjeta de bingo
export const updateBingoCard = async (req, res) => {
    try {
        const bingoCard = await BingoCard.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate(['edition', 'user']);
        if (!bingoCard) return res.status(404).json({ message: 'Bingo card not found' });
        res.json(bingoCard);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Eliminar una tarjeta de bingo
export const deleteBingoCard = async (req, res) => {
    try {
        const bingoCard = await BingoCard.findByIdAndDelete(req.params.id);
        if (!bingoCard) return res.status(404).json({ message: 'Bingo card not found' });

        res.status(204).json({ message: 'Bingo card deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Obtener todas las tarjetas de bingo con información de venta (optimizado O(N) con Map y sin cardSets pesados)
export const getBingoCardsWithSales = async (req, res) => {
  try {
    const filter = {};
    if (req.query.edition) {
      filter.edition = req.query.edition;
    }

    // 1. Obtener cartones excluyendo arrays pesados de 100 números (cardSets / numbers)
    const bingoCards = await BingoCard.find(filter)
      .select('-cardSets -numbers')
      .populate({
        path: 'seller',
        populate: { path: 'person' }
      })
      .populate('edition user')
      .lean();

    // 2. Obtener todas las ventas NO anuladas asociadas
    const salesFilter = {
      status: { $ne: 'Anulada' }
    };
    if (req.query.edition) {
      salesFilter.edition = req.query.edition;
    } else {
      salesFilter.bingoCard = { $in: bingoCards.map(c => c._id) };
    }

    const sales = await Sale.find(salesFilter)
      .populate({ path: 'seller', populate: { path: 'person' } })
      .populate({ path: 'client', populate: { path: 'person' } })
      .lean();

    // Indexar ventas por bingoCardId en O(1) en lugar de sales.find() O(N*M)
    const salesByCardId = new Map();
    for (const s of sales) {
      if (s.bingoCard) {
        salesByCardId.set(s.bingoCard.toString(), s);
      }
    }

    // 3. Armar respuesta con venta si existe, o null
    const cardsWithSales = bingoCards.map(card => {
      const sale = salesByCardId.get(card._id.toString());

      return {
        ...card,
        sale: sale
          ? {
              _id: sale._id,
              status: sale.status,
              saleDate: sale.saleDate,
              createdAt: sale.createdAt,
              seller: sale.seller?.person
                ? {
                    _id: sale.seller._id,
                    fullName: `${sale.seller.person.firstName} ${sale.seller.person.lastName}`.trim(),
                    firstName: sale.seller.person.firstName,
                    lastName: sale.seller.person.lastName
                  }
                : null,
              client: sale.client?.person
                ? {
                    _id: sale.client._id,
                    fullName: `${sale.client.person.firstName} ${sale.client.person.lastName}`.trim(),
                    firstName: sale.client.person.firstName,
                    lastName: sale.client.person.lastName,
                    city: sale.client.person.city || "S/D"
                  }
                : null
            }
          : null
      };
    });

    // 4. Ordenar por edición y número, ambos descendente
    const sorted = cardsWithSales.sort((a, b) => {
      const ea = parseInt(a.edition?.name || 0, 10);
      const eb = parseInt(b.edition?.name || 0, 10);
      if (eb !== ea) return eb - ea;
      return (b.number || 0) - (a.number || 0);
    });

    return res.json(sorted);
  } catch (error) {
    console.error("Error al obtener cartones con ventas:", error);
    return res.status(500).json({ message: "Error al obtener cartones con ventas" });
  }
};

export const getBingoCardStatus = async (req, res) => {
    try {
      const { edition, number } = req.query;
  
      if (!edition || !number) {
        return res.status(400).json({ message: 'Faltan parámetros: edition y/o number' });
      }
  
      const editionId = new mongoose.Types.ObjectId(edition);
  
      const bingoCard = await BingoCard.findOne({
        edition: editionId,
        number: Number(number)
      })
        .select('-cardSets -numbers')
        .populate('edition')
        .lean();
  
      if (!bingoCard) {
        return res.status(404).json({ message: 'El número de cartón ingresado no existe' });
      }
  
      const sale = await Sale.findOne({
        edition: editionId,
        bingoCard: bingoCard._id,
        status: { $ne: 'Anulada' }
      }).populate([
        { path: 'client', populate: { path: 'person' } },
        { path: 'seller', populate: { path: 'person' } },
      ]).lean();
  
      const quotas = sale ? await Quota.find({ sale: sale._id }).lean() : [];
  
      // Si todas las cuotas están pagas => pago contado
      const allQuotasPaid = quotas.length > 0 && quotas.every(quota => quota.paymentDate !== null);

      const plan = allQuotasPaid ? 'Pago contado' : 'Pago en cuotas';
  
      // Verificar si las cuotas están al día (sin vencimiento)
      const now = dayjs();
      const hasDebt = quotas.some(q =>
        dayjs(q.dueDate).isBefore(now, 'day') && q.paymentDate === null
      );
  
      const response = {
        edition: bingoCard.edition._id.toString(),
        editionName: bingoCard.edition.name,
        bingoCardNumber: bingoCard.number,
        sold: !!sale,
        client: sale?.client?.person
          ? `${sale.client.person.firstName} ${sale.client.person.lastName}`
          : 'Cliente no asignado',
        clientNumber: sale?.client?.clientNumber,
        seller: sale?.seller?.person
          ? `${sale.seller.person.firstName} ${sale.seller.person.lastName}`
          : 'Vendedor no asignado',
        sellerNumber: sale?.seller?.sellerNumber,
        upToDate: !!sale && !hasDebt,
        plan: plan,
        quotaUpToDate: plan === 'Pago en cuotas' && !hasDebt,
      };
  
      res.json(response);
    } catch (error) {
      console.error("Error en getBingoCardStatus:", error);
      res.status(500).json({ message: error.message });
    }
  };
  
// Asignar un vendedor a un cartón de bingo
export const assignSellerToBingoCard = async (req, res) => {
    const { bingoCardId } = req.params;
    const { sellerId } = req.body;
  
    try {
      const updatedCard = await BingoCard.findByIdAndUpdate(
        bingoCardId,
        { seller: sellerId },
        { new: true }
      )
        .select('-cardSets -numbers')
        .populate(['edition', 'user', 'seller']);
  
      if (!updatedCard) {
        return res.status(404).json({ message: 'Bingo card not found' });
      }
  
      res.status(200).json(updatedCard);
    } catch (error) {
      res.status(500).json({ message: 'Error assigning seller', error: error.message });
    }
  };
  
// Eliminar la relación de un vendedor con un cartón
export const removeSellerFromBingoCard = async (req, res) => {
    const { bingoCardId } = req.params;
  
    try {
      const updatedCard = await BingoCard.findByIdAndUpdate(
        bingoCardId,
        { $unset: { seller: "" } },
        { new: true }
      )
        .select('-cardSets -numbers')
        .populate(['edition', 'user']);
  
      if (!updatedCard) {
        return res.status(404).json({ message: 'Bingo card not found' });
      }
  
      res.status(200).json(updatedCard);
    } catch (error) {
      res.status(500).json({ message: 'Error removing seller', error: error.message });
    }
  };

export const getBingoCardsBySeller = async (req, res) => {
    const { sellerId } = req.params;
  
    try {
      const bingoCards = await BingoCard.find({ seller: sellerId })
        .select('-cardSets -numbers')
        .populate(['edition', 'user', 'seller'])
        .sort({ createdAt: -1, number: -1 })
        .lean();
  
      res.status(200).json(bingoCards);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving bingo cards for seller', error: error.message });
    }
  };
