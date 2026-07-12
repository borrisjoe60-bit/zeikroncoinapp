import { Router } from 'express';
import prisma from '../prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { ApiError } from '../middleware/errorHandler';

const router = Router();

// Get portfolio
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.userId }
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: { userId: req.userId! }
      });
    }

    res.json(portfolio);
  } catch (error) {
    next(error);
  }
});

// Update portfolio balance
router.patch('/balance', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { zkdBalance, usdValue } = req.body;

    if (zkdBalance === undefined && usdValue === undefined) {
      throw new ApiError(400, 'At least one balance field is required');
    }

    let portfolio = await prisma.portfolio.findUnique({
      where: { userId: req.userId }
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: { userId: req.userId! }
      });
    }

    const updated = await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        ...(zkdBalance !== undefined && { zkdBalance }),
        ...(usdValue !== undefined && { usdValue }),
        totalValue: (zkdBalance || portfolio.zkdBalance) * (usdValue || portfolio.usdValue)
      }
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;
