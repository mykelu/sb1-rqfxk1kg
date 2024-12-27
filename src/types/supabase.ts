export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          client_id: string
          therapist_id: string
          scheduled_for: string
          status: 'scheduled' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          therapist_id: string
          scheduled_for: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          therapist_id?: string
          scheduled_for?: string
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      content_moderation: {
        Row: {
          id: string
          content_type: string
          content_id: string
          status: 'pending' | 'approved' | 'rejected'
          moderator_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content_type: string
          content_id: string
          status?: 'pending' | 'approved' | 'rejected'
          moderator_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content_type?: string
          content_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          moderator_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      crisis_reports: {
        Row: {
          id: string
          user_id: string
          priority: 'low' | 'medium' | 'high' | 'immediate'
          description: string
          handled_by: string | null
          resolution: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          priority: 'low' | 'medium' | 'high' | 'immediate'
          description: string
          handled_by?: string | null
          resolution?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          priority?: 'low' | 'medium' | 'high' | 'immediate'
          description?: string
          handled_by?: string | null
          resolution?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          age_restricted: boolean
          status: 'pending' | 'approved' | 'rejected'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: string
          age_restricted?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: string
          age_restricted?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      therapists: {
        Row: {
          id: string
          user_id: string
          license_number: string
          specializations: string[]
          verification_status: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          license_number: string
          specializations?: string[]
          verification_status?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          license_number?: string
          specializations?: string[]
          verification_status?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_id: string
          role: 'minor' | 'adult' | 'therapist' | 'support' | 'moderator' | 'admin' | 'super_admin'
          full_name: string | null
          date_of_birth: string | null
          emergency_contact: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          role?: 'minor' | 'adult' | 'therapist' | 'support' | 'moderator' | 'admin' | 'super_admin'
          full_name?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          role?: 'minor' | 'adult' | 'therapist' | 'support' | 'moderator' | 'admin' | 'super_admin'
          full_name?: string | null
          date_of_birth?: string | null
          emergency_contact?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}