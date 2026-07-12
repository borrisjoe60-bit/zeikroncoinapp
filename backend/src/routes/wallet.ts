import { Router } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// Connect wallet
router.post('/connect', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      throw new ApiError(400, 'Wallet address is required');
    }

    const existingWallet = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (existingWallet && existingWallet.id !== req.userId) {
      throw new ApiError(409, 'Wallet already connected to another account');
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { walletAddress },
      select: {
        id: true,
        email: true,
        walletAddress: true
      }
    });

    res.json({
      message: 'Wallet connected successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// Get wallet info
router.get('/info', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { portfolios: true }
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      walletAddress: user.walletAddress,
      portfolio: user.portfolios[0] || null
    });
  } catch (error) {
    next(error);
  }
});

export default router;
