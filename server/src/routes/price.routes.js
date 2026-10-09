import express from 'express';
import { authenticateToken, optionalAuthenticateToken, requireRole } from '../lib/auth.js';
import { db } from '../services/data/supabaseStore.js';

export const priceRouter = express.Router();

function calculateFreshness(reportingDateStr) {
  if (!reportingDateStr) return { label: 'No recent report', color: 'gray' };
  const reportDate = new Date(reportingDateStr);
  const now = new Date();
  const diffDays = Math.floor((now - reportDate) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return { label: 'Updated Today', color: 'emerald' };
  if (diffDays === 1) return { label: 'Yesterday', color: 'blue' };
  if (diffDays <= 3) return { label: `${diffDays} days ago`, color: 'amber' };
  return { label: 'Outdated report', color: 'red' };
}

/**
 * GET /api/prices
 * Public endpoint for Farmers & general users.
 * Returns only verified, published daily prices.
 */
priceRouter.get('/', async (req, res) => {
  try {
    const { commodity, market, district, state, date } = req.query;
    let prices = await db.getPublishedPrices({
      commodityName: commodity,
      marketId: market,
      district,
      state,
      reportingDate: date
    });

    const enriched = prices.map(p => ({
      ...p,
      freshness: calculateFreshness(p.reportingDate),
      isVerifiedSource: p.sourceType === 'VERIFIED_MARKET_SUBMISSION'
    }));

    res.json({
      count: enriched.length,
      prices: enriched
    });
  } catch (err) {
    console.error('Get prices error:', err);
    res.status(500).json({ error: 'Failed to retrieve market prices.' });
  }
});

/**
 * GET /api/prices/summary
 * Summary metrics for Farmer Price Dashboard.
 */
priceRouter.get('/summary', async (_req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const published = await db.getPublishedPrices();
    const publishedToday = published.filter(p => p.reportingDate === today);
    const reportingMarketsToday = new Set(publishedToday.map(p => p.marketId)).size;

    const topCrops = ['Tomato', 'Onion', 'Chilli Green', 'Cotton', 'Paddy'];
    const cropAverages = topCrops.map(crop => {
      const match = published.filter(p => p.commodityName.toLowerCase() === crop.toLowerCase());
      const avg = match.length ? Math.round(match.reduce((a, b) => a + Number(b.modalPrice), 0) / match.length) : null;
      return { crop, avgModalPrice: avg, sampleCount: match.length };
    }).filter(x => x.avgModalPrice !== null);

    res.json({
      reportingMarketsToday,
      recordsPublishedToday: publishedToday.length,
      totalVerifiedRecords: published.length,
      latestSyncDate: today,
      cropAverages
    });
  } catch (err) {
    console.error('Summary error:', err);
    res.status(500).json({ error: 'Failed to load summary stats.' });
  }
});

/**
 * GET /api/prices/history
 * Historical trends for a specific commodity.
 */
priceRouter.get('/history', async (req, res) => {
  try {
    const { commodity = 'Tomato', marketId } = req.query;
    let prices = await db.getPublishedPrices({ commodityName: commodity, marketId });

    const groupedByDate = new Map();
    for (const p of prices) {
      if (!groupedByDate.has(p.reportingDate)) {
        groupedByDate.set(p.reportingDate, { date: p.reportingDate, prices: [], count: 0 });
      }
      const entry = groupedByDate.get(p.reportingDate);
      entry.prices.push(Number(p.modalPrice));
      entry.count += 1;
    }

    const history = Array.from(groupedByDate.values())
      .map(item => ({
        date: item.date,
        avgModalPrice: Math.round(item.prices.reduce((a, b) => a + b, 0) / item.prices.length),
        minPrice: Math.min(...item.prices),
        maxPrice: Math.max(...item.prices),
        reportsCount: item.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({ commodity, history });
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to retrieve price history.' });
  }
});

/**
 * GET /api/prices/my-submissions
 * Returns the current authenticated official's submissions.
 */
priceRouter.get('/my-submissions', authenticateToken, requireRole('official', 'admin'), async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { submittedBy: req.user.id };
    const list = await db.listPriceSubmissions(filter);
    res.json({ count: list.length, submissions: list });
  } catch (err) {
    console.error('My submissions error:', err);
    res.status(500).json({ error: 'Failed to load submissions.' });
  }
});

/**
 * GET /api/prices/submissions/:id
 */
priceRouter.get('/submissions/:id', authenticateToken, async (req, res) => {
  try {
    const submission = await db.getPriceSubmissionById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    // Role check: official can only view their own; admin can view all
    if (req.user.role !== 'admin' && submission.submittedBy !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to view this submission.' });
    }

    res.json({ submission });
  } catch (err) {
    res.status(500).json({ error: 'Error retrieving submission.' });
  }
});

/**
 * POST /api/prices/submissions
 * Submit daily mandi price (Draft or Submit for Review).
 * Strict validation and verification checks enforced.
 */
priceRouter.post('/submissions', authenticateToken, requireRole('official', 'admin'), async (req, res) => {
  try {
    const {
      marketId,
      marketName,
      district,
      state = 'Telangana',
      commodityName,
      variety = 'Common',
      grade = 'Grade A',
      reportingDate,
      minPrice,
      maxPrice,
      modalPrice,
      arrivalQuantity = 0,
      unit = '₹/Quintal',
      sourceReference,
      remarks,
      isDraft = false
    } = req.body;

    // 1. Mandatory Fields
    if (!marketId || !commodityName || !reportingDate || minPrice === undefined || maxPrice === undefined || modalPrice === undefined) {
      return res.status(400).json({ error: 'Market, commodity, reporting date, and min/max/modal prices are required.' });
    }

    const min = Number(minPrice);
    const max = Number(maxPrice);
    const modal = Number(modalPrice);
    const arrival = Number(arrivalQuantity || 0);

    // 2. Numeric Validations
    if (isNaN(min) || isNaN(max) || isNaN(modal) || min < 0 || max < 0 || modal < 0) {
      return res.status(400).json({ error: 'Prices must be positive numbers.' });
    }

    if (min > max) {
      return res.status(400).json({ error: 'Minimum price cannot exceed Maximum price.' });
    }

    if (modal < min || modal > max) {
      return res.status(400).json({ error: 'Modal price must fall within the Minimum and Maximum price range.' });
    }

    // 3. Official Verification & Market Assignment Authorization Check
    if (req.user.role === 'official') {
      const profile = await db.getOfficialProfileByUserId(req.user.id);
      if (!profile) {
        return res.status(403).json({ error: 'Official profile not found. Please complete official registration.' });
      }

      if (profile.verificationStatus === 'REJECTED' || profile.verificationStatus === 'SUSPENDED') {
        return res.status(403).json({
          error: `Account verification status is '${profile.verificationStatus}'. Unauthorized to submit prices.`
        });
      }

      if (profile.verificationStatus !== 'APPROVED' && !isDraft) {
        return res.status(403).json({
          error: `Account verification status is '${profile.verificationStatus}'. Only APPROVED officials can submit daily prices for admin approval. You can save as Draft in the meantime.`
        });
      }

      const assigned = profile.assignedMarketIds || [];
      const hasPermission = assigned.length === 0 || assigned.includes(marketId) || assigned.some(id => marketName && marketName.toLowerCase().includes(id.toLowerCase()));
      if (!hasPermission) {
        return res.status(403).json({
          error: `Unauthorized for this market. You are assigned to: ${profile.assignedMarketNames?.join(', ') || assigned.join(', ')}.`
        });
      }
    }

    // 4. Duplicate Check for same day, market, commodity, and variety
    const existingSameDay = await db.listPriceSubmissions({
      marketId,
      commodityName,
      reportingDate
    });

    const activeDuplicate = existingSameDay.find(s =>
      (s.status === 'PUBLISHED' || s.status === 'PENDING_REVIEW' || s.status === 'APPROVED') &&
      s.variety?.toLowerCase() === variety.toLowerCase()
    );

    if (activeDuplicate) {
      return res.status(409).json({
        error: `A price record already exists for ${commodityName} at this mandi on ${reportingDate} (Status: ${activeDuplicate.status}). Edit the existing entry or contact administrator.`
      });
    }

    // 5. Initial Status determination
    // Officials can NEVER self-publish as PUBLISHED. Must be DRAFT or PENDING_REVIEW.
    const status = isDraft ? 'DRAFT' : 'PENDING_REVIEW';

    const submission = await db.createPriceSubmission({
      marketId,
      marketName: marketName || marketId,
      district: district || 'Telangana APMC',
      state,
      commodityName,
      variety,
      grade,
      reportingDate,
      minPrice: min,
      maxPrice: max,
      modalPrice: modal,
      arrivalQuantity: arrival,
      unit,
      sourceType: req.user.role === 'admin' ? 'ADMIN_ENTERED' : 'VERIFIED_MARKET_SUBMISSION',
      sourceReference: sourceReference || 'Official APMC Daily Submission',
      remarks: remarks || '',
      submittedBy: req.user.id,
      submittedByName: req.user.fullName,
      status
    });

    // 6. Record in Price Audit Log
    await db.createPriceAuditLog({
      priceRecordId: submission.id,
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      action: isDraft ? 'SAVE_DRAFT' : 'SUBMIT_FOR_REVIEW',
      previousValues: null,
      newValues: { status, modalPrice: modal, minPrice: min, maxPrice: max, reportingDate },
      reason: isDraft ? 'Official saved price draft' : 'Official submitted daily prices for admin approval'
    });

    res.status(201).json({
      message: isDraft ? 'Price saved as draft successfully.' : 'Price submitted for administrative verification and review.',
      submissionId: submission.id,
      submission
    });
  } catch (err) {
    console.error('Price submission error:', err);
    res.status(500).json({ error: 'Failed to submit price: ' + (err.message || 'Internal error') });
  }
});

/**
 * PATCH /api/prices/submissions/:id
 * Allows updating a DRAFT or NEEDS_CORRECTION submission.
 */
priceRouter.patch('/submissions/:id', authenticateToken, requireRole('official', 'admin'), async (req, res) => {
  try {
    const submission = await db.getPriceSubmissionById(req.params.id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    if (req.user.role !== 'admin' && submission.submittedBy !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden. You do not own this submission.' });
    }

    if (submission.status === 'PUBLISHED' && req.user.role !== 'admin') {
      return res.status(400).json({ error: 'Published prices cannot be edited directly by officials. Contact administrator.' });
    }

    const { minPrice, maxPrice, modalPrice, arrivalQuantity, remarks, submitForReview } = req.body;
    const updates = {};

    const min = minPrice !== undefined ? Number(minPrice) : submission.minPrice;
    const max = maxPrice !== undefined ? Number(maxPrice) : submission.maxPrice;
    const modal = modalPrice !== undefined ? Number(modalPrice) : submission.modalPrice;

    if (min > max || modal < min || modal > max) {
      return res.status(400).json({ error: 'Invalid price range: Ensure min <= modal <= max.' });
    }

    updates.minPrice = min;
    updates.maxPrice = max;
    updates.modalPrice = modal;
    if (arrivalQuantity !== undefined) updates.arrivalQuantity = Number(arrivalQuantity);
    if (remarks !== undefined) updates.remarks = remarks;

    if (submitForReview) {
      updates.status = 'PENDING_REVIEW';
    }

    const previousValues = {
      status: submission.status,
      minPrice: submission.minPrice,
      maxPrice: submission.maxPrice,
      modalPrice: submission.modalPrice
    };

    const updated = await db.updatePriceSubmission(req.params.id, updates);

    await db.createPriceAuditLog({
      priceRecordId: submission.id,
      actorUserId: req.user.id,
      actorName: req.user.fullName,
      action: submitForReview ? 'RESUBMIT_FOR_REVIEW' : 'UPDATE_DRAFT',
      previousValues,
      newValues: updates,
      reason: submitForReview ? 'Official revised and resubmitted for review' : 'Official updated draft values'
    });

    res.json({ message: 'Submission updated successfully.', submission: updated });
  } catch (err) {
    console.error('Update submission error:', err);
    res.status(500).json({ error: 'Failed to update submission.' });
  }
});
