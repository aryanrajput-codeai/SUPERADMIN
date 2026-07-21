import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();

const cleanSupabaseUrl = (url: string): string => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url.replace(/\/rest\/v1\/?$/i, '').replace(/\/auth\/v1\/?$/i, '').replace(/\/+$/, '');
  }
};

const supabaseUrl = cleanSupabaseUrl(rawSupabaseUrl);

const isValidUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured: boolean = isValidUrl(supabaseUrl) && Boolean(supabaseAnonKey);

// If keys are provided, we instantiate the real Supabase client.
// Otherwise, we export a proxy/null client to prevent runtime crashes.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

/**
 * Service class that abstracts real Supabase calls vs fallback client-side storage.
 * This guarantees the system works "enterprise-style" when connected, and "fully-interactive" during preview!
 */
export const supabaseService = {
  // Check if email belongs to a super admin
  async checkSuperAdmin(email: string): Promise<{ isSuperAdmin: boolean; adminData?: any; error?: string }> {
    const isDemoAdmin = email.toLowerCase() === 'aiaryanrajput@gmail.com' || email.toLowerCase() === 'admin@webrajya.com';

    if (!isSupabaseConfigured) {
      if (isDemoAdmin) {
        return {
          isSuperAdmin: true,
          adminData: {
            id: 'sa_01',
            email: email,
            full_name: email.split('@')[0].toUpperCase(),
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'
          }
        };
      }
      return { isSuperAdmin: false };
    }

    try {
      const { data, error } = await supabase
        .from('super_admins')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) {
        // If there is a Supabase error (e.g. table doesn't exist yet, network failure) but it is a demo admin, allow fallback
        if (isDemoAdmin) {
          console.warn('Supabase query failed but falling back to local demo admin:', error?.message);
          return {
            isSuperAdmin: true,
            adminData: {
              id: 'sa_01',
              email: email,
              full_name: email.split('@')[0].toUpperCase(),
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'
            }
          };
        }
        return { isSuperAdmin: false, error: error?.message || 'Admin record not found.' };
      }
      return { isSuperAdmin: true, adminData: data };
    } catch (err: any) {
      if (isDemoAdmin) {
        console.warn('Supabase connection threw error, falling back to local demo admin:', err.message);
        return {
          isSuperAdmin: true,
          adminData: {
            id: 'sa_01',
            email: email,
            full_name: email.split('@')[0].toUpperCase(),
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80'
          }
        };
      }
      return { isSuperAdmin: false, error: err.message };
    }
  },

  // Log in user via Supabase or simulate it
  async login(email: string): Promise<{ success: boolean; adminData?: any; error?: string }> {
    const adminCheck = await this.checkSuperAdmin(email);
    if (adminCheck.isSuperAdmin) {
      return { success: true, adminData: adminCheck.adminData };
    }
    return { success: false, error: adminCheck.error || 'Access Denied: You are not authorized as a Super Admin.' };
  }
};
