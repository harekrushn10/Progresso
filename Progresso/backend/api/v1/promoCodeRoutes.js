import express from 'express';
import { PrismaClient } from '@prisma/client';
import authenticate from './middleware/authenticate.js';

const prisma = new PrismaClient();
const router = express.Router();

/**
 * @desc Create a new promo code
 * @route POST /api/v1/promocode/create-promocode
 * @access Private (Admin only)
 * @tested False
 */
router.post('/create-promocode', authenticate(['ADMIN']), async (req, res) => {
  const { code } = req.body;
  const adminId = req.user.id;

  try {
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        message: 'Please provide a valid promo code'
      });
    }

    // Check if promo code already exists
    const existingPromoCode = await prisma.promoCode.findUnique({
      where: { code }
    });

    if (existingPromoCode) {
      return res.status(400).json({
        message: 'Promo code already exists'
      });
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase().trim(),
        adminId
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: promoCode
    });
  }
  catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({ success: false, message: 'Error creating promo code' });
  }
});

/**
 * @desc Get all promo codes
 * @route GET /api/v1/promocode/get-promocodes
 * @access Private (Admin only)
 * @tested False
 */
router.get('/get-promocodes', authenticate(['ADMIN']), async (req, res) => {
  const { page = 1, limit = 10, isActive } = req.query;
  const adminId = req.user.id;

  try {
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { adminId };

    // Filter by active status if provided
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [promoCodes, totalCount] = await Promise.all([
      prisma.promoCode.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.promoCode.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        promoCodes,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  }
  catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ success: false, message: 'Error fetching promo codes' });
  }
});

/**
 * @desc Get a single promo code by ID
 * @route GET /api/v1/promocode/get-promocode/:id
 * @access Private (Admin only)
 * @tested False
 */
router.get('/get-promocode/:id', authenticate(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  try {
    const promoCode = await prisma.promoCode.findFirst({
      where: {
        id,
        adminId
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!promoCode) {
      return res.status(404).json({
        message: 'Promo code not found'
      });
    }

    res.status(200).json({
      success: true,
      data: promoCode
    });
  }
  catch (error) {
    console.error('Error fetching promo code:', error);
    res.status(500).json({ success: false, message: 'Error fetching promo code' });
  }
});

/**
 * @desc Update a promo code
 * @route PUT /api/v1/promocode/update-promocode/:id
 * @access Private (Admin only)
 * @tested False
 */
router.put('/update-promocode/:id', authenticate(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const { code, isActive } = req.body;
  const adminId = req.user.id;

  try {
    // Check if promo code exists and belongs to admin
    const existingPromoCode = await prisma.promoCode.findFirst({
      where: {
        id,
        adminId
      }
    });

    if (!existingPromoCode) {
      return res.status(404).json({
        message: 'Promo code not found'
      });
    }

    // If updating code, check for duplicates
    if (code && code !== existingPromoCode.code) {
      const duplicatePromoCode = await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase().trim() }
      });

      if (duplicatePromoCode) {
        return res.status(400).json({
          message: 'Promo code already exists'
        });
      }
    }

    const updateData = {};
    if (code !== undefined) updateData.code = code.toUpperCase().trim();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updatedPromoCode = await prisma.promoCode.update({
      where: { id },
      data: updateData,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedPromoCode
    });
  }
  catch (error) {
    console.error('Error updating promo code:', error);
    res.status(500).json({ success: false, message: 'Error updating promo code' });
  }
});

/**
 * @desc Delete a promo code
 * @route DELETE /api/v1/promocode/delete-promocode/:id
 * @access Private (Admin only)
 * @tested False
 */
router.delete('/delete-promocode/:id', authenticate(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  try {
    // Check if promo code exists and belongs to admin
    const existingPromoCode = await prisma.promoCode.findFirst({
      where: {
        id,
        adminId
      },
      include: {
        payments: true
      }
    });

    if (!existingPromoCode) {
      return res.status(404).json({
        message: 'Promo code not found'
      });
    }

    // Check if promo code has been used in payments
    if (existingPromoCode.payments.length > 0) {
      return res.status(400).json({
        message: 'Cannot delete promo code that has been used in payments'
      });
    }

    await prisma.promoCode.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  }
  catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({ success: false, message: 'Error deleting promo code' });
  }
});

/**
 * @desc Validate a promo code
 * @route POST /api/v1/promocode/validate-promocode
 * @access Private (User/Admin)
 * @tested False
 */
router.post('/validate-promocode', authenticate(['USER', 'ADMIN']), async (req, res) => {
  const { code } = req.body;

  try {
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        message: 'Please provide a valid promo code'
      });
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { 
        code: code.toUpperCase().trim() 
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!promoCode) {
      return res.status(404).json({
        message: 'Invalid promo code'
      });
    }

    if (!promoCode.isActive) {
      return res.status(400).json({
        message: 'Promo code is inactive'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: promoCode.id,
        code: promoCode.code,
        usageCount: promoCode.usageCount,
        isActive: promoCode.isActive,
        admin: promoCode.admin
      }
    });
  }
  catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ success: false, message: 'Error validating promo code' });
  }
});



/**
 * @desc Join quiz with promo code (validates and increments usage count)
 * @route POST /api/v1/promocode/join-quiz
 * @access Private (User/Admin)
 * @tested False
 */
router.post('/join-quiz', authenticate(['USER', 'ADMIN']), async (req, res) => {
    const { code } = req.body;
    const userId = req.user.id;
  
    try {
      // Validate input
      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          message: 'Please provide a valid promo code'
        });
      }
  
      // Start a transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Find and validate promo code
        const promoCode = await tx.promoCode.findUnique({
          where: { 
            code: code.toUpperCase().trim() 
          },
          include: {
            admin: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });
  
        if (!promoCode) {
          throw new Error('INVALID_PROMO_CODE');
        }
  
        if (!promoCode.isActive) {
          throw new Error('PROMO_CODE_INACTIVE');
        }
  
        // Increment usage count
        const updatedPromoCode = await tx.promoCode.update({
          where: { id: promoCode.id },
          data: {
            usageCount: {
              increment: 1
            }
          },
          include: {
            admin: {
              select: {
                id: true,
                name: true
              }
            }
          }
        });
  
        return {
          promoCode: updatedPromoCode
        };
      });
  
      res.status(200).json({
        success: true,
        message: 'Successfully joined quiz with promo code',
        data: {
          promoCode: {
            id: result.promoCode.id,
            code: result.promoCode.code,
            usageCount: result.promoCode.usageCount,
            admin: result.promoCode.admin
          },
          userId
        }
      });
  
    } catch (error) {
      console.error('Error joining quiz with promo code:', error);
  
      // Handle custom errors
      if (error.message === 'INVALID_PROMO_CODE') {
        return res.status(404).json({
          success: false,
          message: 'Invalid promo code'
        });
      }
  
      if (error.message === 'PROMO_CODE_INACTIVE') {
        return res.status(400).json({
          success: false,
          message: 'Promo code is inactive'
        });
      }
  
      res.status(500).json({ 
        success: false, 
        message: 'Error joining quiz with promo code' 
      });
    }
  });

export default router;