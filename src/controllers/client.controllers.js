import Client from '../models/client.model.js';
import Person from '../models/person.model.js';

// Búsqueda puntual y limitada de asociados (para vendedores y administración) 🔍
export const searchClients = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
      return res.status(400).json({ message: "El término de búsqueda debe tener al menos 3 caracteres" });
    }

    const cleanTerm = q.trim();
    const persons = await Person.find({
      $or: [
        { document: { $regex: cleanTerm, $options: "i" } },
        { firstName: { $regex: cleanTerm, $options: "i" } },
        { lastName: { $regex: cleanTerm, $options: "i" } }
      ]
    })
    .select('_id')
    .limit(15)
    .lean();

    const personIds = persons.map(p => p._id);

    const clients = await Client.find({
      person: { $in: personIds },
      status: { $ne: 'Inactivo' }
    })
    .populate('person')
    .limit(8)
    .lean();

    // Mapeo amigable con propiedades planas y anidadas para retrocompatibilidad total
    const formatted = clients.map(c => ({
      _id: c._id,
      id: c._id,
      clientNumber: c.clientNumber,
      person: c.person,
      firstName: c.person?.firstName || '',
      lastName: c.person?.lastName || '',
      fullName: `${c.person?.lastName || ''}, ${c.person?.firstName || ''}`.trim(),
      document: c.person?.document || '',
      dni: c.person?.document || '',
      phone: c.person?.phone || '',
      address: c.person?.address || '',
      city: c.person?.city || ''
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los clientes con datos de persona
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find()
      .sort({ clientNumber: -1 })
      .populate('person')
      .lean();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un cliente por ID (incluye persona asociada)
export const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('person')
      .lean();
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo cliente con su persona asociada
export const createClient = async (req, res) => {
  try {
    const personData = req.body.person || req.body || {};
    const firstName = personData.firstName?.trim();
    const lastName = personData.lastName?.trim();
    const document = (personData.document || personData.dni || '')?.toString().trim();
    const address = personData.address?.trim();
    const city = personData.city?.trim();
    const phone = personData.phone?.trim();
    const email = personData.email?.trim();
    const notes = req.body.notes || '';

    // Validar campos obligatorios
    if (!firstName || !lastName || !document) {
      return res.status(400).json({ message: "Nombre, Apellido y Documento/DNI son obligatorios" });
    }

    let person = await Person.findOne({ document });
    if (person) {
      // Si la persona ya existe, verificar si ya tiene cliente
      const existingClient = await Client.findOne({ person: person._id }).populate('person').lean();
      if (existingClient) {
        return res.status(200).json({
          _id: existingClient._id,
          id: existingClient._id,
          clientNumber: existingClient.clientNumber,
          person: existingClient.person,
          firstName: existingClient.person?.firstName || firstName,
          lastName: existingClient.person?.lastName || lastName,
          fullName: `${existingClient.person?.lastName || lastName}, ${existingClient.person?.firstName || firstName}`.trim(),
          document: existingClient.person?.document || document,
          dni: existingClient.person?.document || document,
          phone: existingClient.person?.phone || phone,
          address: existingClient.person?.address || address,
          city: existingClient.person?.city || city
        });
      }
    } else {
      // Crear nueva persona
      person = new Person({
        firstName,
        lastName,
        document,
        address,
        city,
        phone,
        email
      });
      await person.save();
    }

    // Crear cliente asociado
    const newClient = new Client({
      person: person._id,
      notes
    });
    const savedClient = await newClient.save();

    // Popular datos para devolver con info completa
    const populatedClient = await Client.findById(savedClient._id).populate('person').lean();

    res.status(201).json({
      _id: populatedClient._id,
      id: populatedClient._id,
      clientNumber: populatedClient.clientNumber,
      person: populatedClient.person,
      firstName: populatedClient.person?.firstName || firstName,
      lastName: populatedClient.person?.lastName || lastName,
      fullName: `${populatedClient.person?.lastName || lastName}, ${populatedClient.person?.firstName || firstName}`.trim(),
      document: populatedClient.person?.document || document,
      dni: populatedClient.person?.document || document,
      phone: populatedClient.person?.phone || phone,
      address: populatedClient.person?.address || address,
      city: populatedClient.person?.city || city
    });
  } catch (error) {
    console.error("Error al crear cliente:", error);
    res.status(500).json({ message: "Error al crear cliente", error });
  }
};

// Actualizar un cliente (y su persona)
export const updateClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (req.body.person) {
      await Person.findByIdAndUpdate(client.person, req.body.person, { new: true });
    }

    if (req.body.notes !== undefined) {
      client.notes = req.body.notes;
    }

    if (req.body.status !== undefined) {
      client.status = req.body.status;
    }

    await client.save();

    const updatedClient = await Client.findById(req.params.id).populate('person');
    res.json(updatedClient);
  } catch (error) {
    console.error("Error en updateClient:", error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un cliente y su persona asociada (baja lógica segura para proteger datos históricos)
export const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Cliente no encontrado' });

    client.status = 'Inactivo';
    await client.save();

    res.status(200).json({ message: 'Cliente dado de baja correctamente', client });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
