import express from 'express';
import { User } from '../models/users';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || '';

export const authRouter = express.Router();

authRouter.post('/login', async (req, res) => {
  const { email , username , password } = req.body;
    
  // Check if the user exists
    const user = await User.findOne({ email});
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(403).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
});

authRouter.post('/register', async (req, res) => {
  const { email, password , ...body } = req.body;

    // Check if the user already exists
    const user = await User.findOne({
        email,
    });
    if (user) {
        return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create the user
    await User.create({
        email,
        password: hashedPassword,
        ...body,
    });

    res.status(201).json({ message: 'User created' });
});