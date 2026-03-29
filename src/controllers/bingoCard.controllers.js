import BingoCard from '../models/bingoCard.model.js';
import Sale from "../models/sale.model.js";
import Quota from "../models/quota.model.js";

import mongoose from 'mongoose';
import dayjs from 'dayjs';

// Obtener todas las tarjetas de bingo
export const getBingoCards = async (req, res) => {
    try {
        const filter = {};

        // Si hay un status en la query, lo usamos como filtro
        if (req.query.status) {
            filter.status = req.query.status;
        }

        const bingoCards = await BingoCard.find(filter)
        .populate({
            path: 'seller',
            populate: { path: 'person' }
        })
        .populate(['edition', 'user']); 
        res.json(bingoCards);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Obtener una tarjeta de bingo por ID
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

// Obtener todas las tarjetas de bingo con información de venta (incluyendo fecha de venta)
export const getBingoCardsWithSales = async (req, res) => {
  try {
    // 1. Obtener todos los cartones con seller, edition y user
    const bingoCards = await BingoCard.find()
      .populate({
        path: 'seller',
        populate: { path: 'person' }
      })
      .populate('edition user')
      .lean();

    // 2. Obtener todas las ventas NO anuladas
    const sales = await Sale.find({
      bingoCard: { $in: bingoCards.map(c => c._id) },
      status: { $ne: 'Anulada' }
    })
      .populate({ path: 'seller', populate: { path: 'person' } })
      .populate({ path: 'client', populate: { path: 'person' } })
      .lean();

    // 3. Armar respuesta con venta si existe, o null
    const cardsWithSales = bingoCards.map(card => {
      const sale = sales.find(s => s.bingoCard.toString() === card._id.toString());

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
                    personId: sale.seller.person._id,
                    firstName: sale.seller.person.firstName,
                    lastName: sale.seller.person.lastName
                  }
                : null,
              client: sale.client?.person
                ? {
                    _id: sale.client._id,
                    personId: sale.client.person._id,
                    firstName: sale.client.person.firstName,
                    lastName: sale.client.person.lastName
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
  
      // ✅ Populamos la edición directamente en bingoCard
      const bingoCard = await BingoCard.findOne({
        edition: editionId,
        number: Number(number)
      }).populate('edition');
  
      if (!bingoCard) {
        return res.status(404).json({ message: 'El número de cartón ingresado no existe' });
      }
  
      const sale = await Sale.findOne({
        edition: editionId,
        bingoCard: bingoCard._id,
        status: { $ne: 'Anulada' } // ✅ Excluir ventas anuladas
      }).populate([
        { path: 'client', populate: { path: 'person' } },
        { path: 'seller', populate: { path: 'person' } },
      ]);
  
      const quotas = sale ? await Quota.find({ sale: sale._id }) : [];
  
      
      {/* 
      Comprobar si el plan es "CUOTA" o "PAGO CONTADO" (valida que todas las cuotas tengan misma fecha de pago)
      const arePaymentDatesEqual = quotas.every(quota => 
        quota.paymentDate === null ||
        dayjs(quota.paymentDate).isSame(dayjs(quotas[0].paymentDate), 'day')
      );
      const plan = quotas.some(quota => quota.paymentDate === null) ? 'Pago en cuotas' : (arePaymentDatesEqual ? 'Pago contado' : 'Pago en cuotas');

       */}

       // Si todas las cuotas están pagas => pago contado
      const allQuotasPaid = quotas.length > 0 && quotas.every(quota => quota.paymentDate !== null);

      const plan = allQuotasPaid ? 'Pago contado' : 'Pago en cuotas';
  
      // Verificar si las cuotas están al día (sin vencimiento)
      const now = dayjs();
      const hasDebt = quotas.some(q =>
        dayjs(q.dueDate).isBefore(now, 'day') && q.paymentDate === null
      );

  
      // Respuesta con la información de la venta y el estado del cartón
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
        upToDate: !!sale && !hasDebt, // Si no hay deuda, está al día
        plan: plan, // Agregar el plan (CUOTA o PAGO CONTADO)
        quotaUpToDate: plan === 'CUOTA' && !hasDebt, // Si es CUOTA, verificar si está al día
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

    console.log('Received bingoCardId:', bingoCardId);
    console.log('Received sellerId:', sellerId);
  
    try {
      const updatedCard = await BingoCard.findByIdAndUpdate(
        bingoCardId,
        { seller: sellerId },
        { new: true }
      ).populate(['edition', 'user', 'seller']);
  
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
      ).populate(['edition', 'user']);
  
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
        .populate(['edition', 'user', 'seller'])
        .sort({ createdAt: -1, number: -1 });
  
      res.status(200).json(bingoCards);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving bingo cards for seller', error: error.message });
    }
  };
  
