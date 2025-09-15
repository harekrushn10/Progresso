import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { hash, compare } from "bcryptjs";
import { PrismaClient } from '@prisma/client';
import authenticate from './middleware/authenticate.js';

dotenv.config();

const JWT_SECRET_KEY = process.env.JWT_SECRET;
const SALT_ROUNDS = 12;
const prisma = new PrismaClient();
const router = express.Router();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET_KEY,
    { expiresIn: "30d" }
  );
};

// Protected Route Example (Admin + Sub-admin)
router.get('/dashboard', authenticate(['ADMIN', 'SUB_ADMIN']), (req, res) => {
  return res.status(200).json({
    message: `Welcome ${req.user.name}`,
    name: req.user.name,
    role: req.user.role,
    user: req.user,
    success: true
  });
});

// Admin Signup Route
router.post('/signup', async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const hashedPassword = await hash(password, SALT_ROUNDS);

    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
      }
    });

    admin.role = 'ADMIN'; // You can also persist this to DB if needed

    const token = generateToken(admin);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });

    return res.status(201).json({ message: 'Admin signup successful', success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Admin Login Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin)
      return res.status(404).json({ message: 'Admin not found', success: false });

    const isMatch = await compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials', success: false });

    admin.role = 'ADMIN';

    const token = generateToken(admin);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });

    return res.status(200).json({ message: 'Login successful', success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

//Subadmin Login Route
router.post('/subadmin/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const subadmin = await prisma.subAdmin.findUnique({ where: { email } });

    if (!subadmin)
      return res.status(404).json({ message: 'Subadmin not found', success: false });

    const isMatch = await compare(password, subadmin.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials', success: false });

    subadmin.role = 'SUB_ADMIN';

    const token = generateToken(subadmin);
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true
    });

    return res.status(200).json({ message: 'Login successful', success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Create Sub-Admin (Admin-only)
router.post('/create-sub-admin', authenticate(['ADMIN']), async (req, res) => {
  const { email, name, password } = req.body;
  const adminId = req.user.id;

  try {
    const hashedPassword = await hash(password, SALT_ROUNDS);

    await prisma.subAdmin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        adminId
      }
    });

    return res.status(201).json({ message: 'Sub-admin created successfully', success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Delete User (Admin-only)
router.delete('/delete-user/:id', authenticate(['ADMIN', 'SUB_ADMIN']), async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.quizAttempt.deleteMany({
      where: {
        userId: id
      }
    });
    await prisma.leaderBoardEntry.deleteMany({
      where: {
        userId: id
      }
    })
    const user = await prisma.user.delete({
      where: {
        id
      }
    });

    return res.status(200).json({ message: 'User deleted successfully', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Get Sub-Admins (Admin-only)
router.get('/sub-admins', authenticate(['ADMIN', 'SUB_ADMIN']), async (req, res) => {
  const adminId = req.user.id;

  try {
    // Get only sub-admins created by the logged-in admin
    const subAdmins = await prisma.subAdmin.findMany({
      where: {
        adminId
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Get total count of sub-admins
    const totalSubAdmins = await prisma.subAdmin.count({
      where: {
        adminId
      }
    });

    return res.status(200).json({
      message: 'Sub-admins fetched successfully',
      subAdmins,
      count: totalSubAdmins,
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Delete Sub-Admin (Admin-only)
router.delete('/sub-admin/:id', authenticate(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  try {
    // First check if the sub-admin belongs to the logged-in admin
    const subAdmin = await prisma.subAdmin.findFirst({
      where: {
        id,
        adminId
      }
    });

    if (!subAdmin) {
      return res.status(404).json({
        message: 'Sub-admin not found or you do not have permission to delete',
        success: false
      });
    }

    // Delete the sub-admin
    await prisma.subAdmin.delete({
      where: {
        id
      }
    });

    return res.status(200).json({
      message: 'Sub-admin deleted successfully',
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

router.get('/admin-profile', authenticate(['ADMIN', 'SUB_ADMIN']), async (req, res) => {
  const adminId = req.user.id;
  const role = req.user.role;

  try {
    let adminData;

    if (role === 'ADMIN') {
      adminData = await prisma.admin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          email: true,
          name: true,
          isSuper: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              subAdmins: true,
              quizzes: true
            }
          }
        }
      });

      if (!adminData) {
        return res.status(404).json({
          message: 'Admin not found',
          success: false
        });
      }

      // Add role explicitly since it's not stored in DB
      adminData.role = 'ADMIN';
    } else if (role === 'SUB_ADMIN') {
      adminData = await prisma.subAdmin.findUnique({
        where: { id: adminId },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          admin: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!adminData) {
        return res.status(404).json({
          message: 'Sub-admin not found',
          success: false
        });
      }

      // Add role explicitly since it's not stored in DB
      adminData.role = 'SUB_ADMIN';
    }

    return res.status(200).json({
      message: 'Admin profile fetched successfully',
      admin: adminData,
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

router.post('/logout', authenticate(['ADMIN', 'SUB_ADMIN']), (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'none',
    secure: true
  });

  return res.status(200).json({ message: 'Logged out successfully', success: true });
});

// Create Referral Code (Admin-only)
router.post('/create-referral-code', authenticate(['ADMIN']), async (req, res) => {
  const { code } = req.body;
  const adminId = req.user.id;

  try {
    // Check if code already exists
    const existingCode = await prisma.promoCode.findUnique({
      where: { code }
    });

    if (existingCode) {
      return res.status(400).json({
        message: 'Referral code already exists',
        success: false
      });
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code,
        adminId
      }
    });

    return res.status(201).json({
      message: 'Referral code created successfully',
      promoCode: {
        id: promoCode.id,
        code: promoCode.code,
        usageCount: promoCode.usageCount,
        isActive: promoCode.isActive,
        createdAt: promoCode.createdAt
      },
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Get All Referral Codes for Admin
router.get('/referral-codes', authenticate(['ADMIN']), async (req, res) => {
  const adminId = req.user.id;

  try {
    const promoCodes = await prisma.promoCode.findMany({
      where: { adminId },
      select: {
        id: true,
        code: true,
        usageCount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            payments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalCodes = await prisma.promoCode.count({
      where: { adminId }
    });

    const totalUsage = await prisma.promoCode.aggregate({
      where: { adminId },
      _sum: {
        usageCount: true
      }
    });

    return res.status(200).json({
      message: 'Referral codes fetched successfully',
      promoCodes,
      stats: {
        totalCodes,
        totalUsage: totalUsage._sum.usageCount || 0
      },
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Get Referral Code Details with Payments
router.get('/referral-code/:id', authenticate(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  try {
    const promoCode = await prisma.promoCode.findFirst({
      where: {
        id,
        adminId
      },
      include: {
        payments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            quiz: {
              select: {
                id: true,
                title: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!promoCode) {
      return res.status(404).json({
        message: 'Referral code not found or you do not have permission to view',
        success: false
      });
    }

    return res.status(200).json({
      message: 'Referral code details fetched successfully',
      promoCode,
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Toggle Referral Code Active Status
router.patch('/referral-code/:id/toggle', authenticate(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  try {
    // First check if the referral code belongs to the logged-in admin
    const promoCode = await prisma.promoCode.findFirst({
      where: {
        id,
        adminId
      }
    });

    if (!promoCode) {
      return res.status(404).json({
        message: 'Referral code not found or you do not have permission to modify',
        success: false
      });
    }

    // Toggle the active status
    const updatedPromoCode = await prisma.promoCode.update({
      where: { id },
      data: { isActive: !promoCode.isActive }
    });

    return res.status(200).json({
      message: `Referral code ${updatedPromoCode.isActive ? 'activated' : 'deactivated'} successfully`,
      promoCode: {
        id: updatedPromoCode.id,
        code: updatedPromoCode.code,
        isActive: updatedPromoCode.isActive,
        usageCount: updatedPromoCode.usageCount
      },
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Delete Referral Code
router.delete('/referral-code/:id', authenticate(['ADMIN']), async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  try {
    // First check if the referral code belongs to the logged-in admin
    const promoCode = await prisma.promoCode.findFirst({
      where: {
        id,
        adminId
      }
    });

    if (!promoCode) {
      return res.status(404).json({
        message: 'Referral code not found or you do not have permission to delete',
        success: false
      });
    }

    // Check if the code has been used
    if (promoCode.usageCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete referral code that has been used',
        success: false
      });
    }

    // Delete the referral code
    await prisma.promoCode.delete({
      where: { id }
    });

    return res.status(200).json({
      message: 'Referral code deleted successfully',
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

// Get Referral Code Analytics
router.get('/referral-analytics', authenticate(['ADMIN']), async (req, res) => {
  const adminId = req.user.id;

  try {
    // Get top performing referral codes
    const topCodes = await prisma.promoCode.findMany({
      where: { adminId },
      select: {
        id: true,
        code: true,
        usageCount: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { usageCount: 'desc' },
      take: 5
    });

    // Get recent referral usage
    const recentUsage = await prisma.payment.findMany({
      where: {
        promoCode: {
          adminId
        },
        promoCodeId: {
          not: null
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        quiz: {
          select: {
            title: true
          }
        },
        promoCode: {
          select: {
            code: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get monthly usage statistics
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const monthlyStats = await prisma.payment.groupBy({
      by: ['promoCodeId'],
      where: {
        promoCode: {
          adminId
        },
        promoCodeId: {
          not: null
        },
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        id: true
      }
    });

    const totalStats = await prisma.promoCode.aggregate({
      where: { adminId },
      _count: {
        id: true
      },
      _sum: {
        usageCount: true
      }
    });

    return res.status(200).json({
      message: 'Referral analytics fetched successfully',
      analytics: {
        topCodes,
        recentUsage,
        monthlyUsageCount: monthlyStats.length,
        totalCodes: totalStats._count.id,
        totalUsage: totalStats._sum.usageCount || 0
      },
      success: true
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error', success: false });
  }
});

export default router;
