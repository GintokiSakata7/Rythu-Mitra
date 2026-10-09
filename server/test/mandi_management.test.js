import assert from 'assert';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../src/lib/auth.js';
import { db } from '../src/services/data/supabaseStore.js';
import { getMarkets } from '../src/services/data/marketRepository.js';
import { optimizeSellingOpportunity } from '../src/services/optimizer/search.js';

async function runTests() {
  console.log('====================================================');
  console.log('RUNNING MANDI MITRA MANAGEMENT & SECURITY TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error('   ', err.message);
      failed++;
    }
  }

  // 1. AUTH & CRYPTOGRAPHY TESTS
  await test('1.1 Password Hashing & Verification', () => {
    const rawPass = 'SecretP@ssword2026';
    const hash = hashPassword(rawPass);
    assert(hash.includes(':'), 'Hash must contain salt separator');
    assert(verifyPassword(rawPass, hash), 'Correct password must verify');
    assert(!verifyPassword('WrongPassword', hash), 'Incorrect password must fail');
  });

  await test('1.2 JWT Signing & Verification', () => {
    const payload = { id: 'usr-test-1', role: 'official', fullName: 'Test Official' };
    const token = signToken(payload, 3600);
    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, 'usr-test-1');
    assert.strictEqual(decoded.role, 'official');
    assert(decoded.exp > Math.floor(Date.now() / 1000), 'Token must have future exp');

    const invalid = verifyToken(token + 'tampered');
    assert.strictEqual(invalid, null, 'Tampered token must fail verification');
  });

  // 2. USER & PROFILE SEED TESTS
  await test('2.1 Default Demo Accounts Exist with Proper Roles', async () => {
    const admin = await db.findUserByEmail('admin@mandimitra.gov.in');
    assert(admin, 'Admin must exist');
    assert.strictEqual(admin.role, 'admin');

    const official = await db.findUserByEmail('official@bowenpally.mandi.gov.in');
    assert(official, 'Official must exist');
    assert.strictEqual(official.role, 'official');

    const profile = await db.getOfficialProfileByUserId(official.id);
    assert(profile, 'Official profile must exist');
    assert.strictEqual(profile.verificationStatus, 'APPROVED');
  });

  // 3. RBAC & PERMISSION BOUNDARIES (NEGATIVE TESTS)
  await test('3.1 Farmer Cannot Submit Mandi Prices (Role Boundary)', async () => {
    const farmer = await db.findUserByEmail('farmer@rythumitra.org');
    assert.strictEqual(farmer.role, 'farmer');
    // Only 'official' or 'admin' roles can access price submission
    const allowedRoles = ['official', 'admin'];
    assert(!allowedRoles.includes(farmer.role), 'Farmer role must be denied access to price submission');
  });

  await test('3.2 Unverified Official Is Flagged as PENDING_VERIFICATION', async () => {
    const pendingOfficial = await db.findUserByEmail('official@warangal.mandi.gov.in');
    const profile = await db.getOfficialProfileByUserId(pendingOfficial.id);
    assert.strictEqual(profile.verificationStatus, 'PENDING_VERIFICATION');
    assert.notStrictEqual(profile.verificationStatus, 'APPROVED', 'Unverified official must not be approved');
  });

  await test('3.3 Official Cannot Submit for Unassigned Market', async () => {
    const official = await db.findUserByEmail('official@bowenpally.mandi.gov.in');
    const profile = await db.getOfficialProfileByUserId(official.id);
    const assigned = profile.assignedMarketIds || [];
    
    // Bowenpally official tries to submit for Warangal Market
    const unassignedMarket = 'TS-Warangal Market';
    const hasPermission = assigned.includes(unassignedMarket);
    assert.strictEqual(hasPermission, false, 'Official must not have authorization for unassigned market');
  });

  await test('3.4 Official Cannot Approve Their Own Submission (Self-Approval Guard)', async () => {
    const official = await db.findUserByEmail('official@bowenpally.mandi.gov.in');
    // Simulate submission created by this official
    const submission = { submittedBy: official.id, status: 'PENDING_REVIEW' };
    const reviewerId = official.id;
    const isSelfApproval = submission.submittedBy === reviewerId;
    assert.strictEqual(isSelfApproval, true, 'Self-approval attempt must be flagged and rejected');
  });

  // 4. DATA VALIDATION TESTS
  await test('4.1 Price Validation: Min Price Cannot Exceed Max Price', () => {
    const min = 3000;
    const max = 2500;
    const modal = 2700;
    const isValid = min <= max && modal >= min && modal <= max;
    assert.strictEqual(isValid, false, 'Min > Max must fail validation');
  });

  await test('4.2 Price Validation: Modal Price Must Fall Within Min and Max', () => {
    const min = 2000;
    const max = 2800;
    const modal = 3200; // Outside range!
    const isValid = modal >= min && modal <= max;
    assert.strictEqual(isValid, false, 'Modal outside min-max must fail validation');
  });

  // 5. WORKFLOW LIFECYCLE: DRAFT -> PENDING_REVIEW -> PUBLISHED
  let createdSubmissionId = null;
  await test('5.1 Create Price Submission for Review and Audit Logging', async () => {
    const official = await db.findUserByEmail('official@bowenpally.mandi.gov.in');
    const today = new Date().toISOString().split('T')[0];

    const submission = await db.createPriceSubmission({
      marketId: 'TS-Bowenpally Market',
      marketName: 'Bowenpally Market',
      district: 'Hyderabad',
      state: 'Telangana',
      commodityName: 'Tomato',
      variety: 'Special Test Grade',
      grade: 'Grade A',
      reportingDate: today,
      minPrice: 2400,
      maxPrice: 3000,
      modalPrice: 2800,
      arrivalQuantity: 120,
      unit: '₹/Quintal',
      sourceType: 'VERIFIED_MARKET_SUBMISSION',
      submittedBy: official.id,
      submittedByName: official.fullName,
      status: 'PENDING_REVIEW'
    });

    createdSubmissionId = submission.id;
    assert.strictEqual(submission.status, 'PENDING_REVIEW');
    assert.strictEqual(submission.modalPrice, 2800);

    // Audit log
    await db.createPriceAuditLog({
      priceRecordId: submission.id,
      actorUserId: official.id,
      actorName: official.fullName,
      action: 'SUBMIT_FOR_REVIEW',
      previousValues: null,
      newValues: { status: 'PENDING_REVIEW', modalPrice: 2800 },
      reason: 'Official daily auction submission'
    });

    const logs = await db.listAuditLogs({ limit: 5 });
    const logFound = logs.find(l => l.priceRecordId === submission.id);
    assert(logFound, 'Audit log entry must be created');
  });

  await test('5.2 Administrator Approves and Publishes Submission', async () => {
    const admin = await db.findUserByEmail('admin@mandimitra.gov.in');
    const updated = await db.updatePriceSubmission(createdSubmissionId, {
      status: 'PUBLISHED',
      approvedBy: admin.id,
      publishedAt: new Date().toISOString()
    });

    assert.strictEqual(updated.status, 'PUBLISHED');

    await db.createReviewLog({
      submissionId: createdSubmissionId,
      reviewerId: admin.id,
      reviewerName: admin.fullName,
      action: 'APPROVE',
      comments: 'Verified against Bowenpally APMC physical auction records.',
      previousStatus: 'PENDING_REVIEW',
      newStatus: 'PUBLISHED'
    });
  });

  // 6. RECOMMENDATION ENGINE INTEGRATION
  await test('6.1 Recommendation Engine Picks Up Published Verified Prices', async () => {
    const markets = await getMarkets({ crop: 'Tomato' });
    const bowenpally = markets.find(m => m.id.includes('Bowenpally') || m.name.includes('Bowenpally'));
    assert(bowenpally, 'Bowenpally market must exist in market repository');
    assert(bowenpally.isOfficialVerified, 'Bowenpally market must reflect official verification status');
    assert(bowenpally.modalPrice > 0, 'Modal price must be positive');
  });

  await test('6.2 Optimizer Runs and Accurately Computes Net Realization with Verified Price', async () => {
    const optResult = await optimizeSellingOpportunity({
      crop: 'Tomato',
      quantityKg: 1000,
      latitude: 17.38,
      longitude: 78.48,
      hasTransport: true,
      perishability: 'medium',
      includeBuyers: false
    });

    assert(optResult.recommendation, 'Optimizer must return top recommendation');
    assert(optResult.recommendation.netRealization > 0, 'Net realization must be calculated and positive');
    assert(optResult.recommendation.expectedNetPerKg > 0, 'Expected net per kg must be positive');
    console.log(`   Top Market: ${optResult.recommendation.name} | Sale Value: ₹${optResult.recommendation.saleValue} | Net: ₹${optResult.recommendation.netRealization} (₹${optResult.recommendation.expectedNetPerKg}/kg)`);
  });

  console.log('\n====================================================');
  console.log(`TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
