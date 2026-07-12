import { Router } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// Create transaction
router.post('/create', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { to, amount, token = 'ZKC' } = req.body;

    if (!to || !amount) {
      throw new ApiError(400, 'To address and amount are required');
    }

    if (amount <= 0) {
      throw new ApiError(400, 'Amount must be greater than 0');
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    if (!user?.walletAddress) {
      throw new ApiError(400, 'Wallet not connected');
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: req.userId!,
        from: user.walletAddress,
        to,
        amount,
        token,
        status: 'pending'
      }
    });

    res.status(201).json({
      message: 'Transaction created',
      transaction
    });
  } catch (error) {
    next(error);
  }
});

// Get transactions
router.get('/history', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100);
    const skip = Math.max(parseInt(req.query.skip as string) || 0, 0);

    const transactions = await prisma.transaction.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });

    const total = await prisma.transaction.count({
      where: { userId: req.userId }
    });

    res.json({
      transactions,
      total,
      limit,
      skip
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction by ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id }
    });

    if (!transaction || transaction.userId !== req.userId) {
      throw new ApiError(404, 'Transaction not found');
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// Update transaction status (for admin/system)
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { status, hash } = req.body;

    if (!status) {
      throw new ApiError(400, 'Status is required');
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id }
    });

    if (!transaction || transaction.userId !== req.userId) {
      throw new ApiError(404, 'Transaction not found');
    }

    const updated = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        status,
        ...(hash && { hash })
      }
    });

    res.json({
      message: 'Transaction updated',
      transaction: updated
    });
  } catch (error) {
    next(error);
  }
});

export default router;
