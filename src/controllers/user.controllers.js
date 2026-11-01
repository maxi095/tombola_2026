import User from '../models/user.model.js';
import Person from '../models/person.model.js';
import Seller from '../models/seller.model.js';
import bcrypt from 'bcrypt';

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('email username roles person seller status createdAt')
            .populate('person')
            .populate({ path: 'seller', populate: { path: 'person' } })
            .lean();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Obtener un usuario específico
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('email username roles person seller status createdAt')
            .populate('person')
            .populate({ path: 'seller', populate: { path: 'person' } })
            .lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Crear nuevo usuario (con validación de vinculación a Seller - RN-ROL-09)
export const createUser = async (req, res) => {
    try {
        const {
            username, email, password, roles = 'Vendedor', status = 'Activo',
            seller, firstName, lastName, address, phone, document
        } = req.body;

        let sellerId = null;
        let personId = null;

        // Si el rol es Vendedor, validar que se haya seleccionado un vendedor válido
        if (roles === 'Vendedor') {
            if (!seller) {
                return res.status(400).json({ message: "Un usuario con rol Vendedor debe estar vinculado a un vendedor del club." });
            }
            const sellerDoc = await Seller.findById(seller).populate('person');
            if (!sellerDoc) {
                return res.status(404).json({ message: "El vendedor seleccionado no existe." });
            }
            sellerId = sellerDoc._id;
            if (sellerDoc.person) {
                personId = sellerDoc.person._id;
            }
        }

        // Si no se reutilizó la persona del vendedor, se crea una nueva
        if (!personId) {
            const newPerson = new Person({
                firstName,
                lastName,
                document,
                address,
                phone,
                email,
            });
            const savedPerson = await newPerson.save();
            personId = savedPerson._id;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            roles,
            seller: sellerId,
            status,
            person: personId
        });

        const savedUser = await newUser.save();
        const populatedUser = await User.findById(savedUser._id)
            .populate('person')
            .populate({ path: 'seller', populate: { path: 'person' } })
            .lean();

        res.status(201).json(populatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
    try {
        const { roles, status, seller, person: personUpdates, password } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (roles) {
            if (roles === 'Vendedor' && !seller && !user.seller) {
                return res.status(400).json({ message: "Un usuario con rol Vendedor debe estar vinculado a un vendedor del club." });
            }
            user.roles = roles;
            if (roles !== 'Vendedor') {
                user.seller = null;
            }
        }

        if (seller && user.roles === 'Vendedor') {
            const sellerDoc = await Seller.findById(seller);
            if (!sellerDoc) return res.status(404).json({ message: "El vendedor seleccionado no existe." });
            user.seller = sellerDoc._id;
        }

        if (status) user.status = status;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        if (personUpdates && user.person) {
            await Person.findByIdAndUpdate(user.person, personUpdates);
        }

        const updated = await User.findById(user._id)
            .populate('person')
            .populate({ path: 'seller', populate: { path: 'person' } })
            .lean();
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        return res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
