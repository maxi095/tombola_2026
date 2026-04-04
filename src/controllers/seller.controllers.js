import Seller from '../models/seller.model.js';
import Person from '../models/person.model.js';

// Obtener todos los vendedores con datos de persona
export const getSellers = async (req, res) => {
    try {
        const sellers = await Seller.find()
        .sort({ sellerNumber: -1 }) // 1 = ascendente, -1 = descendente
        .populate('person');
        res.json(sellers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un vendedor por ID (incluye persona asociada)
export const getSeller = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id).populate('person');
        if (!seller) return res.status(404).json({ message: 'Seller not found' });
        res.json(seller);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo vendedor con su persona
export const createSeller = async (req, res) => {
    try {
      const {
        person: {
          firstName,
          lastName,
          document,
          address,
          city,
          phone,
          email,
        },
        status,
        commissionRate
        
      } = req.body;
  
      // Validar datos obligatorios
      if (!firstName || !lastName || !document) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
      }
  
      // Crear nueva persona
      const newPerson = new Person({
        firstName,
        lastName,
        document,
        address,
        city,
        phone,
        email
      });
  
      const savedPerson = await newPerson.save();
  
      // Crear vendedor asociado
      const newSeller = new Seller({
        person: savedPerson._id,
        status: status || 'Activo',
        commissionRate: commissionRate
      });
  
      const savedSeller = await newSeller.save();
  
      // Popular datos para devolver con info completa
      const populatedSeller = await Seller.findById(savedSeller._id).populate('person');
  
      return res.status(201).json(populatedSeller);
    } catch (error) {
      console.error("Error al crear vendedor:", error);
      return res.status(500).json({ message: "Error al crear vendedor", error });
    }
  };
  


// Actualizar un vendedor (y su persona)
export const updateSeller = async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        if (!seller) return res.status(404).json({ message: 'Seller not found' });

        // Cambiado de 'personData' a 'person'
        if (req.body.person) {
            await Person.findByIdAndUpdate(seller.person, req.body.person, { new: true });
        }

        // Ejemplo si también actualizás status u otras props directas del seller
        if (req.body.status !== undefined) {
            seller.status = req.body.status;
        }

        if (req.body.notes !== undefined) {
            seller.notes = req.body.notes;
        }

        // Actualizar commissionRate si viene en el cuerpo
    if (req.body.commissionRate !== undefined) {
      const rate = parseFloat(req.body.commissionRate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        return res.status(400).json({ message: "El porcentaje de comisión debe ser un número entre 0 y 100" });
      }
      seller.commissionRate = rate;
    }

        await seller.save();

        const updatedSeller = await Seller.findById(req.params.id).populate("person");
        res.json(updatedSeller);
    } catch (error) {
        console.error("Error en updateSeller:", error);
        res.status(500).json({ message: error.message });
    }
};

// Eliminar un vendedor y su persona asociada
export const deleteSeller = async (req, res) => {
    
  /*Se comenta codigo deleteClient ya que quitamos la acción del front
  
    try {
        const seller = await Seller.findByIdAndDelete(req.params.id);
        if (!seller) return res.status(404).json({ message: 'Seller not found' });

        await Person.findByIdAndDelete(seller.person);

        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
        
  */
};
