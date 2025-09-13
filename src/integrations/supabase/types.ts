export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_deletions: {
        Row: {
          cleanup_completed: boolean
          cleanup_completed_at: string | null
          created_at: string
          deleted_at: string
          email: string
          id: number
          metadata: Json | null
          scheduled_cleanup_at: string
          user_id: string
        }
        Insert: {
          cleanup_completed?: boolean
          cleanup_completed_at?: string | null
          created_at?: string
          deleted_at?: string
          email: string
          id?: number
          metadata?: Json | null
          scheduled_cleanup_at?: string
          user_id: string
        }
        Update: {
          cleanup_completed?: boolean
          cleanup_completed_at?: string | null
          created_at?: string
          deleted_at?: string
          email?: string
          id?: number
          metadata?: Json | null
          scheduled_cleanup_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_admins: {
        Row: {
          created_at: string
          created_by: string | null
          email: string
          id: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          email: string
          id?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          email?: string
          id?: number
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          company_id: number | null
          id: number
          key: string
          updated_at: string | null
          value: Json | null
        }
        Insert: {
          company_id?: number | null
          id?: number
          key: string
          updated_at?: string | null
          value?: Json | null
        }
        Update: {
          company_id?: number | null
          id?: number
          key?: string
          updated_at?: string | null
          value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          balance: number
          bank_name: string
          company_id: number
          created_at: string
          currency: string
          id: number
          is_active: boolean
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          balance?: number
          bank_name: string
          company_id: number
          created_at?: string
          currency?: string
          id?: number
          is_active?: boolean
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          balance?: number
          bank_name?: string
          company_id?: number
          created_at?: string
          currency?: string
          id?: number
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      income_categories: {
        Row: {
          color: string | null
          company_id: number | null
          created_at: string
          description: string | null
          id: number
          income_count: number | null
          is_active: boolean
          name: string
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          company_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          income_count?: number | null
          is_active?: boolean
          name: string
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          company_id?: number | null
          created_at?: string
          description?: string | null
          id?: number
          income_count?: number | null
          is_active?: boolean
          name?: string
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          created_at: string
          id: number
          name: string
          product_sku: string | null
          purchase_id: number | null
          quantity: number
          total: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
          product_sku?: string | null
          purchase_id?: number | null
          quantity?: number
          total?: number
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
          product_sku?: string | null
          purchase_id?: number | null
          quantity?: number
          total?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_sku_fkey"
            columns: ["product_sku"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["sku"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          company_id: number | null
          created_at: string
          expected_delivery: string | null
          id: number
          notes: string | null
          order_date: string
          payment_status: string
          shipping: number
          status: string
          subtotal: number
          supplier: string
          total: number
          updated_at: string
        }
        Insert: {
          company_id?: number | null
          created_at?: string
          expected_delivery?: string | null
          id?: number
          notes?: string | null
          order_date?: string
          payment_status?: string
          shipping?: number
          status?: string
          subtotal?: number
          supplier: string
          total?: number
          updated_at?: string
        }
        Update: {
          company_id?: number | null
          created_at?: string
          expected_delivery?: string | null
          id?: number
          notes?: string | null
          order_date?: string
          payment_status?: string
          shipping?: number
          status?: string
          subtotal?: number
          supplier?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_ins: {
        Row: {
          batch_number: string | null
          company_id: number | null
          created_at: string
          expiry_date: string | null
          id: number
          notes: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          received_by: string
          received_date: string
          status: string
          supplier: string
          total_cost: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          company_id?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: number
          notes?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          received_by?: string
          received_date?: string
          status?: string
          supplier: string
          total_cost?: number
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          company_id?: number | null
          created_at?: string
          expiry_date?: string | null
          id?: number
          notes?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          received_by?: string
          received_date?: string
          status?: string
          supplier?: string
          total_cost?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_ins_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_outs: {
        Row: {
          batch_number: string | null
          company_id: number | null
          created_at: string
          destination: string | null
          id: number
          notes: string | null
          out_date: string
          processed_by: string
          product_name: string
          product_sku: string | null
          quantity: number
          reason: string
          status: string
          total_cost: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          company_id?: number | null
          created_at?: string
          destination?: string | null
          id?: number
          notes?: string | null
          out_date?: string
          processed_by?: string
          product_name: string
          product_sku?: string | null
          quantity?: number
          reason: string
          status?: string
          total_cost?: number
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          company_id?: number | null
          created_at?: string
          destination?: string | null
          id?: number
          notes?: string | null
          out_date?: string
          processed_by?: string
          product_name?: string
          product_sku?: string | null
          quantity?: number
          reason?: string
          status?: string
          total_cost?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_outs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_returns: {
        Row: {
          batch_number: string | null
          company_id: number | null
          created_at: string
          customer: string | null
          id: number
          notes: string | null
          processed_by: string
          product_name: string
          product_sku: string | null
          quantity: number
          reason: string
          refund_amount: number | null
          return_date: string
          return_type: string
          status: string
          supplier: string | null
          total_cost: number
          unit_cost: number
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          company_id?: number | null
          created_at?: string
          customer?: string | null
          id?: number
          notes?: string | null
          processed_by?: string
          product_name: string
          product_sku?: string | null
          quantity?: number
          reason: string
          refund_amount?: number | null
          return_date?: string
          return_type?: string
          status?: string
          supplier?: string | null
          total_cost?: number
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          company_id?: number | null
          created_at?: string
          customer?: string | null
          id?: number
          notes?: string | null
          processed_by?: string
          product_name?: string
          product_sku?: string | null
          quantity?: number
          reason?: string
          refund_amount?: number | null
          return_date?: string
          return_type?: string
          status?: string
          supplier?: string | null
          total_cost?: number
          unit_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_returns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id: string
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          discount_applied: number | null
          expires_at: string | null
          id: string
          payment_details: Json | null
          payment_method: string | null
          plan_id: string | null
          referral_code: string | null
          referral_name: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_applied?: number | null
          expires_at?: string | null
          id?: string
          payment_details?: Json | null
          payment_method?: string | null
          plan_id?: string | null
          referral_code?: string | null
          referral_name?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          discount_applied?: number | null
          expires_at?: string | null
          id?: string
          payment_details?: Json | null
          payment_method?: string | null
          plan_id?: string | null
          referral_code?: string | null
          referral_name?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[keyof Database]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
