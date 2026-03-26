export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ships: {
        Row: {
          id: string
          name: string
          imo_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          imo_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          imo_number?: string | null
          created_at?: string
        }
      }
      warehouses: {
        Row: {
          id: string
          ship_id: string
          name: string
          location_description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ship_id: string
          name: string
          location_description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ship_id?: string
          name?: string
          location_description?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          barcode: string
          unit: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          barcode: string
          unit?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          barcode?: string
          unit?: string
          created_at?: string
        }
      }
      stock: {
        Row: {
          id: string
          product_id: string
          warehouse_id: string
          quantity: number
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          warehouse_id: string
          quantity: number
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          warehouse_id?: string
          quantity?: number
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          role: 'ADMIN' | 'OPERARIO'
          ship_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          role?: 'ADMIN' | 'OPERARIO'
          ship_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          role?: 'ADMIN' | 'OPERARIO'
          ship_id?: string | null
          created_at?: string
        }
      }
      movements: {
        Row: {
          id: string
          type: 'INGRESO' | 'RETIRO' | 'TRASLADO'
          product_id: string
          from_warehouse_id: string | null
          to_warehouse_id: string | null
          quantity: number
          notes: string | null
          sent_by: string | null
          received_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          type: 'INGRESO' | 'RETIRO' | 'TRASLADO'
          product_id: string
          from_warehouse_id?: string | null
          to_warehouse_id?: string | null
          quantity: number
          notes?: string | null
          sent_by?: string | null
          received_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'INGRESO' | 'RETIRO' | 'TRASLADO'
          product_id?: string
          from_warehouse_id?: string | null
          to_warehouse_id?: string | null
          quantity?: number
          notes?: string | null
          sent_by?: string | null
          received_by?: string | null
          created_at?: string
        }
      }
    }
  }
}
