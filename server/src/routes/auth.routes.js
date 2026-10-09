import express from 'express';
import { hashPassword, verifyPassword, signToken, authenticateToken } from '../lib/auth.js';
import { db } from '../services/data/supabaseStore.js';

export const authRouter = express.Router();

/**
 * POST /api/auth/register
 * Supports Farmer and Official registration.
 * Admin role self-registration is strictly disallowed for safety.
 */
authRouter.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, role = 'farmer', organizationName, officialIdReference, assignedMarketId, assignedMarketName } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await db.findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Safety: Protect admin role creation
    const requestedRole = (role === 'admin') ? 'farmer' : (role === 'official' ? 'official' : (role === 'buyer' ? 'buyer' : 'farmer'));

    const passwordHash = hashPassword(password);
    const user = await db.createUser({
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone || '',
      passwordHash,
      role: requestedRole,
      accountStatus: 'active'
    });

    let officialProfile = null;
    let buyerProfile = null;
    if (requestedRole === 'official') {
      officialProfile = await db.createOfficialProfile({
        userId: user.id,
        organizationName: organizationName || 'APMC Market Committee',
        officialIdReference: officialIdReference || `APMC-${Date.now().toString().slice(-4)}`,
        assignedMarketIds: assignedMarketId ? [assignedMarketId] : [],
        assignedMarketNames: assignedMarketName ? [assignedMarketName] : [],
        verificationStatus: 'PENDING_VERIFICATION',
        verificationNotes: 'Pending administrative verification review.'
      });
    } else if (requestedRole === 'buyer') {
      const { companyName, buyerType, gstin, fssai, cin, officerName } = req.body;
      buyerProfile = await db.createBuyerProfile({
        userId: user.id,
        companyName,
        type: buyerType || 'Food Processor',
        gstin,
        fssai,
        cin,
        officerName,
        phone: phone || ''
      });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    });

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus
      },
      officialProfile,
      buyerProfile
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed: ' + (err.message || 'Internal error') });
  }
});

/**
 * POST /api/auth/login
 * Validates credentials, checks account status, returns session token.
 */
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await db.findUserByEmail(cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ error: 'Account has been suspended. Please contact administrator.' });
    }

    let officialProfile = null;
    let buyerProfile = null;
    if (user.role === 'official') {
      officialProfile = await db.getOfficialProfileByUserId(user.id);
    } else if (user.role === 'buyer') {
      buyerProfile = await db.getBuyerProfileByUserId(user.id);
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    });

    res.json({
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus
      },
      officialProfile,
      buyerProfile
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed: ' + (err.message || 'Internal error') });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current profile based on token.
 */
authRouter.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let officialProfile = null;
    let buyerProfile = null;
    if (user.role === 'official') {
      officialProfile = await db.getOfficialProfileByUserId(user.id);
    } else if (user.role === 'buyer') {
      buyerProfile = await db.getBuyerProfileByUserId(user.id);
    }

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        accountStatus: user.accountStatus
      },
      officialProfile,
      buyerProfile
    });
  } catch (err) {
    console.error('Me endpoint error:', err);
    res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
});

/**
 * POST /api/auth/logout
 */
authRouter.post('/logout', (_req, res) => {
  res.json({ message: 'Logged out successfully.' });
});
