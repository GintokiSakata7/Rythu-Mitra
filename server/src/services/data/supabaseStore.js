import { supabase, supabaseEnabled } from '../../lib/supabase.js';
import { hashPassword } from '../../lib/auth.js';
import { randomUUID } from 'crypto';

// Pre-computed hashes for default test accounts (using hashPassword format)
const DEFAULT_ADMIN_HASH = hashPassword('Admin@123');
const DEFAULT_OFFICIAL_HASH = hashPassword('Official@123');
const DEFAULT_FARMER_HASH = hashPassword('Farmer@123');

const INITIAL_USERS = [
  {
    id: 'a0000001-0000-0000-0000-000000000001',
    fullName: 'Dr. Rameshwar Rao (APMC Director)',
    email: 'admin@mandimitra.gov.in',
    phone: '+91 98480 12345',
    passwordHash: DEFAULT_ADMIN_HASH,
    role: 'admin',
    accountStatus: 'active',
    emailVerified: true,
    phoneVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'a0000001-0000-0000-0000-000000000002',
    fullName: 'Sri K. Venkatesham (Bowenpally APMC)',
    email: 'official@bowenpally.mandi.gov.in',
    phone: '+91 98480 23456',
    passwordHash: DEFAULT_OFFICIAL_HASH,
    role: 'official',
    accountStatus: 'active',
    emailVerified: true,
    phoneVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'a0000001-0000-0000-0000-000000000003',
    fullName: 'Smt. Lakshmi Devi (Warangal Yard)',
    email: 'official@warangal.mandi.gov.in',
    phone: '+91 98480 34567',
    passwordHash: DEFAULT_OFFICIAL_HASH,
    role: 'official',
    accountStatus: 'active',
    emailVerified: true,
    phoneVerified: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'a0000001-0000-0000-0000-000000000004',
    fullName: 'Anji Reddy (Rythu Sangham)',
    email: 'farmer@rythumitra.org',
    phone: '+91 98480 45678',
    passwordHash: DEFAULT_FARMER_HASH,
    role: 'farmer',
    accountStatus: 'active',
    emailVerified: true,
    phoneVerified: true,
    createdAt: new Date().toISOString()
  }
];

const INITIAL_OFFICIAL_PROFILES = [
  {
    id: 'b0000001-0000-0000-0000-000000000001',
    userId: 'a0000001-0000-0000-0000-000000000002',
    organizationName: 'Bowenpally APMC Committee',
    officialIdReference: 'TS-APMC-HYD-2024-88',
    assignedMarketIds: ['TS-Bowenpally Market'],
    assignedMarketNames: ['Bowenpally Market'],
    verificationStatus: 'APPROVED',
    reviewedBy: 'a0000001-0000-0000-0000-000000000001',
    reviewedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    verificationNotes: 'Official appointment verified by state directorate.',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'b0000001-0000-0000-0000-000000000002',
    userId: 'a0000001-0000-0000-0000-000000000003',
    organizationName: 'Warangal Agricultural Market Yard',
    officialIdReference: 'TS-APMC-WAR-2025-14',
    assignedMarketIds: ['TS-Warangal Market'],
    assignedMarketNames: ['Warangal Market'],
    verificationStatus: 'PENDING_VERIFICATION',
    reviewedBy: null,
    reviewedAt: null,
    verificationNotes: 'Awaiting administrative identity check.',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_COMMODITIES = [
  { id: 'com-01', commodityName: 'Tomato', variety: 'Hybrid / Local', grade: 'Grade A', canonicalUnit: '₹/Quintal', active: true },
  { id: 'com-02', commodityName: 'Onion', variety: 'Nashik / Local', grade: 'Grade A', canonicalUnit: '₹/Quintal', active: true },
  { id: 'com-03', commodityName: 'Chilli Green', variety: 'G4 Hot', grade: 'Grade A', canonicalUnit: '₹/Quintal', active: true },
  { id: 'com-04', commodityName: 'Cotton', variety: 'Medium Staple', grade: 'FAQ', canonicalUnit: '₹/Quintal', active: true },
  { id: 'com-05', commodityName: 'Paddy', variety: 'BPT 5204 (Sona Masoori)', grade: 'Grade A', canonicalUnit: '₹/Quintal', active: true },
  { id: 'com-06', commodityName: 'Turmeric', variety: 'Finger Yellow', grade: 'Standard', canonicalUnit: '₹/Quintal', active: true },
  { id: 'com-07', commodityName: 'Bengal Gram', variety: 'Desi', grade: 'Grade A', canonicalUnit: '₹/Quintal', active: true },
  { id: 'com-08', commodityName: 'Maize', variety: 'Yellow', grade: 'FAQ', canonicalUnit: '₹/Quintal', active: true }
];

const TODAY_DATE = new Date().toISOString().split('T')[0];
const YESTERDAY_DATE = new Date(Date.now() - 86400000).toISOString().split('T')[0];

const INITIAL_PRICES = [
  {
    id: 'prc-001',
    marketId: 'TS-Bowenpally Market',
    marketName: 'Bowenpally Market',
    district: 'Hyderabad',
    state: 'Telangana',
    commodityName: 'Tomato',
    variety: 'Hybrid',
    grade: 'Grade A',
    reportingDate: TODAY_DATE,
    minPrice: 2200,
    maxPrice: 2800,
    modalPrice: 2600,
    unit: '₹/Quintal',
    arrivalQuantity: 180,
    sourceType: 'VERIFIED_MARKET_SUBMISSION',
    sourceReference: 'APMC Official Daily Ledger #102',
    remarks: 'High morning arrivals from Shamshabad & Medchal belt. Stable demand.',
    submittedBy: 'a0000001-0000-0000-0000-000000000002',
    submittedByName: 'Sri K. Venkatesham',
    approvedBy: 'a0000001-0000-0000-0000-000000000001',
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prc-002',
    marketId: 'TS-Bowenpally Market',
    marketName: 'Bowenpally Market',
    district: 'Hyderabad',
    state: 'Telangana',
    commodityName: 'Onion',
    variety: 'Local Medium',
    grade: 'Grade A',
    reportingDate: TODAY_DATE,
    minPrice: 1900,
    maxPrice: 2400,
    modalPrice: 2200,
    unit: '₹/Quintal',
    arrivalQuantity: 240,
    sourceType: 'VERIFIED_MARKET_SUBMISSION',
    sourceReference: 'APMC Official Daily Ledger #103',
    remarks: 'Consistent arrivals, modal price holding steady.',
    submittedBy: 'a0000001-0000-0000-0000-000000000002',
    submittedByName: 'Sri K. Venkatesham',
    approvedBy: 'a0000001-0000-0000-0000-000000000001',
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prc-003',
    marketId: 'TS-Bowenpally Market',
    marketName: 'Bowenpally Market',
    district: 'Hyderabad',
    state: 'Telangana',
    commodityName: 'Chilli Green',
    variety: 'Teja / G4',
    grade: 'Grade A',
    reportingDate: TODAY_DATE,
    minPrice: 3800,
    maxPrice: 4600,
    modalPrice: 4200,
    unit: '₹/Quintal',
    arrivalQuantity: 95,
    sourceType: 'VERIFIED_MARKET_SUBMISSION',
    sourceReference: 'APMC Daily Auction Sheet #89',
    remarks: 'Premium export-grade lots cleared fast.',
    submittedBy: 'a0000001-0000-0000-0000-000000000002',
    submittedByName: 'Sri K. Venkatesham',
    approvedBy: 'a0000001-0000-0000-0000-000000000001',
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prc-004',
    marketId: 'TS-Warangal Market',
    marketName: 'Warangal Market',
    district: 'Warangal',
    state: 'Telangana',
    commodityName: 'Cotton',
    variety: 'Medium Staple',
    grade: 'FAQ',
    reportingDate: TODAY_DATE,
    minPrice: 6800,
    maxPrice: 7500,
    modalPrice: 7200,
    unit: '₹/Quintal',
    arrivalQuantity: 410,
    sourceType: 'VERIFIED_MARKET_SUBMISSION',
    sourceReference: 'Cotton Yard Board',
    remarks: 'Awaiting administrative verification review.',
    submittedBy: 'a0000001-0000-0000-0000-000000000003',
    submittedByName: 'Smt. Lakshmi Devi',
    approvedBy: null,
    status: 'PENDING_REVIEW',
    publishedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_AUDIT_LOGS = [
  {
    id: 'aud-001',
    priceRecordId: 'prc-001',
    actorUserId: 'a0000001-0000-0000-0000-000000000001',
    actorName: 'Dr. Rameshwar Rao (APMC Director)',
    action: 'APPROVE_AND_PUBLISH',
    previousValues: { status: 'PENDING_REVIEW' },
    newValues: { status: 'PUBLISHED', modalPrice: 2600 },
    reason: 'Verified against official APMC Bowenpally daily arrival register.',
    createdAt: new Date().toISOString()
  }
];

const INITIAL_REVIEW_LOGS = [
  {
    id: 'rev-001',
    submissionId: 'prc-001',
    reviewerId: 'a0000001-0000-0000-0000-000000000001',
    reviewerName: 'Dr. Rameshwar Rao (APMC Director)',
    action: 'APPROVE',
    comments: 'Verified against Bowenpally APMC daily arrival register. Authorized for publication.',
    previousStatus: 'PENDING_REVIEW',
    newStatus: 'PUBLISHED',
    createdAt: new Date().toISOString()
  }
];

// In-Memory store keeping state synchronized
class LocalDataStore {
  constructor() {
    this.users = [...INITIAL_USERS];
    this.officialProfiles = [...INITIAL_OFFICIAL_PROFILES];
    this.commodities = [...INITIAL_COMMODITIES];
    this.prices = [...INITIAL_PRICES];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.reviewLogs = [...INITIAL_REVIEW_LOGS];
  }

  // USERS
  findUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  findUserById(id) {
    return this.users.find(u => u.id === id) || null;
  }

  createUser(userData) {
    const user = {
      id: userData.id || randomUUID(),
      emailVerified: false,
      phoneVerified: false,
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      ...userData
    };
    this.users.push(user);
    return user;
  }

  // OFFICIAL PROFILES
  getOfficialProfileByUserId(userId) {
    return this.officialProfiles.find(p => p.userId === userId) || null;
  }

  getOfficialProfileById(id) {
    return this.officialProfiles.find(p => p.id === id) || null;
  }

  createOfficialProfile(profileData) {
    const profile = {
      id: profileData.id || randomUUID(),
      verificationStatus: 'PENDING_VERIFICATION',
      assignedMarketIds: [],
      assignedMarketNames: [],
      createdAt: new Date().toISOString(),
      ...profileData
    };
    this.officialProfiles.push(profile);
    return profile;
  }

  updateOfficialProfile(profileId, updates) {
    const index = this.officialProfiles.findIndex(p => p.id === profileId);
    if (index === -1) return null;
    this.officialProfiles[index] = {
      ...this.officialProfiles[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.officialProfiles[index];
  }

  listOfficialProfiles({ status } = {}) {
    let result = [...this.officialProfiles];
    if (status && status !== 'ALL') {
      result = result.filter(p => p.verificationStatus === status);
    }
    return result.map(p => {
      const user = this.findUserById(p.userId);
      return {
        ...p,
        user: user ? { id: user.id, fullName: user.fullName, email: user.email, phone: user.phone, role: user.role } : null
      };
    });
  }

  // COMMODITIES
  getCommodities() {
    return this.commodities.filter(c => c.active !== false);
  }

  getAllCommodities() {
    return [...this.commodities];
  }

  createCommodity(data) {
    const item = {
      id: data.id || randomUUID(),
      active: true,
      createdAt: new Date().toISOString(),
      ...data
    };
    this.commodities.push(item);
    return item;
  }

  toggleCommodity(id, active) {
    const item = this.commodities.find(c => c.id === id);
    if (item) item.active = active;
    return item;
  }

  // PRICES
  createPriceSubmission(data) {
    const record = {
      id: data.id || randomUUID(),
      unit: '₹/Quintal',
      sourceType: 'VERIFIED_MARKET_SUBMISSION',
      status: 'PENDING_REVIEW',
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    this.prices.unshift(record);
    return record;
  }

  getPriceSubmissionById(id) {
    return this.prices.find(p => p.id === id) || null;
  }

  updatePriceSubmission(id, updates) {
    const index = this.prices.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.prices[index] = {
      ...this.prices[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.prices[index];
  }

  listPriceSubmissions({ status, marketId, commodityName, submittedBy, reportingDate } = {}) {
    let list = [...this.prices];
    if (status && status !== 'ALL') list = list.filter(p => p.status === status);
    if (marketId) list = list.filter(p => p.marketId === marketId);
    if (commodityName) list = list.filter(p => p.commodityName.toLowerCase() === commodityName.toLowerCase());
    if (submittedBy) list = list.filter(p => p.submittedBy === submittedBy);
    if (reportingDate) list = list.filter(p => p.reportingDate === reportingDate);
    return list;
  }

  getPublishedPrices({ marketId, commodityName, district, state, reportingDate } = {}) {
    let list = this.prices.filter(p => p.status === 'PUBLISHED');
    if (marketId) list = list.filter(p => p.marketId === marketId);
    if (commodityName) list = list.filter(p => p.commodityName.toLowerCase() === commodityName.toLowerCase());
    if (district) list = list.filter(p => p.district.toLowerCase() === district.toLowerCase());
    if (state) list = list.filter(p => p.state.toLowerCase() === state.toLowerCase());
    if (reportingDate) list = list.filter(p => p.reportingDate === reportingDate);
    return list;
  }

  getLatestPublishedPricesByCrop(crop) {
    if (!crop) return [];
    const published = this.prices.filter(
      p => p.status === 'PUBLISHED' && p.commodityName.toLowerCase() === crop.toLowerCase()
    );
    // Sort latest reporting date first
    published.sort((a, b) => new Date(b.reportingDate) - new Date(a.reportingDate));
    return published;
  }

  // AUDIT & REVIEW
  createPriceAuditLog(entry) {
    const log = {
      id: entry.id || randomUUID(),
      createdAt: new Date().toISOString(),
      ...entry
    };
    this.auditLogs.unshift(log);
    return log;
  }

  createReviewLog(entry) {
    const log = {
      id: entry.id || randomUUID(),
      createdAt: new Date().toISOString(),
      ...entry
    };
    this.reviewLogs.unshift(log);
    return log;
  }

  listAuditLogs({ limit = 50 } = {}) {
    return this.auditLogs.slice(0, limit);
  }

  getAdminDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const pendingOfficials = this.officialProfiles.filter(p => p.verificationStatus === 'PENDING_VERIFICATION').length;
    const pendingPrices = this.prices.filter(p => p.status === 'PENDING_REVIEW').length;
    const publishedToday = this.prices.filter(p => p.status === 'PUBLISHED' && p.reportingDate === today).length;
    const distinctMarketsToday = new Set(
      this.prices.filter(p => p.status === 'PUBLISHED' && p.reportingDate === today).map(p => p.marketId)
    ).size;
    const rejectedOrCorrection = this.prices.filter(p => p.status === 'REJECTED' || p.status === 'NEEDS_CORRECTION').length;

    return {
      pendingOfficials,
      pendingPrices,
      publishedToday,
      distinctMarketsToday,
      rejectedOrCorrection,
      totalSubmissions: this.prices.length,
      activeOfficials: this.officialProfiles.filter(p => p.verificationStatus === 'APPROVED').length
    };
  }
}

export const localStore = new LocalDataStore();

// Exported unified store with Supabase sync where available
export const db = {
  async findUserByEmail(email) {
    if (supabaseEnabled) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
        if (!error && data) {
          return {
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            passwordHash: data.password_hash,
            role: data.role,
            accountStatus: data.account_status,
            emailVerified: data.email_verified,
            phoneVerified: data.phone_verified,
            createdAt: data.created_at
          };
        }
      } catch (err) {
        // fallback
      }
    }
    return localStore.findUserByEmail(email);
  },

  async findUserById(id) {
    if (supabaseEnabled) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (!error && data) {
          return {
            id: data.id,
            fullName: data.full_name,
            email: data.email,
            phone: data.phone,
            passwordHash: data.password_hash,
            role: data.role,
            accountStatus: data.account_status,
            emailVerified: data.email_verified,
            phoneVerified: data.phone_verified,
            createdAt: data.created_at
          };
        }
      } catch (err) {
        // fallback
      }
    }
    return localStore.findUserById(id);
  },

  async createUser(userData) {
    const userId = userData.id || randomUUID();
    if (supabaseEnabled) {
      try {
        const { data: inserted, error } = await supabase
          .from('users')
          .insert({
            id: userId,
            full_name: userData.fullName,
            email: userData.email.toLowerCase().trim(),
            phone: userData.phone || '',
            password_hash: userData.passwordHash,
            role: userData.role || 'farmer',
            account_status: userData.accountStatus || 'active',
            email_verified: Boolean(userData.emailVerified),
            phone_verified: Boolean(userData.phoneVerified)
          })
          .select('*')
          .single();

        if (!error && inserted) {
          const user = {
            id: inserted.id,
            fullName: inserted.full_name,
            email: inserted.email,
            phone: inserted.phone,
            passwordHash: inserted.password_hash,
            role: inserted.role,
            accountStatus: inserted.account_status,
            emailVerified: inserted.email_verified,
            phoneVerified: inserted.phone_verified,
            createdAt: inserted.created_at
          };
          localStore.users.push(user);
          return user;
        } else if (error) {
          console.error('Supabase createUser error:', error.message || error);
        }
      } catch (err) {
        console.error('Supabase createUser exception:', err.message || err);
      }
    }
    return localStore.createUser({ ...userData, id: userId });
  },

  async getOfficialProfileByUserId(userId) {
    if (supabaseEnabled) {
      try {
        const { data, error } = await supabase.from('official_profiles').select('*').eq('user_id', userId).single();
        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            organizationName: data.organization_name,
            officialIdReference: data.official_id_reference,
            assignedMarketIds: data.assigned_market_ids || [],
            verificationStatus: data.verification_status,
            reviewedBy: data.reviewed_by,
            reviewedAt: data.reviewed_at,
            verificationNotes: data.verification_notes,
            createdAt: data.created_at
          };
        }
      } catch (err) {
        // fallback
      }
    }
    return localStore.getOfficialProfileByUserId(userId);
  },

  async getOfficialProfileById(id) {
    if (supabaseEnabled) {
      try {
        const { data, error } = await supabase.from('official_profiles').select('*').eq('id', id).single();
        if (!error && data) {
          return {
            id: data.id,
            userId: data.user_id,
            organizationName: data.organization_name,
            officialIdReference: data.official_id_reference,
            assignedMarketIds: data.assigned_market_ids || [],
            assignedMarketNames: data.assigned_market_ids || [],
            verificationStatus: data.verification_status,
            reviewedBy: data.reviewed_by,
            reviewedAt: data.reviewed_at,
            verificationNotes: data.verification_notes,
            createdAt: data.created_at
          };
        }
      } catch (err) {
        // fallback
      }
    }
    return localStore.getOfficialProfileById(id);
  },

  async createOfficialProfile(profileData) {
    const profileId = profileData.id || randomUUID();
    if (supabaseEnabled) {
      try {
        const { data: inserted, error } = await supabase
          .from('official_profiles')
          .insert({
            id: profileId,
            user_id: profileData.userId,
            organization_name: profileData.organizationName || 'APMC Committee',
            official_id_reference: profileData.officialIdReference || `APMC-${Date.now().toString().slice(-4)}`,
            assigned_market_ids: profileData.assignedMarketIds || [],
            verification_status: profileData.verificationStatus || 'PENDING_VERIFICATION',
            verification_notes: profileData.verificationNotes || 'Pending administrative verification review.'
          })
          .select('*')
          .single();

        if (!error && inserted) {
          const profile = {
            id: inserted.id,
            userId: inserted.user_id,
            organizationName: inserted.organization_name,
            officialIdReference: inserted.official_id_reference,
            assignedMarketIds: inserted.assigned_market_ids || [],
            assignedMarketNames: profileData.assignedMarketNames || [],
            verificationStatus: inserted.verification_status,
            reviewedBy: inserted.reviewed_by,
            reviewedAt: inserted.reviewed_at,
            verificationNotes: inserted.verification_notes,
            createdAt: inserted.created_at
          };
          localStore.officialProfiles.push(profile);
          return profile;
        } else if (error) {
          console.error('Supabase createOfficialProfile error:', error.message || error);
        }
      } catch (err) {
        console.error('Supabase createOfficialProfile exception:', err.message || err);
      }
    }
    return localStore.createOfficialProfile({ ...profileData, id: profileId });
  },

  async updateOfficialProfile(profileId, updates) {
    const updated = localStore.updateOfficialProfile(profileId, updates);
    if (supabaseEnabled) {
      try {
        const dbUpdates = {};
        if (updates.verificationStatus) dbUpdates.verification_status = updates.verificationStatus;
        if (updates.assignedMarketIds || updates.assignedMarkets) {
          dbUpdates.assigned_market_ids = updates.assignedMarketIds || updates.assignedMarkets;
        }
        if (updates.reviewedBy) dbUpdates.reviewed_by = updates.reviewedBy;
        if (updates.reviewedAt) dbUpdates.reviewed_at = updates.reviewedAt;
        if (updates.verificationNotes || updates.notes) {
          dbUpdates.verification_notes = updates.verificationNotes || updates.notes;
        }
        await supabase.from('official_profiles').update(dbUpdates).eq('id', profileId);
      } catch (err) {
        console.error('Supabase updateOfficialProfile error:', err);
      }
    }
    return updated;
  },

  async listOfficialProfiles(filter = {}) {
    if (supabaseEnabled) {
      try {
        let query = supabase
          .from('official_profiles')
          .select(`
            *,
            users:user_id (
              id, full_name, email, phone, role, account_status
            )
          `)
          .order('created_at', { ascending: false });

        if (filter.status && filter.status !== 'ALL') {
          query = query.eq('verification_status', filter.status);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(p => ({
            id: p.id,
            userId: p.user_id,
            organizationName: p.organization_name,
            officialIdReference: p.official_id_reference,
            assignedMarketIds: p.assigned_market_ids || [],
            assignedMarketNames: p.assigned_market_ids || [],
            verificationStatus: p.verification_status,
            reviewedBy: p.reviewed_by,
            reviewedAt: p.reviewed_at,
            verificationNotes: p.verification_notes,
            createdAt: p.created_at,
            user: p.users ? {
              id: p.users.id,
              fullName: p.users.full_name,
              email: p.users.email,
              phone: p.users.phone,
              role: p.users.role
            } : null
          }));
        }
      } catch (err) {
        console.warn('Supabase listOfficialProfiles error:', err.message);
      }
    }
    return localStore.listOfficialProfiles(filter);
  },

  async getCommodities() {
    if (supabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from('commodities')
          .select('*')
          .eq('active', true)
          .order('commodity_name');
        if (!error && data && data.length > 0) {
          return data.map(c => ({
            id: c.id,
            commodityName: c.commodity_name,
            variety: c.variety,
            grade: c.grade,
            canonicalUnit: c.canonical_unit,
            active: c.active
          }));
        }
      } catch (err) {
        console.warn('Supabase getCommodities error:', err.message);
      }
    }
    return localStore.getCommodities();
  },

  async getAllCommodities() {
    if (supabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from('commodities')
          .select('*')
          .order('commodity_name');
        if (!error && data && data.length > 0) {
          return data.map(c => ({
            id: c.id,
            commodityName: c.commodity_name,
            variety: c.variety,
            grade: c.grade,
            canonicalUnit: c.canonical_unit,
            active: c.active
          }));
        }
      } catch (err) {
        console.warn('Supabase getAllCommodities error:', err.message);
      }
    }
    return localStore.getAllCommodities();
  },

  async createCommodity(data) {
    if (supabaseEnabled) {
      try {
        const { data: created, error } = await supabase
          .from('commodities')
          .insert({
            commodity_name: data.commodityName,
            variety: data.variety || 'Common',
            grade: data.grade || 'Grade A',
            canonical_unit: data.canonicalUnit || '₹/Quintal',
            active: true
          })
          .select('*')
          .single();
        if (!error && created) {
          return {
            id: created.id,
            commodityName: created.commodity_name,
            variety: created.variety,
            grade: created.grade,
            canonicalUnit: created.canonical_unit,
            active: created.active
          };
        }
      } catch (err) {
        console.warn('Supabase createCommodity error:', err.message);
      }
    }
    return localStore.createCommodity(data);
  },

  async toggleCommodity(id, active) {
    if (supabaseEnabled) {
      try {
        const { data: updated, error } = await supabase
          .from('commodities')
          .update({ active })
          .eq('id', id)
          .select('*')
          .single();
        if (!error && updated) {
          return {
            id: updated.id,
            commodityName: updated.commodity_name,
            variety: updated.variety,
            grade: updated.grade,
            canonicalUnit: updated.canonical_unit,
            active: updated.active
          };
        }
      } catch (err) {
        console.warn('Supabase toggleCommodity error:', err.message);
      }
    }
    return localStore.toggleCommodity(id, active);
  },

  async createPriceSubmission(data) {
    const submission = localStore.createPriceSubmission(data);
    if (supabaseEnabled) {
      try {
        const { data: inserted, error } = await supabase.from('commodity_prices').insert({
          market_id: submission.marketId,
          market_name: submission.marketName,
          district: submission.district,
          state: submission.state || 'Telangana',
          commodity_name: submission.commodityName,
          variety: submission.variety || 'Common',
          grade: submission.grade || 'Grade A',
          reporting_date: submission.reportingDate,
          min_price: submission.minPrice,
          max_price: submission.maxPrice,
          modal_price: submission.modalPrice,
          unit: submission.unit || '₹/Quintal',
          arrival_quantity: submission.arrivalQuantity || 0,
          source_type: submission.sourceType || 'VERIFIED_MARKET_SUBMISSION',
          source_reference: submission.sourceReference || null,
          remarks: submission.remarks || null,
          submitted_by: submission.submittedBy,
          submitted_by_name: submission.submittedByName,
          status: submission.status || 'PENDING_REVIEW'
        }).select('*').single();

        if (!error && inserted) {
          return {
            id: inserted.id,
            marketId: inserted.market_id,
            marketName: inserted.market_name,
            district: inserted.district,
            state: inserted.state,
            commodityName: inserted.commodity_name,
            variety: inserted.variety,
            grade: inserted.grade,
            reportingDate: inserted.reporting_date,
            minPrice: Number(inserted.min_price),
            maxPrice: Number(inserted.max_price),
            modalPrice: Number(inserted.modal_price),
            unit: inserted.unit,
            arrivalQuantity: Number(inserted.arrival_quantity),
            sourceType: inserted.source_type,
            sourceReference: inserted.source_reference,
            remarks: inserted.remarks,
            submittedBy: inserted.submitted_by,
            submittedByName: inserted.submitted_by_name,
            status: inserted.status,
            publishedAt: inserted.published_at,
            createdAt: inserted.created_at,
            updatedAt: inserted.updated_at
          };
        }
      } catch (err) {
        console.error('Supabase createPriceSubmission error:', err);
      }
    }
    return submission;
  },

  async getPriceSubmissionById(id) {
    if (supabaseEnabled) {
      try {
        const { data, error } = await supabase
          .from('commodity_prices')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (!error && data) {
          return {
            id: data.id,
            marketId: data.market_id,
            marketName: data.market_name,
            district: data.district,
            state: data.state,
            commodityName: data.commodity_name,
            variety: data.variety,
            grade: data.grade,
            reportingDate: data.reporting_date,
            minPrice: Number(data.min_price),
            maxPrice: Number(data.max_price),
            modalPrice: Number(data.modal_price),
            unit: data.unit,
            arrivalQuantity: Number(data.arrival_quantity),
            sourceType: data.source_type,
            sourceReference: data.source_reference,
            remarks: data.remarks,
            submittedBy: data.submitted_by,
            submittedByName: data.submitted_by_name,
            approvedBy: data.approved_by,
            status: data.status,
            publishedAt: data.published_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
        }
      } catch (err) {
        console.warn('Supabase getPriceSubmissionById error:', err.message);
      }
    }
    return localStore.getPriceSubmissionById(id);
  },

  async updatePriceSubmission(id, updates) {
    const updated = localStore.updatePriceSubmission(id, updates);
    if (supabaseEnabled) {
      try {
        const dbUpdates = {};
        if (updates.status) dbUpdates.status = updates.status;
        if (updates.minPrice !== undefined) dbUpdates.min_price = updates.minPrice;
        if (updates.maxPrice !== undefined) dbUpdates.max_price = updates.maxPrice;
        if (updates.modalPrice !== undefined) dbUpdates.modal_price = updates.modalPrice;
        if (updates.arrivalQuantity !== undefined) dbUpdates.arrival_quantity = updates.arrivalQuantity;
        if (updates.remarks !== undefined) dbUpdates.remarks = updates.remarks;
        if (updates.approvedBy !== undefined) dbUpdates.approved_by = updates.approvedBy;
        if (updates.publishedAt !== undefined) dbUpdates.published_at = updates.publishedAt;
        await supabase.from('commodity_prices').update(dbUpdates).eq('id', id);
      } catch (err) {
        console.error('Supabase updatePriceSubmission error:', err);
      }
    }
    return updated;
  },

  async listPriceSubmissions(filter = {}) {
    if (supabaseEnabled) {
      try {
        let query = supabase
          .from('commodity_prices')
          .select('*')
          .order('created_at', { ascending: false });

        if (filter.status && filter.status !== 'ALL') {
          query = query.eq('status', filter.status);
        }
        if (filter.marketId) {
          query = query.eq('market_id', filter.marketId);
        }
        if (filter.commodityName || filter.commodity) {
          query = query.ilike('commodity_name', filter.commodityName || filter.commodity);
        }
        if (filter.submittedBy) {
          query = query.eq('submitted_by', filter.submittedBy);
        }
        if (filter.reportingDate) {
          query = query.eq('reporting_date', filter.reportingDate);
        }
        if (filter.startDate) {
          query = query.gte('reporting_date', filter.startDate);
        }
        if (filter.endDate) {
          query = query.lte('reporting_date', filter.endDate);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(p => ({
            id: p.id,
            marketId: p.market_id,
            marketName: p.market_name,
            district: p.district,
            state: p.state,
            commodityName: p.commodity_name,
            variety: p.variety,
            grade: p.grade,
            reportingDate: p.reporting_date,
            minPrice: Number(p.min_price),
            maxPrice: Number(p.max_price),
            modalPrice: Number(p.modal_price),
            unit: p.unit,
            arrivalQuantity: Number(p.arrival_quantity),
            sourceType: p.source_type,
            sourceReference: p.source_reference,
            remarks: p.remarks,
            submittedBy: p.submitted_by,
            submittedByName: p.submitted_by_name,
            approvedBy: p.approved_by,
            status: p.status,
            publishedAt: p.published_at,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          }));
        }
      } catch (err) {
        console.warn('Supabase listPriceSubmissions error:', err.message);
      }
    }
    return localStore.listPriceSubmissions(filter);
  },

  async getPublishedPrices(filter = {}) {
    if (supabaseEnabled) {
      try {
        let query = supabase
          .from('commodity_prices')
          .select('*')
          .eq('status', 'PUBLISHED')
          .order('reporting_date', { ascending: false });

        if (filter.commodityName || filter.commodity) {
          query = query.ilike('commodity_name', filter.commodityName || filter.commodity);
        }
        if (filter.marketId) {
          query = query.eq('market_id', filter.marketId);
        }
        if (filter.district) {
          query = query.ilike('district', filter.district);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(p => ({
            id: p.id,
            marketId: p.market_id,
            marketName: p.market_name,
            district: p.district,
            state: p.state,
            commodityName: p.commodity_name,
            variety: p.variety,
            grade: p.grade,
            reportingDate: p.reporting_date,
            minPrice: Number(p.min_price),
            maxPrice: Number(p.max_price),
            modalPrice: Number(p.modal_price),
            unit: p.unit,
            arrivalQuantity: Number(p.arrival_quantity),
            sourceType: p.source_type,
            sourceReference: p.source_reference,
            remarks: p.remarks,
            submittedBy: p.submitted_by,
            submittedByName: p.submitted_by_name,
            approvedBy: p.approved_by,
            status: p.status,
            publishedAt: p.published_at,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          }));
        }
      } catch (err) {
        console.warn('Supabase getPublishedPrices error:', err.message);
      }
    }
    return localStore.getPublishedPrices(filter);
  },

  async getLatestPublishedPricesByCrop(crop) {
    if (supabaseEnabled) {
      try {
        let query = supabase
          .from('commodity_prices')
          .select('*')
          .eq('status', 'PUBLISHED')
          .order('reporting_date', { ascending: false });

        if (crop) {
          query = query.ilike('commodity_name', crop);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const byMarket = new Map();
          for (const item of data) {
            if (!byMarket.has(item.market_id)) {
              byMarket.set(item.market_id, {
                id: item.id,
                marketId: item.market_id,
                marketName: item.market_name,
                district: item.district,
                state: item.state,
                commodityName: item.commodity_name,
                variety: item.variety,
                grade: item.grade,
                reportingDate: item.reporting_date,
                minPrice: Number(item.min_price),
                maxPrice: Number(item.max_price),
                modalPrice: Number(item.modal_price),
                unit: item.unit,
                arrivalQuantity: Number(item.arrival_quantity),
                sourceType: item.source_type,
                sourceReference: item.source_reference,
                remarks: item.remarks,
                status: item.status,
                publishedAt: item.published_at
              });
            }
          }
          return Array.from(byMarket.values());
        }
      } catch (err) {
        console.warn('Supabase getLatestPublishedPricesByCrop error:', err.message);
      }
    }
    return localStore.getLatestPublishedPricesByCrop(crop);
  },

  async createPriceAuditLog(entry) {
    const local = localStore.createPriceAuditLog(entry);
    if (supabaseEnabled) {
      try {
        await supabase.from('price_audit_logs').insert({
          id: local.id,
          price_record_id: local.priceRecordId,
          actor_user_id: local.actorUserId,
          actor_name: local.actorName,
          action: local.action,
          previous_values: local.previousValues,
          new_values: local.newValues,
          reason: local.reason
        });
      } catch (err) {
        console.warn('Supabase createPriceAuditLog error:', err.message);
      }
    }
    return local;
  },

  async createReviewLog(entry) {
    const local = localStore.createReviewLog(entry);
    if (supabaseEnabled) {
      try {
        await supabase.from('review_logs').insert({
          id: local.id,
          submission_id: local.submissionId,
          reviewer_id: local.reviewerId,
          reviewer_name: local.reviewerName,
          action: local.action,
          comments: local.comments,
          previous_status: local.previousStatus,
          new_status: local.newStatus
        });
      } catch (err) {
        console.warn('Supabase createReviewLog error:', err.message);
      }
    }
    return local;
  },

  async listAuditLogs(options = {}) {
    if (supabaseEnabled) {
      try {
        let query = supabase
          .from('price_audit_logs')
          .select('*')
          .order('created_at', { ascending: false });

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;
        if (!error && data) {
          return data.map(a => ({
            id: a.id,
            priceRecordId: a.price_record_id,
            actorUserId: a.actor_user_id,
            actorName: a.actor_name,
            action: a.action,
            previousValues: a.previous_values,
            newValues: a.new_values,
            reason: a.reason,
            createdAt: a.created_at
          }));
        }
      } catch (err) {
        console.warn('Supabase listAuditLogs error:', err.message);
      }
    }
    return localStore.listAuditLogs(options);
  },

  async getAdminDashboardStats() {
    if (supabaseEnabled) {
      try {
        const [pricesRes, officialsRes, marketsRes] = await Promise.all([
          supabase.from('commodity_prices').select('status', { count: 'exact' }),
          supabase.from('official_profiles').select('verification_status', { count: 'exact' }),
          supabase.from('markets').select('id', { count: 'exact' })
        ]);

        const prices = pricesRes.data || [];
        const officials = officialsRes.data || [];

        const pendingSubmissions = prices.filter(p => p.status === 'PENDING_REVIEW').length;
        const publishedToday = prices.filter(p => p.status === 'PUBLISHED').length;
        const pendingOfficials = officials.filter(o => o.verification_status === 'PENDING_VERIFICATION').length;
        const verifiedOfficials = officials.filter(o => o.verification_status === 'APPROVED').length;
        const totalMarkets = marketsRes.count || 7;

        return {
          pendingOfficials,
          pendingPrices: pendingSubmissions,
          pendingSubmissions,
          publishedToday,
          verifiedOfficials,
          activeOfficials: verifiedOfficials,
          totalMarkets,
          distinctMarketsToday: publishedToday,
          rejectedOrCorrection: 0,
          totalSubmissions: prices.length,
          activeAlerts: (pendingSubmissions > 0 || pendingOfficials > 0) ? 1 : 0
        };
      } catch (err) {
        console.warn('Supabase getAdminDashboardStats error:', err.message);
      }
    }
    return localStore.getAdminDashboardStats();
  }
};
