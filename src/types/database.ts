export type Database = {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string
          slug: string
          title: string
          is_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title?: string
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          is_locked?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          id: string
          session_id: string
          type: 'visible' | 'hidden'
          content: string
          status: 'closed' | 'revealed'
          position_x: number | null
          position_y: number | null
          rotation: number | null
          color: string | null
          pin: string | null
          created_at: string
          revealed_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          type: 'visible' | 'hidden'
          content: string
          status?: 'closed' | 'revealed'
          position_x?: number | null
          position_y?: number | null
          rotation?: number | null
          color?: string | null
          pin?: string | null
          created_at?: string
          revealed_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          type?: 'visible' | 'hidden'
          content?: string
          status?: 'closed' | 'revealed'
          position_x?: number | null
          position_y?: number | null
          rotation?: number | null
          color?: string | null
          pin?: string | null
          revealed_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Session = Database['public']['Tables']['sessions']['Row']
export type Note = Database['public']['Tables']['notes']['Row']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
