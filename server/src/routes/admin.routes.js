import express from 'express';
import { authenticateToken, requireRole } from '../lib/auth.js';
import { db } from '../services/data/supabaseStore.js';
import { getMarkets } from '../services/data/marketRepository.js';

export const adminRouter = express.Router();

// Enforce admin role on ALL administrative routes
adminRouter.use(authenticateToken);
adminRouter.use(requireRole('admin'));

/**
 * GET /api/admin/dashboard
 * Administrative summary metrics
 */
adminRouter.get('/dashboard', async (_req, res) => {
  try {
    const stats = await db.getAdminDashboardStats();
    res.json({ stats });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard metrics.' });
  }
});

/**
 * GET /api/admin/officials
 * List official applicants with optional status filtering
 */
adminRouter.get('/officials', async (req, res) => {
  try {
    const { status } = req.query;
    const profiles = await db.listOfficialProfiles({ status });
    res.json({ officials: profiles });
  } catch (err) {
    console.error('List officials error:', err);
    res.status(500).json({ error: 'Failed to list officials.' });
  }
});

/**
 * PATCH /api/admin/officials/:id/status
 * Approve, Reject, or Suspend an official account.
 */
adminRouter.patch('/officials/:id/status', async (req, res) => {
  try {
    const { status, notes, assignedMarkets } = req.body;
    const validStatuses = ['APPROVED', 'REJECTED', 'SUSPENDED', 'PENDING_VERIFICATION'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const profile = await db.getOfficialProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Official profile not found.' });
    }

    const updates = {
      verificationStatus: status,
      reviewedBy: req.user.id,
      reviewedAt: new Date().toISOString(),
      verificationNotes: notes || `Status updated to ${status} by administrator.`
    };

    if (assignedMarkets && Array.isArray(assignedMarkets)) {
      updates.assignedMarketIds = assignedMarkets;
    }

    const updated = await db.updateOfficialProfile(profile.id, updates);

    // Audit log
    await db.createReviewLog({
      submissionId: profile.id,
      reviewerId: req.user.id,
      reviewerName: req.user.fullName,
      action: `OFFICIAL_${status}`,
      comments: notes || `Official account status transitioned to ${status}`,
      previousStatus: profile.verificationStatus,
      newStatus: status
    });

    res.json({ message: `Official account marked as ${status}.`, profile: updated });
  } catch (err) {
    console.error('Update official status error:', err);
    res.status(500).json({ error: 'Failed to update official status.' });
  }
});

/**
 * PATCH /api/admin/officials/:id/assign-markets
 * Assign specific authorized mandis to an official.
 */
adminRouter.patch('/officials/:id/assign-markets', async (req, res) => {
  try {
    const { marketIds, marketNames } = req.body;
    if (!marketIds || !Array.isArray(marketIds)) {
      return res.status(400).json({ error: 'marketIds must be an array of market identifiers.' });
    }

    const profile = await db.getOfficialProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Official profile not found.' });
    }

    const updated = await db.updateOfficialProfile(profile.id, {
      assignedMarketIds: marketIds,
      assignedMarketNames: marketNames || marketIds
    });

    res.json({ message: 'Markets assigned successfully.', profile: updated });
  } catch (err) {
    console.error('Assign markets error:', err);
    res.status(500).json({ error: 'Failed to assign markets.' });
  }
});

/**
 * GET /api/admin/prices
 * Review queue of submitted prices (Pending, Needs Correction, etc.)
 */
adminRouter.get('/prices', async (req, res) => {
  try {
    const { status = 'PENDING_REVIEW' } = req.query;
    const prices = await db.listPriceSubmissions({ status });
    res.json({ count: prices.length, submissions: prices });
  } catch (err) {
    console.error('Admin prices error:', err);
    res.status(500).json({ error: 'Failed to fetch price review queue.' });
  }
});

/**
 * POST /api/admin/prices/:id/review
 * Action: APPROVE (and PUBLISH), REJECT, or REQUEST_CORRECTION
 */
adminRouter.post('/prices/:id/review', async (req, res) => {
  try {
    const { action, comments } = req.body;
    const submission = await db.getPriceSubmissionById(req.params.id);

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    // Official cannot approve their own submission!
    if (submission.submittedBy === req.user.id) {
      return res.status(403).json({ error: 'Security policy violation: An official/admin cannot approve their own price submission.' });
    }

    const validActions = ['APPROVE', 'REJECT', 'REQUEST_CORRECTION'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
    }

    if ((action === 'REJECT' || action === 'REQUEST_CORRECTION') && (!comments || comments.trim().length < 5)) {
      return res.status(400).json({ error: 'A clear reason/comment of at least 5 characters is mandatory for rejection or correction requests.' });
    }

    const previousStatus = submission.status;
    let newStatus = 'PENDING_REVIEW';
    const updates = {};

    if (action === 'APPROVE') {
      newStatus = 'PUBLISHED';
      updates.status = 'PUBLISHED';
      updates.approvedBy = req.user.id;
      updates.publishedAt = new Date().toISOString();
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
      updates.status = 'REJECTED';
      updates.remarks = `[REJECTED by Admin]: ${comments}`;
    } else if (action === 'REQUEST_CORRECTION') {
      newStatus = 'NEEDS_CORRECTION';
      updates.status = 'NEEDS_CORRECTION';
      updates.remarks = `[CORRECTION REQUESTED]: ${comments}`;
    }

    const updated = await db.updatePriceSubmission(submission.id, updates);

    // Record review log
    await db.createReviewLog({
      submissionId: submission.id,
      reviewerId: req.user.id,
      reviewerName: req.user.fullName,
      action,
      comments: comments || 'Approved for public dissemination',
      previousStatus,
      newStatus
    });

    // Record price audit log
    await db.createPriceAuditLog({
      priceRecordId: submission.id,
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      action: `PRICE_${action}`,
      previousValues: { status: previousStatus, modalPrice: submission.modalPrice },
      newValues: { status: newStatus, modalPrice: submission.modalPrice },
      reason: comments || 'Administrative review completed'
    });

    res.json({
      message: `Submission successfully marked as ${newStatus}.`,
      submission: updated
    });
  } catch (err) {
    console.error('Review action error:', err);
    res.status(500).json({ error: 'Review action failed: ' + (err.message || 'Internal error') });
  }
});

/**
 * GET /api/admin/audit-logs
 * Security & price audit trail
 */
adminRouter.get('/audit-logs', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 100;
    const logs = await db.listAuditLogs({ limit });
    res.json({ count: logs.length, logs });
  } catch (err) {
    console.error('Audit logs error:', err);
    res.status(500).json({ error: 'Failed to retrieve audit logs.' });
  }
});

/**
 * GET /api/admin/commodities
 * Manage commodities
 */
adminRouter.get('/commodities', async (_req, res) => {
  try {
    const list = await db.getAllCommodities();
    res.json({ commodities: list });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load commodities.' });
  }
});

/**
 * POST /api/admin/commodities
 * Add a new commodity
 */
adminRouter.post('/commodities', async (req, res) => {
  try {
    const { commodityName, variety, grade, canonicalUnit } = req.body;
    if (!commodityName) {
      return res.status(400).json({ error: 'Commodity name is required.' });
    }

    const item = await db.createCommodity({
      commodityName: commodityName.trim(),
      variety: variety || 'Standard',
      grade: grade || 'Grade A',
      canonicalUnit: canonicalUnit || '₹/Quintal'
    });

    res.status(201).json({ message: 'Commodity registered.', commodity: item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create commodity.' });
  }
});

/**
 * PATCH /api/admin/commodities/:id/toggle
 */
adminRouter.patch('/commodities/:id/toggle', async (req, res) => {
  try {
    const { active } = req.body;
    const item = await db.toggleCommodity(req.params.id, Boolean(active));
    res.json({ message: 'Commodity updated.', commodity: item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle commodity.' });
  }
});

/**
 * GET /api/admin/markets
 * Mandi reporting status
 */
adminRouter.get('/markets', async (_req, res) => {
  try {
    const allMarkets = await getMarkets();
    const today = new Date().toISOString().split('T')[0];
    const publishedToday = await db.getPublishedPrices({ reportingDate: today });
    const reportedMarketIds = new Set(publishedToday.map(p => p.marketId));

    const enriched = allMarkets.map(m => ({
      ...m,
      hasReportedToday: reportedMarketIds.has(m.id) || reportedMarketIds.has(`TS-${m.name}`) || reportedMarketIds.has(m.name),
      lastReportDate: reportedMarketIds.has(m.id) ? today : 'Pending'
    }));

    res.json({ count: enriched.length, markets: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load markets.' });
  }
});
