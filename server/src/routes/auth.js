import express from 'express';
import { login, register, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Login
router.post('/login', login);

// Registrar novo usuário
router.post('/register', register);

// Logout
router.post('/logout', verifyToken, logout);

export default router;
