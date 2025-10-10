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
          avatar_url: string | null;
          loyalty_points: number;
          loyalty_tier: 'Silver' | 'Gold' | 'Platinum';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string | null;
          content: string;
          featured_image_url: string | null;
          author: string | null;
          published_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['blog_posts']['Row'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['blog_posts']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category_id: string | null;
          base_price: number;
          sale_price: number | null;
          style: string | null;
          room_type: string | null;
          materials: string[] | null;
          dimensions: {
            width: number;
            depth: number;
            height: number;
          } | null;
          weight: number | null;
          sku: string;
          stock_quantity: number;
          images: string[];
          video_url: string | null;
          rating: number;
          review_count: number;
          is_featured: boolean;
          is_new: boolean;
          status: 'active' | 'draft' | 'out_of_stock';
          created_at: string;
          updated_at: string;
        };
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
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
          subtotal: number;
          shipping_fee: number;
          tax: number;
          discount: number;
          total: number;
          shipping_address_id: string | null;
          payment_method: string | null;
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          delivery_date: string | null;
          assembly_service: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      wishlists: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          created_at: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          user_id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          created_at: string;
          updated_at: string;
        };
      };
      vouchers: {
        Row: {
          id: string;
          code: string;
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
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['comments']['Insert']>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
          rating: number;
          title: string | null;
          comment: string;
          images: string[];
          is_verified_purchase: boolean;
          status: 'pending' | 'approved' | 'rejected';
          helpful_count: number;
          created_at: string;
        };
      };
    };
  };
};
