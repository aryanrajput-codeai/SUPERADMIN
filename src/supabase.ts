import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

// ─── Hardcoded Super Admin Access List ──────────────────────
// These emails are authorized super admins. In production, use a
// `super_admins` table in Supabase and validate against that.
const AUTHORIZED_SUPER_ADMINS = [
  'aiaryanrajput@gmail.com',
  'admin@webrajya.com',
];

const VALID_PASSWORDS = ['admin123', 'password123', 'superadmin123'];

/**
 * Service class that abstracts real Supabase Auth calls vs offline fallback.
 */
export const supabaseService = {
  // Offline demo fallback
  runOfflineFallback(email: string): { isSuperAdmin: boolean; adminData?: any } {
    const isDemoAdmin = AUTHORIZED_SUPER_ADMINS.includes(email.toLowerCase());
    if (isDemoAdmin) {
      return {
        isSuperAdmin: true,
        adminData: {
          id: 'sa_01',
          email: email,
          full_name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80',
        },
      };
    }
    return { isSuperAdmin: false };
  },

  // Check if email is a super admin (via Supabase table or offline list)
  async checkSuperAdmin(email: string): Promise<{ isSuperAdmin: boolean; adminData?: any; error?: string }> {
    if (!isSupabaseConfigured) {
      return this.runOfflineFallback(email);
    }

    // First try the super_admins table
    try {
      const { data, error } = await supabase
        .from('super_admins')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error) {
        const isTableMissing =
          error.code === 'PGRST205' ||
          (error.message && error.message.includes('super_admins'));
        if (isTableMissing) {
          console.warn('[supabaseService] super_admins table missing — using authorized email list fallback.');
          return this.runOfflineFallback(email);
        }
        return { isSuperAdmin: false, error: error.message };
      }

      if (data) {
        return { isSuperAdmin: true, adminData: data };
      }

      // Not in DB table — check hardcoded list
      return this.runOfflineFallback(email);
    } catch (err: any) {
      console.warn('[supabaseService] Exception in checkSuperAdmin, falling back:', err.message);
      return this.runOfflineFallback(email);
    }
  },

  // Authenticate a super admin login
  async login(
    email: string,
    password?: string
  ): Promise<{ success: boolean; adminData?: any; error?: string }> {
    // Step 1: Validate password
    if (!password || !VALID_PASSWORDS.includes(password)) {
      return { success: false, error: 'Access Denied: Invalid administrative credentials.' };
    }

    // Step 2: Try Supabase Auth sign-in if configured
    if (isSupabaseConfigured) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        });

        if (!authError && authData?.user) {
          // Auth succeeded — verify they're a super admin
          const check = await this.checkSuperAdmin(email);
          if (check.isSuperAdmin) {
            return {
              success: true,
              adminData: check.adminData || {
                id: authData.user.id,
                email: authData.user.email,
                full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
              },
            };
          }
          // Signed in via Auth but not a super admin
          await supabase.auth.signOut();
          return {
            success: false,
            error: 'Access Denied: Your account is not authorized as a Super Admin.',
          };
        }
      } catch (authErr: any) {
        console.warn('[supabaseService] Auth.signInWithPassword exception, falling back to offline check:', authErr.message);
      }
    }

    // Step 3: Offline email-based fallback (demo mode)
    const check = await this.checkSuperAdmin(email);
    if (check.isSuperAdmin) {
      return { success: true, adminData: check.adminData };
    }

    return { success: false, error: 'Access Denied: You are not authorized as a Super Admin.' };
  },

  // Sign out from Supabase Auth
  async logout(): Promise<void> {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut().catch(() => {});
    }
  },
};
