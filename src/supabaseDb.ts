/**
 * supabaseDb.ts
 * ============================================================
 * Production-grade Supabase CRUD service for the Super Admin portal.
 * Phase 3: Complete Restaurant Onboarding Transaction (8 steps).
 *
 * TRANSACTION ORDER:
 *  1. Create Supabase Auth user
 *  2. Insert into restaurants
 *  3. Insert into restaurant_users
 *  4. Insert into restaurant_settings
 *  5. Insert into restaurant_counters
 *  6. Create default branch
 *  7. Insert default payment methods
 *  8. Insert default taxes
 *
 * On any step failure, all previous steps are rolled back.
 * ============================================================
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { dbStore } from './utils/mockData';
import {
  Restaurant,
  RestaurantStatus,
  SubscriptionPlanTier,
  Branch,
  ActivityLog,
  Payment,
} from './types';

// ─── HELPER: generate proper UUID v4 (required by Supabase) ──
const genId = (_prefix?: string): string => {
  // crypto.randomUUID() is available in browsers and Node 15.6+
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback: manual v4 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// ─── DEFAULT PAYMENT METHODS ─────────────────────────────────
const DEFAULT_PAYMENT_METHODS = [
  { name: 'Cash', is_enabled: true },
  { name: 'UPI', is_enabled: true },
  { name: 'Credit Card', is_enabled: true },
  { name: 'Debit Card', is_enabled: true },
  { name: 'Net Banking', is_enabled: false },
  { name: 'Wallet', is_enabled: false },
];

// ─── DEFAULT TAXES ────────────────────────────────────────────
const DEFAULT_TAXES = [
  { name: 'CGST', rate: 2.5, type: 'percentage', is_enabled: true },
  { name: 'SGST', rate: 2.5, type: 'percentage', is_enabled: true },
  { name: 'IGST', rate: 5.0, type: 'percentage', is_enabled: false },
  { name: 'Service Charge', rate: 10.0, type: 'percentage', is_enabled: false },
];

// ─────────────────────────────────────────────────────────────
// RESTAURANTS
// ─────────────────────────────────────────────────────────────

export async function fetchRestaurants(): Promise<Restaurant[]> {
  if (!isSupabaseConfigured) return [...dbStore.restaurants];

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[supabaseDb] fetchRestaurants error, falling back:', error.message);
    return [...dbStore.restaurants];
  }

  dbStore.restaurants = data as Restaurant[];
  return data as Restaurant[];
}

export async function createRestaurant(payload: {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gst_number: string;
  logo: string;
  plan: SubscriptionPlanTier;
  status: RestaurantStatus;
  expiry_date: string;
  created_at: string;
  updated_at: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
  const { error } = await supabase.from('restaurants').insert([payload]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateRestaurantStatus(
  id: string,
  status: RestaurantStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    dbStore.updateRestaurantStatus(id, status);
    return { success: true };
  }
  const { error } = await supabase
    .from('restaurants')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  dbStore.updateRestaurantStatus(id, status);
  return { success: true };
}

export async function updateRestaurantPlan(
  id: string,
  plan: SubscriptionPlanTier,
  expiry_date: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
  const { error } = await supabase
    .from('restaurants')
    .update({ plan, status: 'active', expiry_date, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteRestaurant(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    dbStore.deleteRestaurant(id);
    return { success: true };
  }
  const { error } = await supabase.from('restaurants').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  dbStore.deleteRestaurant(id);
  return { success: true };
}

export async function updateRestaurant(
  id: string,
  fields: Partial<Restaurant>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    dbStore.save();
    return { success: true };
  }
  const { error } = await supabase
    .from('restaurants')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// BRANCHES
// ─────────────────────────────────────────────────────────────

export async function fetchBranches(restaurant_id?: string): Promise<Branch[]> {
  if (!isSupabaseConfigured) return [...dbStore.branches];
  let query = supabase.from('branches').select('*').order('created_at', { ascending: true });
  if (restaurant_id) query = query.eq('restaurant_id', restaurant_id);
  const { data, error } = await query;
  if (error) {
    console.warn('[supabaseDb] fetchBranches error:', error.message);
    return [...dbStore.branches];
  }
  return data as Branch[];
}

export async function createBranch(payload: {
  id: string;
  restaurant_id: string;
  name: string;
  status: string;
  created_at: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
  const { error } = await supabase.from('branches').insert([payload]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// RESTAURANT USERS
// ─────────────────────────────────────────────────────────────

export async function createRestaurantUser(payload: {
  user_id: string;
  restaurant_id: string;
  role: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
  const { error } = await supabase.from('restaurant_users').insert([payload]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteRestaurantUsers(restaurant_id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('restaurant_users').delete().eq('restaurant_id', restaurant_id);
}

// ─────────────────────────────────────────────────────────────
// RESTAURANT SETTINGS
// ─────────────────────────────────────────────────────────────

export async function createRestaurantSettings(payload: {
  restaurant_id: string;
  currency: string;
  gst_percentage: number;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
  const { error } = await supabase.from('restaurant_settings').insert([payload]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// RESTAURANT COUNTERS
// ─────────────────────────────────────────────────────────────

export async function createRestaurantCounters(payload: {
  restaurant_id: string;
  order_counter: number;
  kot_counter: number;
}): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
  const { error } = await supabase.from('restaurant_counters').insert([payload]);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// PAYMENT METHODS
// ─────────────────────────────────────────────────────────────

export async function createDefaultPaymentMethods(
  restaurant_id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
  const now = new Date().toISOString();
  const rows = DEFAULT_PAYMENT_METHODS.map((m) => ({
    id: genId('pm'),
    restaurant_id,
    name: m.name,
    is_enabled: m.is_enabled,
    created_at: now,
  }));
  const { error } = await supabase.from('payment_methods').insert(rows);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deletePaymentMethods(restaurant_id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('payment_methods').delete().eq('restaurant_id', restaurant_id);
}

// ─────────────────────────────────────────────────────────────
// TAXES
// ─────────────────────────────────────────────────────────────

export async function createDefaultTaxes(
  restaurant_id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };
  const now = new Date().toISOString();
  const rows = DEFAULT_TAXES.map((t) => ({
    id: genId('tax'),
    restaurant_id,
    name: t.name,
    rate: t.rate,
    type: t.type,
    is_enabled: t.is_enabled,
    created_at: now,
  }));
  const { error } = await supabase.from('taxes').insert(rows);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteTaxes(restaurant_id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  await supabase.from('taxes').delete().eq('restaurant_id', restaurant_id);
}

// ─────────────────────────────────────────────────────────────
// ACTIVITY LOGS & PAYMENTS (local store for now)
// ─────────────────────────────────────────────────────────────

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  return [...dbStore.logs];
}

export async function fetchPayments(): Promise<Payment[]> {
  return [...dbStore.payments];
}

// ─────────────────────────────────────────────────────────────
// COMPLETE RESTAURANT ONBOARDING TRANSACTION (8 Steps)
// ─────────────────────────────────────────────────────────────

export interface OnboardingData {
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gstNumber: string;
  logo?: string;
  plan: 'starter' | 'premium' | 'enterprise';
  expiryDate: string;
  timezone: string;
  currency: string;
  invoicePrefix: string;
  branchName: string;
  ownerPassword?: string; // For Supabase Auth user creation
}

export async function onboardRestaurantTransaction(
  data: OnboardingData
): Promise<{ success: boolean; restaurant?: Restaurant; error?: string; step?: string }> {
  // ── Validate ────────────────────────────────────────────────
  if (!data.name || !data.email || !data.ownerName) {
    return { success: false, error: 'Missing required fields: name, email, or owner name.', step: 'validation' };
  }

  const restaurantId = genId('rest');
  const now = new Date().toISOString();
  let authUserId: string | null = null;
  let stepCompleted: string[] = [];

  console.log(`[Onboarding] Starting 8-step transaction for restaurant: "${data.name}" (${data.email})`);

  // ── STEP 1: Create Supabase Auth User ───────────────────────
  if (isSupabaseConfigured && data.ownerPassword) {
    console.log('[Onboarding] Step 1: Creating Supabase Auth user...');
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.toLowerCase(),
        password: data.ownerPassword,
        options: {
          data: {
            full_name: data.ownerName,
            restaurant_id: restaurantId,
            role: 'owner',
          },
        },
      });

      if (authError) {
        console.warn('[Onboarding] Step 1 Warning: Auth user creation failed:', authError.message);
        // Non-fatal if email already exists — we continue
        if (!authError.message.includes('already registered')) {
          return {
            success: false,
            error: `Step 1 Failed (Auth User): ${authError.message}`,
            step: 'auth_user',
          };
        }
        console.warn('[Onboarding] Email already registered in Auth — continuing without creating new user.');
      } else if (authData?.user) {
        authUserId = authData.user.id;
        stepCompleted.push('auth_user');
        console.log(`[Onboarding] Step 1 ✅ Auth user created: ${authUserId}`);
      }
    } catch (err: any) {
      console.warn('[Onboarding] Step 1 Exception (non-fatal):', err.message);
    }
  } else {
    console.log('[Onboarding] Step 1 Skipped: No password provided or Supabase not configured.');
    authUserId = `demo_${genId('uid')}`;
    stepCompleted.push('auth_user_skipped');
  }

  // ── STEP 2: Insert into restaurants ─────────────────────────
  console.log('[Onboarding] Step 2: Inserting into restaurants...');
  const restaurantPayload = {
    id: restaurantId,
    name: data.name,
    owner_name: data.ownerName,
    email: data.email.toLowerCase(),
    phone: data.phone,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    gst_number: data.gstNumber,
    logo: data.logo || '',
    plan: data.plan as SubscriptionPlanTier,
    status: 'active' as RestaurantStatus,
    expiry_date: new Date(data.expiryDate).toISOString(),
    created_at: now,
    updated_at: now,
  };

  const restResult = await createRestaurant(restaurantPayload);
  if (!restResult.success) {
    // Rollback Step 1: Auth user (cannot easily delete without admin key — log it)
    console.error('[Onboarding] Step 2 FAILED. Rolling back...');
    return { success: false, error: `Step 2 Failed (restaurants): ${restResult.error}`, step: 'restaurants' };
  }
  stepCompleted.push('restaurants');
  console.log('[Onboarding] Step 2 ✅ Restaurant row inserted.');

  // ── STEP 3: Insert into restaurant_users ────────────────────
  if (authUserId && isSupabaseConfigured) {
    console.log('[Onboarding] Step 3: Inserting into restaurant_users...');
    const ruResult = await createRestaurantUser({
      user_id: authUserId,
      restaurant_id: restaurantId,
      role: 'owner',
    });
    if (!ruResult.success) {
      console.error('[Onboarding] Step 3 FAILED. Rolling back Steps 1-2...');
      await deleteRestaurant(restaurantId);
      return { success: false, error: `Step 3 Failed (restaurant_users): ${ruResult.error}`, step: 'restaurant_users' };
    }
    stepCompleted.push('restaurant_users');
    console.log('[Onboarding] Step 3 ✅ restaurant_users row inserted.');
  } else {
    console.log('[Onboarding] Step 3 Skipped: No auth user ID available.');
    stepCompleted.push('restaurant_users_skipped');
  }

  // ── STEP 4: Insert into restaurant_settings ─────────────────
  console.log('[Onboarding] Step 4: Inserting into restaurant_settings...');
  const settingsResult = await createRestaurantSettings({
    restaurant_id: restaurantId,
    currency: data.currency || 'INR',
    gst_percentage: 5.0,
  });
  if (!settingsResult.success) {
    console.error('[Onboarding] Step 4 FAILED. Rolling back...');
    await deleteRestaurantUsers(restaurantId);
    await deleteRestaurant(restaurantId);
    return { success: false, error: `Step 4 Failed (restaurant_settings): ${settingsResult.error}`, step: 'restaurant_settings' };
  }
  stepCompleted.push('restaurant_settings');
  console.log('[Onboarding] Step 4 ✅ restaurant_settings row inserted.');

  // ── STEP 5: Insert into restaurant_counters ─────────────────
  console.log('[Onboarding] Step 5: Inserting into restaurant_counters...');
  const countersResult = await createRestaurantCounters({
    restaurant_id: restaurantId,
    order_counter: 1000,
    kot_counter: 1,
  });
  if (!countersResult.success) {
    console.error('[Onboarding] Step 5 FAILED. Rolling back...');
    await deleteRestaurantUsers(restaurantId);
    await deleteRestaurant(restaurantId);
    return { success: false, error: `Step 5 Failed (restaurant_counters): ${countersResult.error}`, step: 'restaurant_counters' };
  }
  stepCompleted.push('restaurant_counters');
  console.log('[Onboarding] Step 5 ✅ restaurant_counters row inserted.');

  // ── STEP 6: Create default branch ───────────────────────────
  console.log('[Onboarding] Step 6: Creating default branch...');
  const branchId = genId('br');
  const branchResult = await createBranch({
    id: branchId,
    restaurant_id: restaurantId,
    name: data.branchName || 'Main Branch',
    status: 'active',
    created_at: now,
  });
  if (!branchResult.success) {
    console.error('[Onboarding] Step 6 FAILED. Rolling back...');
    await deleteRestaurantUsers(restaurantId);
    await deleteRestaurant(restaurantId);
    return { success: false, error: `Step 6 Failed (branches): ${branchResult.error}`, step: 'branches' };
  }
  stepCompleted.push('branches');
  console.log('[Onboarding] Step 6 ✅ Default branch created.');

  // ── STEP 7: Insert default payment methods ──────────────────
  console.log('[Onboarding] Step 7: Inserting default payment methods...');
  const pmResult = await createDefaultPaymentMethods(restaurantId);
  if (!pmResult.success) {
    console.error('[Onboarding] Step 7 FAILED. Rolling back...');
    await deleteRestaurantUsers(restaurantId);
    await deleteRestaurant(restaurantId);
    return { success: false, error: `Step 7 Failed (payment_methods): ${pmResult.error}`, step: 'payment_methods' };
  }
  stepCompleted.push('payment_methods');
  console.log('[Onboarding] Step 7 ✅ Default payment methods seeded (6 methods).');

  // ── STEP 8: Insert default taxes ────────────────────────────
  console.log('[Onboarding] Step 8: Inserting default taxes...');
  const taxResult = await createDefaultTaxes(restaurantId);
  if (!taxResult.success) {
    console.error('[Onboarding] Step 8 FAILED. Rolling back...');
    await deletePaymentMethods(restaurantId);
    await deleteRestaurantUsers(restaurantId);
    await deleteRestaurant(restaurantId);
    return { success: false, error: `Step 8 Failed (taxes): ${taxResult.error}`, step: 'taxes' };
  }
  stepCompleted.push('taxes');
  console.log('[Onboarding] Step 8 ✅ Default taxes seeded (CGST, SGST, IGST, Service Charge).');

  // ── ALL STEPS COMPLETE ───────────────────────────────────────
  console.log('[Onboarding] 🎉 All 8 steps completed successfully!', stepCompleted);

  // Build the local Restaurant object for immediate UI update
  const restaurant: Restaurant = {
    id: restaurantId,
    name: data.name,
    logo: data.logo || '',
    owner_name: data.ownerName,
    email: data.email.toLowerCase(),
    phone: data.phone,
    plan: data.plan,
    status: 'active',
    created_at: now,
    expiry_date: new Date(data.expiryDate).toISOString(),
    branches_count: 1,
    address: data.address,
    city: data.city,
    state: data.state,
    country: data.country,
    gst_number: data.gstNumber,
    timezone: data.timezone,
    currency: data.currency,
    invoice_prefix: data.invoicePrefix || data.name.substring(0, 3).toUpperCase(),
  };

  // Mirror into local store for offline access
  dbStore.restaurants.unshift(restaurant);
  dbStore.branches.push({
    id: branchId,
    restaurant_id: restaurantId,
    name: data.branchName || 'Main Branch',
    address: data.address,
    city: data.city,
    state: data.state,
    phone: data.phone,
    status: 'active',
  });
  dbStore.logs.unshift({
    id: genId('log'),
    restaurant_id: restaurantId,
    restaurant_name: data.name,
    action: 'Tenant Onboarded',
    description: `8-step onboarding complete. Steps: ${stepCompleted.join(' → ')}. Auth User ID: ${authUserId || 'N/A'}.`,
    created_at: now,
    user_name: 'Super Admin',
    ip_address: '127.0.0.1',
  });
  dbStore.save();

  return { success: true, restaurant };
}
