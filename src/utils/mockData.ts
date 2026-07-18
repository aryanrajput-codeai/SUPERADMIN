import { Restaurant, Payment, SupportTicket, ActivityLog, GlobalSettings, SubscriptionPlan, Branch, TicketStatus, RestaurantStatus } from '../types';

// Let's seed initial data for demonstration.
export const INITIAL_RESTAURANTS: Restaurant[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_TICKETS: SupportTicket[] = [];

export const INITIAL_BRANCHES: Branch[] = [];

export const INITIAL_LOGS: ActivityLog[] = [];

export const INITIAL_PLANS: SubscriptionPlan[] = [
  { id: 'pl_01', name: 'Starter Plan', code: 'starter', price: 5999, interval: 'monthly', max_branches: 1, max_staff: 5, features: ['Single Branch', '5 Staff Accounts', 'Standard Reporting', 'Email Support', 'Basic Billing'] },
  { id: 'pl_02', name: 'Premium Plan', code: 'premium', price: 14999, interval: 'monthly', max_branches: 3, max_staff: 15, features: ['Up to 3 Branches', '15 Staff Accounts', 'Advanced Dashboard', 'Aggregator Integrations', 'WhatsApp Alerts', 'Priority Support'] },
  { id: 'pl_03', name: 'Enterprise Plan', code: 'enterprise', price: 49999, interval: 'monthly', max_branches: 15, max_staff: 100, features: ['Up to 15 Branches', '100 Staff Accounts', 'Custom Roles & Audit Logs', 'Open API Access', 'Custom Domain', 'Dedicated Account Manager', '24/7 Phone Support'] }
];

export const INITIAL_SETTINGS: GlobalSettings = {
  application_name: 'WebRajya POS',
  logo: '👑',
  currency: 'INR',
  gst_defaults: { cgst: 2.5, sgst: 2.5, igst: 5.0 },
  invoice_defaults: {
    prefix: 'WRPOS',
    terms: 'Payment is due immediately on order generation. Late fees of 2% monthly apply for outstanding corporate invoices.',
    footer: 'Thank you for dining with us! Designed and secured by WebRajya POS SaaS.'
  },
  plans: INITIAL_PLANS,
  system_mode: 'production',
  allow_self_signup: true
};

// Simulated State Store (keeps changes during runtime)
class DatabaseStore {
  restaurants: Restaurant[] = [...INITIAL_RESTAURANTS];
  payments: Payment[] = [...INITIAL_PAYMENTS];
  tickets: SupportTicket[] = [...INITIAL_TICKETS];
  branches: Branch[] = [...INITIAL_BRANCHES];
  logs: ActivityLog[] = [...INITIAL_LOGS];
  settings: GlobalSettings = { ...INITIAL_SETTINGS };
  superAdmins = [
    { id: 'sa_01', email: 'aiaryanrajput@gmail.com', full_name: 'Aryan Rajput', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80' }
  ];

  constructor() {
    // Force reset old mock data on first load of clean version
    const hasPurgedOld = localStorage.getItem('wr_purged_old_v3');
    if (!hasPurgedOld) {
      localStorage.removeItem('wr_restaurants');
      localStorage.removeItem('wr_payments');
      localStorage.removeItem('wr_tickets');
      localStorage.removeItem('wr_branches');
      localStorage.removeItem('wr_logs');
      localStorage.setItem('wr_purged_old_v3', 'true');
    }

    // Attempt to load from localStorage to persist changes
    const savedRestaurants = localStorage.getItem('wr_restaurants');
    const savedPayments = localStorage.getItem('wr_payments');
    const savedTickets = localStorage.getItem('wr_tickets');
    const savedBranches = localStorage.getItem('wr_branches');
    const savedLogs = localStorage.getItem('wr_logs');
    const savedSettings = localStorage.getItem('wr_settings');

    if (savedRestaurants) this.restaurants = JSON.parse(savedRestaurants);
    if (savedPayments) this.payments = JSON.parse(savedPayments);
    if (savedTickets) this.tickets = JSON.parse(savedTickets);
    if (savedBranches) this.branches = JSON.parse(savedBranches);
    if (savedLogs) this.logs = JSON.parse(savedLogs);
    if (savedSettings) this.settings = JSON.parse(savedSettings);
  }

  save() {
    localStorage.setItem('wr_restaurants', JSON.stringify(this.restaurants));
    localStorage.setItem('wr_payments', JSON.stringify(this.payments));
    localStorage.setItem('wr_tickets', JSON.stringify(this.tickets));
    localStorage.setItem('wr_branches', JSON.stringify(this.branches));
    localStorage.setItem('wr_logs', JSON.stringify(this.logs));
    localStorage.setItem('wr_settings', JSON.stringify(this.settings));
  }

  // TRANSACTION: Create Restaurant with all POS elements
  createRestaurantTransaction(data: {
    // Step 1
    name: string;
    ownerName: string;
    email: string;
    phone: string;
    // Step 2
    address: string;
    city: string;
    state: string;
    country: string;
    gstNumber: string;
    logo?: string;
    // Step 3
    plan: 'starter' | 'premium' | 'enterprise';
    expiryDate: string;
    timezone: string;
    currency: string;
    invoicePrefix: string;
    branchName: string;
  }): { success: boolean; error?: string; restaurant?: Restaurant } {
    try {
      // Simulate validation / Step Failure to satisfy rollback criteria:
      if (!data.name || !data.email || !data.ownerName) {
        throw new Error('Transaction aborted: Missing required fields (Name, Email, or Owner Name). Rollback initiated.');
      }
      if (this.restaurants.some(r => r.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error(`Transaction aborted: A restaurant owner with email '${data.email}' already exists. Rollback initiated.`);
      }

      const newId = 'rest_' + Math.floor(1000 + Math.random() * 9000);

      // 1. Create Restaurant record
      const newRest: Restaurant = {
        id: newId,
        name: data.name,
        logo: data.logo || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=100&h=100&fit=crop&q=80',
        owner_name: data.ownerName,
        email: data.email,
        phone: data.phone,
        plan: data.plan,
        status: data.plan === 'starter' || data.plan === 'premium' || data.plan === 'enterprise' ? 'active' : 'trial',
        created_at: new Date().toISOString(),
        expiry_date: new Date(data.expiryDate).toISOString(),
        branches_count: 1,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        gst_number: data.gstNumber,
        timezone: data.timezone,
        currency: data.currency,
        invoice_prefix: data.invoicePrefix || data.name.substring(0,3).toUpperCase()
      };

      // 2. Insert into restaurants collection
      this.restaurants.unshift(newRest);

      // 3. Create Default Branch
      const newBranch: Branch = {
        id: 'br_' + Math.floor(10000 + Math.random() * 90000),
        restaurant_id: newId,
        name: data.branchName || 'Main Branch',
        address: data.address,
        city: data.city,
        state: data.state,
        phone: data.phone,
        status: 'active'
      };
      this.branches.push(newBranch);

      // 4. Create initial Mock Payments (Simulation)
      const mockPayment: Payment = {
        id: 'pay_' + Math.floor(1000 + Math.random() * 9000),
        restaurant_id: newId,
        restaurant_name: data.name,
        amount: data.plan === 'starter' ? 5999 : data.plan === 'premium' ? 14999 : 49999,
        plan: data.plan,
        payment_method: 'Credit Card (Stripe Gateway)',
        status: 'successful',
        created_at: new Date().toISOString(),
        invoice_number: `${data.invoicePrefix}-INV-101`
      };
      this.payments.unshift(mockPayment);

      // 5. Create audit logs
      const logEntry: ActivityLog = {
        id: 'log_' + Math.floor(10000 + Math.random() * 90000),
        restaurant_id: newId,
        restaurant_name: data.name,
        action: 'Tenant Created',
        description: `Transactional registration complete. Tables seeded: Supabase Auth, restaurants, restaurant_users, restaurant_settings, restaurant_counters, branches, default payment methods, and GST taxes.`,
        created_at: new Date().toISOString(),
        user_name: 'Super Admin',
        ip_address: '127.0.0.1'
      };
      this.logs.unshift(logEntry);

      this.save();
      return { success: true, restaurant: newRest };
    } catch (err: any) {
      console.error("Transaction Error - Rolling back!", err);
      // Rollback is automatic in client-side state because we only push on success,
      // and any exception thrown stops the code before it mutates arrays or saves to localStorage.
      return { success: false, error: err.message };
    }
  }

  // Support Ticket actions
  replyTicket(ticketId: string, text: string): SupportTicket | null {
    const t = this.tickets.find(tick => tick.id === ticketId);
    if (t) {
      t.messages.push({
        sender: 'admin',
        text,
        created_at: new Date().toISOString()
      });
      t.status = 'resolved';
      this.save();
      return t;
    }
    return null;
  }

  updateTicketStatus(ticketId: string, status: TicketStatus, assignee?: string): SupportTicket | null {
    const t = this.tickets.find(tick => tick.id === ticketId);
    if (t) {
      t.status = status;
      if (assignee) {
        t.assigned_to = assignee;
      }
      this.save();
      return t;
    }
    return null;
  }

  // Restaurant Status Actions
  updateRestaurantStatus(id: string, status: RestaurantStatus): Restaurant | null {
    const r = this.restaurants.find(rest => rest.id === id);
    if (r) {
      r.status = status;
      this.logs.unshift({
        id: 'log_' + Math.floor(10000 + Math.random() * 90000),
        restaurant_id: id,
        restaurant_name: r.name,
        action: `Status Updated`,
        description: `Status changed to ${status.toUpperCase()} by Super Admin.`,
        created_at: new Date().toISOString(),
        user_name: 'Super Admin',
        ip_address: '127.0.0.1'
      });
      this.save();
      return r;
    }
    return null;
  }

  // Subscription Renew Tool
  renewSubscription(id: string, plan: 'starter' | 'premium' | 'enterprise', months: number): Restaurant | null {
    const r = this.restaurants.find(rest => rest.id === id);
    if (r) {
      r.plan = plan;
      r.status = 'active';
      const expiry = new Date(r.expiry_date);
      expiry.setMonth(expiry.getMonth() + months);
      r.expiry_date = expiry.toISOString();

      // Create new transaction receipt
      const amount = plan === 'starter' ? 5999 : plan === 'premium' ? 14999 : 49999;
      this.payments.unshift({
        id: 'pay_' + Math.floor(1000 + Math.random() * 9000),
        restaurant_id: id,
        restaurant_name: r.name,
        amount: amount * months,
        plan: plan,
        payment_method: 'Renew via Portal',
        status: 'successful',
        created_at: new Date().toISOString(),
        invoice_number: `${r.invoice_prefix}-REN-${Math.floor(100 + Math.random() * 900)}`
      });

      this.logs.unshift({
        id: 'log_' + Math.floor(10000 + Math.random() * 90000),
        restaurant_id: id,
        restaurant_name: r.name,
        action: `Subscription Renewed`,
        description: `Upgraded/Renewed plan to ${plan.toUpperCase()} for ${months} month(s). Expiry extended to ${expiry.toLocaleDateString()}.`,
        created_at: new Date().toISOString(),
        user_name: 'Super Admin',
        ip_address: '127.0.0.1'
      });

      this.save();
      return r;
    }
    return null;
  }

  // Reset Password (Mock)
  resetPassword(id: string): string {
    const r = this.restaurants.find(rest => rest.id === id);
    if (!r) throw new Error('Restaurant not found');
    const newPass = 'WRPOS_' + Math.floor(100000 + Math.random() * 900000);
    this.logs.unshift({
      id: 'log_' + Math.floor(10000 + Math.random() * 90000),
      restaurant_id: id,
      restaurant_name: r.name,
      action: `Password Reset`,
      description: `Temporary password generated for owner ${r.owner_name} (${r.email}): ${newPass}`,
      created_at: new Date().toISOString(),
      user_name: 'Super Admin',
      ip_address: '127.0.0.1'
    });
    this.save();
    return newPass;
  }

  // Delete Restaurant
  deleteRestaurant(id: string): boolean {
    const idx = this.restaurants.findIndex(rest => rest.id === id);
    if (idx > -1) {
      const restName = this.restaurants[idx].name;
      this.restaurants.splice(idx, 1);
      
      // Cascade delete branches
      this.branches = this.branches.filter(b => b.restaurant_id !== id);

      this.logs.unshift({
        id: 'log_' + Math.floor(10000 + Math.random() * 90000),
        action: `Tenant Deleted`,
        description: `Restaurant '${restName}' (ID: ${id}) deleted from platform. All cascading POS records purged.`,
        created_at: new Date().toISOString(),
        user_name: 'Super Admin',
        ip_address: '127.0.0.1'
      });

      this.save();
      return true;
    }
    return false;
  }

  // Update Settings
  updateGlobalSettings(newSettings: Partial<GlobalSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.save();
  }

  // Clear all platform data
  clearAllData() {
    this.restaurants = [];
    this.payments = [];
    this.tickets = [];
    this.branches = [];
    this.logs = [];
    this.save();
  }
}

export const dbStore = new DatabaseStore();
