import { Router, Response } from 'express';
import bcryptjs from 'bcryptjs';
import prisma from '../prisma/client';
import { generateToken, AuthRequest, authMiddleware } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ApiError(409, 'User already exists');
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        portfolios: {
          create: {}
        }
      }
    });

    const token = generateToken(user.id, user.email);

    res.status(201).json({
      id: user.id,
      email: user.email,
      token,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const token = generateToken(user.id, user.email);

    res.json({
      id: user.id,
      email: user.email,
      walletAddress: user.walletAddress,
      token,
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        walletAddress: true,
        createdAt: true,
        portfolios: true
      }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

export default router;
