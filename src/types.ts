export type SubscriptionPlanTier = 'trial' | 'starter' | 'premium' | 'enterprise';
export type RestaurantStatus = 'active' | 'suspended' | 'trial' | 'expired';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'assigned' | 'resolved' | 'closed';
export type PaymentStatus = 'successful' | 'pending' | 'failed' | 'refunded';

export interface Restaurant {
  id: string;
  name: string;
  logo: string;
  owner_name: string;
  email: string;
  phone: string;
  plan: SubscriptionPlanTier;
  status: RestaurantStatus;
  created_at: string;
  expiry_date: string;
  branches_count: number;
  address: string;
  city: string;
  state: string;
  country: string;
  gst_number: string;
  timezone: string;
  currency: string;
  invoice_prefix: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  code: SubscriptionPlanTier;
  price: number;
  interval: 'monthly' | 'yearly';
  max_branches: number;
  max_staff: number;
  features: string[];
}

export interface Payment {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  amount: number;
  plan: SubscriptionPlanTier;
  payment_method: string;
  status: PaymentStatus;
  created_at: string;
  invoice_number: string;
}

export interface SupportTicket {
  id: string;
  restaurant_id: string;
  restaurant_name: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  assigned_to: string;
  messages: {
    sender: 'admin' | 'user';
    text: string;
    created_at: string;
  }[];
}

export interface ActivityLog {
  id: string;
  restaurant_id?: string;
  restaurant_name?: string;
  action: string;
  description: string;
  created_at: string;
  user_name: string;
  ip_address: string;
}

export interface Branch {
  id: string;
  restaurant_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface GlobalSettings {
  application_name: string;
  logo: string;
  currency: string;
  gst_defaults: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  invoice_defaults: {
    prefix: string;
    terms: string;
    footer: string;
  };
  plans: SubscriptionPlan[];
  system_mode: 'production' | 'maintenance' | 'sandbox';
  allow_self_signup: boolean;
}

export interface SuperAdmin {
  id: string;
  email: string;
  full_name: string;
  avatar: string;
}
