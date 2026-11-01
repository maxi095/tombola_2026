import User from "../models/user.model.js";
import Person from "../models/person.model.js";
import bcrypt from 'bcrypt';
import { createAccessToken } from "../libs/jwt.js";
import jwt from 'jsonwebtoken';
import { TOKEN_SECRET } from "../config.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
};

export const register = async (req, res) => {
  const { email, password, username, firstName, lastName, address, phone } = req.body;

  try {
    const userFound = await User.findOne({ email });
    if (userFound) return res.status(400).json(["El email ya está en uso"]);

    const personExists = await Person.findOne({ email });
    if (personExists) return res.status(400).json(["Ya existe una persona con ese email"]);

    const newPerson = new Person({ firstName, lastName, address, phone, email });
    const savedPerson = await newPerson.save();

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      roles: 'Administrador',
      person: savedPerson._id
    });

    const userSaved = await newUser.save();
    const token = await createAccessToken({
      id: userSaved._id,
      roles: userSaved.roles
    });

    res.cookie("token", token, cookieOptions);
    res.json({
      token,
      id: userSaved._id,
      username: userSaved.username,
      email: userSaved.email,
      roles: userSaved.roles,
      createdAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
      person: savedPerson
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userFound = await User.findOne({ email }).populate("person");

    if (!userFound) return res.status(400).json({ message: "Usuario no encontrado" });

    if (userFound.status === 'Inactivo') {
      return res.status(403).json({ message: "El usuario se encuentra inactivo. Comuníquese con la administración." });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

    const token = await createAccessToken({
      id: userFound._id,
      roles: userFound.roles
    });

    res.cookie("token", token, cookieOptions);
    res.json({
      token,
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      roles: userFound.roles,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
      person: userFound.person
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", { ...cookieOptions, expires: new Date(0) });
  return res.sendStatus(200);
};

export const profile = async (req, res) => {
  const userFound = await User.findById(req.user.id).populate("person");

  if (!userFound) return res.status(400).json({ message: "Usuario no encontrado" });

  return res.json({
    id: userFound._id,
    username: userFound.username,
    email: userFound.email,
    roles: userFound.roles,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
    person: userFound.person
  });
};

export const verifyToken = async (req, res) => {
  const token = req.cookies?.token || 
    (req.headers.authorization?.startsWith('Bearer ') 
      ? req.headers.authorization.split(' ')[1] 
      : null);

  if (!token) return res.status(401).json({ message: "No autorizado" });

  jwt.verify(token, TOKEN_SECRET, async (err, user) => {
    if (err) return res.status(401).json({ message: "Token inválido" });

    const userFound = await User.findById(user.id).populate("person");
    if (!userFound) return res.status(401).json({ message: "Usuario no encontrado" });

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
      roles: userFound.roles,
      person: userFound.person
    });
  });
};
