import { supabase } from './supabase'
import type { Session, Note, NoteInsert } from '@/types/database'

export async function upsertSession(slug: string): Promise<Session> {
  const { data: existing } = await supabase
    .from('sessions')
    .select('*')
    .eq('slug', slug)
    .single()

  if (existing) return existing

  const { data, error } = await supabase
    .from('sessions')
    .insert({ slug })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchNotes(sessionId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function revealNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .update({ status: 'revealed', revealed_at: new Date().toISOString() })
    .eq('id', noteId)

  if (error) throw error
}

export async function insertNote(note: NoteInsert): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteAllNotes(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('session_id', sessionId)

  if (error) throw error
}

export async function toggleSessionLock(sessionId: string, isLocked: boolean): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .update({ is_locked: isLocked })
    .eq('id', sessionId)

  if (error) throw error
}
