import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          phone: string | null;
          address: string | null;
          avatar_url: string | null;
          loyalty_points: number;
          loyalty_tier: 'Silver' | 'Gold' | 'Platinum';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          phone?: string | null;
          address?: string | null;
          avatar_url?: string | null;
          loyalty_points?: number;
          loyalty_tier?: 'Silver' | 'Gold' | 'Platinum';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          image_url: string | null;
          description: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          image_url?: string | null;
          description?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          name_i18n: Record<string, string>;
          description_i18n: Record<string, string>;
          category_id: string | null;
          base_price: number;
          sale_price: number | null;
          style: string | null;
          room_type: string | null;
          materials: string[] | null;
          dimensions: Record<string, string> | null;
          weight: number | null;
          sku: string;
          stock_quantity: number;
          images: string[];
          video_url: string | null;
          model_3d_url: string | null;
          rating: number;
          review_count: number;
          is_featured: boolean;
          is_new: boolean;
          status: 'active' | 'draft' | 'out_of_stock';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          name_i18n?: Record<string, string>;
          description_i18n?: Record<string, string>;
          category_id?: string | null;
          base_price: number;
          sale_price?: number | null;
          style?: string | null;
          room_type?: string | null;
          materials?: string[] | null;
          dimensions?: Record<string, string> | null;
          weight?: number | null;
          sku: string;
          stock_quantity?: number;
          images?: string[];
          video_url?: string | null;
          model_3d_url?: string | null;
          rating?: number;
          review_count?: number;
          is_featured?: boolean;
          is_new?: boolean;
          status?: 'active' | 'draft' | 'out_of_stock';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          variant_type: string;
          variant_value: string;
          price_adjustment: number;
          sku: string;
          stock_quantity: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_type: string;
          variant_value: string;
          price_adjustment?: number;
          sku: string;
          stock_quantity?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>;
      };
      vouchers: {
        Row: {
          id: string;
          code: string;
          description: string | null;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_purchase: number;
          max_discount: number | null;
          usage_limit: number | null;
          used_count: number;
          valid_from: string;
          valid_until: string | null;
          applicable_categories: string[] | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          description?: string | null;
          discount_type: 'percentage' | 'fixed';
          discount_value: number;
          min_purchase?: number;
          max_discount?: number | null;
          usage_limit?: number | null;
          used_count?: number;
          valid_from?: string;
          valid_until?: string | null;
          applicable_categories?: string[] | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['vouchers']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          order_number: string;
          status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
          subtotal: number;
          shipping_cost: number;
          tax: number;
          discount: number;
          total_amount: number;
          voucher_id: string | null;
          voucher_discount: number | null;
          shipping_address_id: string | null;
          shipping_address: Record<string, unknown> | null;
          contact_info: Record<string, unknown> | null;
          payment_method: string;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          delivery_date: string | null;
          assembly_service: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          order_number?: string;
          status?: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
          subtotal?: number;
          shipping_cost?: number;
          tax?: number;
          discount?: number;
          total_amount?: number;
          voucher_id?: string | null;
          voucher_discount?: number | null;
          shipping_address_id?: string | null;
          shipping_address?: Record<string, unknown> | null;
          contact_info?: Record<string, unknown> | null;
          payment_method?: string;
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          delivery_date?: string | null;
          assembly_service?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          unit_price: number;
          price: number;
          subtotal: number;
          dimensions: string | null;
          material: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
          unit_price?: number;
          price?: number;
          subtotal?: number;
          dimensions?: string | null;
          material?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          title_i18n: Record<string, string>;
          excerpt_i18n: Record<string, string>;
          content: string;
          featured_image_url: string | null;
          author: string | null;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string | null;
          title_i18n?: Record<string, string>;
          excerpt_i18n?: Record<string, string>;
          content: string;
          featured_image_url?: string | null;
          author?: string | null;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>;
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          name: string;
          email: string;
          content: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          name: string;
          email: string;
          content: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string | null;
          order_id: string | null;
          rating: number;
          title: string | null;
          comment: string;
          images: string[];
          is_verified_purchase: boolean;
          status: 'pending' | 'approved' | 'rejected';
          helpful_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          order_id?: string | null;
          rating: number;
          title?: string | null;
          comment: string;
          images?: string[];
          is_verified_purchase?: boolean;
          status?: 'pending' | 'approved' | 'rejected';
          helpful_count?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reviews']['Insert']>;
      };
      contact_messages: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          subject: string;
          message: string;
          status: 'pending' | 'read' | 'replied' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          subject: string;
          message: string;
          status?: 'pending' | 'read' | 'replied' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['contact_messages']['Insert']>;
      };
      design_service_requests: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          project_type: string;
          project_scope: string | null;
          preferred_style: string | null;
          budget_range: string | null;
          desired_timeline: string | null;
          additional_notes: string | null;
          status: 'pending' | 'in_review' | 'quoted' | 'scheduled' | 'completed' | 'closed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          project_type: string;
          project_scope?: string | null;
          preferred_style?: string | null;
          budget_range?: string | null;
          desired_timeline?: string | null;
          additional_notes?: string | null;
          status?: 'pending' | 'in_review' | 'quoted' | 'scheduled' | 'completed' | 'closed';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['design_service_requests']['Insert']>;
      };
      career_applications: {
        Row: {
          id: string;
          user_id: string | null;
          full_name: string;
          email: string;
          phone: string | null;
          position_applied: string;
          resume_url: string;
          cover_letter: string | null;
          portfolio_url: string | null;
          expected_salary: string | null;
          status: 'received' | 'reviewing' | 'interview' | 'offer' | 'hired' | 'archived' | 'rejected';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          full_name: string;
          email: string;
          phone?: string | null;
          position_applied: string;
          resume_url: string;
          cover_letter?: string | null;
          portfolio_url?: string | null;
          expected_salary?: string | null;
          status?: 'received' | 'reviewing' | 'interview' | 'offer' | 'hired' | 'archived' | 'rejected';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['career_applications']['Insert']>;
      };
    };
  };
};
