import express from 'express';
import { authenticateToken, requireRole } from '../lib/auth.js';
import { db } from '../services/data/supabaseStore.js';
import { getMarkets } from '../services/data/marketRepository.js';

export const officialRouter = express.Router();

/**
 * GET /api/official/me
 * Retrieves official profile, verification state, and quick stats.
 */
officialRouter.get('/me', authenticateToken, requireRole('official', 'admin'), async (req, res) => {
  try {
    const profile = await db.getOfficialProfileByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({ error: 'Official profile not found.' });
    }

    const mySubmissions = await db.listPriceSubmissions({ submittedBy: req.user.id });

    res.json({
      profile,
      stats: {
        totalSubmissions: mySubmissions.length,
        published: mySubmissions.filter(s => s.status === 'PUBLISHED').length,
        pendingReview: mySubmissions.filter(s => s.status === 'PENDING_REVIEW').length,
        needsCorrection: mySubmissions.filter(s => s.status === 'NEEDS_CORRECTION').length,
        rejected: mySubmissions.filter(s => s.status === 'REJECTED').length
      }
    });
  } catch (err) {
    console.error('Official me error:', err);
    res.status(500).json({ error: 'Failed to retrieve official details.' });
  }
});

/**
 * POST /api/official/apply
 * Allows an official to update/submit their credentials or assigned market request.
 */
officialRouter.post('/apply', authenticateToken, requireRole('official'), async (req, res) => {
  try {
    const { organizationName, officialIdReference, requestedMarketId, requestedMarketName, notes } = req.body;
    let profile = await db.getOfficialProfileByUserId(req.user.id);

    if (profile) {
      profile = await db.updateOfficialProfile(profile.id, {
        organizationName: organizationName || profile.organizationName,
        officialIdReference: officialIdReference || profile.officialIdReference,
        verificationStatus: 'PENDING_VERIFICATION',
        verificationNotes: notes || 'Updated application submitted for administrative review.',
        assignedMarketIds: requestedMarketId ? [requestedMarketId] : profile.assignedMarketIds,
        assignedMarketNames: requestedMarketName ? [requestedMarketName] : profile.assignedMarketNames
      });
    } else {
      profile = await db.createOfficialProfile({
        userId: req.user.id,
        organizationName: organizationName || 'APMC Authority',
        officialIdReference: officialIdReference || `APMC-${Date.now().toString().slice(-4)}`,
        assignedMarketIds: requestedMarketId ? [requestedMarketId] : [],
        assignedMarketNames: requestedMarketName ? [requestedMarketName] : [],
        verificationStatus: 'PENDING_VERIFICATION',
        verificationNotes: notes || 'New application submitted.'
      });
    }

    res.json({ message: 'Official verification application submitted.', profile });
  } catch (err) {
    console.error('Official apply error:', err);
    res.status(500).json({ error: 'Application failed: ' + (err.message || 'Internal error') });
  }
});

/**
 * GET /api/official/assigned-markets
 * Returns markets that this official is authorized to submit prices for.
 */
officialRouter.get('/assigned-markets', authenticateToken, requireRole('official', 'admin'), async (req, res) => {
  try {
    const allMarkets = await getMarkets();
    if (req.user.role === 'admin') {
      return res.json({ markets: allMarkets, isAllMarkets: true });
    }

    const profile = await db.getOfficialProfileByUserId(req.user.id);
    if (!profile) {
      return res.json({ markets: [] });
    }

    const assignedIds = profile.assignedMarketIds || [];
    const assigned = allMarkets.filter(m => assignedIds.includes(m.id) || assignedIds.some(id => m.name.toLowerCase().includes(id.toLowerCase())));

    // If no exact match found yet, provide the profile's declared assigned market
    if (assigned.length === 0 && assignedIds.length > 0) {
      return res.json({
        markets: assignedIds.map(id => ({
          id,
          name: profile.assignedMarketNames?.[0] || id,
          district: 'Telangana APMC',
          state: 'Telangana'
        }))
      });
    }

    res.json({ markets: assigned, verificationStatus: profile.verificationStatus });
  } catch (err) {
    console.error('Assigned markets error:', err);
    res.status(500).json({ error: 'Failed to fetch assigned markets.' });
  }
});
