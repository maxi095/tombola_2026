import User from '../models/user.model.js';
import Person from '../models/person.model.js';
import bcrypt from 'bcrypt';

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('email username roles person status createdAt')
            .populate('person')
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
            .select('email username roles person status createdAt')
            .populate('person')
            .lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Crear nuevo usuario
export const createUser = async (req, res) => {
    try {
        const {
            username, email, password, roles, status,
            firstName, lastName, address, phone, document
        } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear la persona primero
        const newPerson = new Person({
            firstName,
            lastName,
            document,
            address,
            phone,
            email,
        });

        const savedPerson = await newPerson.save();

        // Crear el usuario con referencia a la persona
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            roles: roles || 'Vendedor',
            status: status || 'Activo',
            person: savedPerson._id
        });

        const savedUser = await newUser.save();

        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Actualizar usuario
export const updateUser = async (req, res) => {
    try {
        const { roles, status, person: personUpdates } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (roles) user.roles = roles;
        if (status) user.status = status;

        await user.save();

        if (personUpdates && user.person) {
            await Person.findByIdAndUpdate(user.person, personUpdates);
        }

        const updated = await User.findById(user._id).populate('person').lean();
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Eliminar usuario
export const deleteUser = async (req, res) => {
    try {
        if (req.user?.id === req.params.id) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta de usuario' });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
