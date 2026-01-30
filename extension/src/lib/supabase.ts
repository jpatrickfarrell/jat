// Supabase client for JAT Browser Extension
// Lazily initialized from settings stored in chrome.storage.local

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { storage } from './browser-compat'

export interface SupabaseSettings {
  supabaseUrl: string
  supabaseAnonKey: string
}

export interface FeedbackReport {
  title: string
  description: string
  type: 'bug' | 'enhancement' | 'other'
  priority: 'low' | 'medium' | 'high' | 'critical'
  page_url: string
  user_agent: string
  console_logs: unknown[] | null
  selected_elements: unknown[] | null
  screenshot_urls: string[] | null
  metadata: Record<string, unknown> | null
}

let client: SupabaseClient | null = null
let currentUrl: string | null = null
let currentKey: string | null = null

/**
 * Load Supabase settings from chrome.storage.local
 */
export async function getSettings(): Promise<SupabaseSettings | null> {
  try {
    const result = await storage.local.get(['supabaseUrl', 'supabaseAnonKey'])
    if (result.supabaseUrl && result.supabaseAnonKey) {
      return {
        supabaseUrl: result.supabaseUrl as string,
        supabaseAnonKey: result.supabaseAnonKey as string,
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Save Supabase settings to chrome.storage.local
 */
export async function saveSettings(settings: SupabaseSettings): Promise<void> {
  await storage.local.set({
    supabaseUrl: settings.supabaseUrl,
    supabaseAnonKey: settings.supabaseAnonKey,
  })
  // Reset client so it reinitializes with new settings
  client = null
  currentUrl = null
  currentKey = null
}

/**
 * Clear stored Supabase settings
 */
export async function clearSettings(): Promise<void> {
  await storage.local.remove(['supabaseUrl', 'supabaseAnonKey'])
  client = null
  currentUrl = null
  currentKey = null
}

/**
 * Check if Supabase is configured
 */
export async function isConfigured(): Promise<boolean> {
  const settings = await getSettings()
  return settings !== null
}

/**
 * Get or create Supabase client. Returns null if not configured.
 */
export async function getClient(): Promise<SupabaseClient | null> {
  const settings = await getSettings()
  if (!settings) return null

  // Reuse existing client if settings haven't changed
  if (client && currentUrl === settings.supabaseUrl && currentKey === settings.supabaseAnonKey) {
    return client
  }

  client = createClient(settings.supabaseUrl, settings.supabaseAnonKey)
  currentUrl = settings.supabaseUrl
  currentKey = settings.supabaseAnonKey
  return client
}

/**
 * Test connection to Supabase by querying the feedback table.
 * Returns { ok: true } or { ok: false, error: string }
 */
export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await getClient()
    if (!supabase) {
      return { ok: false, error: 'Supabase not configured' }
    }

    // Try a lightweight query to verify connectivity and table access
    const { error } = await supabase.from('feedback').select('id').limit(1)
    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        return { ok: false, error: 'Table "feedback" not found. Please create it in your Supabase project.' }
      }
      if (error.code === 'PGRST301' || error.message.includes('JWT')) {
        return { ok: false, error: 'Invalid API key. Check your anon key.' }
      }
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Connection failed'
    if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
      return { ok: false, error: 'Cannot reach Supabase. Check your project URL.' }
    }
    return { ok: false, error: message }
  }
}

/**
 * Submit a feedback report to Supabase.
 * Handles screenshot uploads to Storage and inserts the feedback row.
 */
export async function submitFeedback(
  report: FeedbackReport,
  screenshots: string[],
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const supabase = await getClient()
    if (!supabase) {
      return { ok: false, error: 'Supabase not configured. Open Settings to add your project URL and API key.' }
    }

    // Upload screenshots to Storage if any
    let screenshotUrls: string[] | null = null
    if (screenshots.length > 0) {
      screenshotUrls = await uploadScreenshots(supabase, screenshots)
    }

    // Insert feedback row
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        ...report,
        screenshot_urls: screenshotUrls,
      })
      .select('id')
      .single()

    if (error) {
      return { ok: false, error: friendlyError(error.message, error.code) }
    }

    return { ok: true, id: data?.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Submission failed'
    return { ok: false, error: friendlyError(message) }
  }
}

/**
 * Upload screenshot data URLs to Supabase Storage.
 * Returns an array of public URLs. Fails silently per-screenshot.
 */
async function uploadScreenshots(
  supabase: SupabaseClient,
  screenshots: string[],
): Promise<string[]> {
  const urls: string[] = []
  const timestamp = Date.now()

  for (let i = 0; i < screenshots.length; i++) {
    try {
      const dataUrl = screenshots[i]
      const blob = dataUrlToBlob(dataUrl)
      const ext = blob.type === 'image/png' ? 'png' : 'jpg'
      const path = `feedback/${timestamp}-${i}.${ext}`

      const { error } = await supabase.storage
        .from('screenshots')
        .upload(path, blob, {
          contentType: blob.type,
          upsert: false,
        })

      if (error) {
        console.warn(`Screenshot upload failed (${i}):`, error.message)
        continue
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('screenshots')
        .getPublicUrl(path)

      if (urlData?.publicUrl) {
        urls.push(urlData.publicUrl)
      }
    } catch (err) {
      console.warn(`Screenshot upload error (${i}):`, err)
    }
  }

  return urls.length > 0 ? urls : null as unknown as string[]
}

/**
 * Convert a data URL to a Blob for upload
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: mime })
}

/**
 * Convert error messages to user-friendly text
 */
function friendlyError(message: string, code?: string): string {
  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return 'Cannot reach Supabase. Check your internet connection and project URL.'
  }
  if (code === 'PGRST301' || message.includes('JWT')) {
    return 'Authentication failed. Check your API key in Settings.'
  }
  if (message.includes('relation') && message.includes('does not exist')) {
    return 'The "feedback" table does not exist. Please create it in your Supabase project.'
  }
  if (message.includes('violates row-level security')) {
    return 'Permission denied. Check your Supabase RLS policies allow inserts.'
  }
  if (message.includes('new row violates') || message.includes('not-null')) {
    return 'Missing required fields. Please fill in all required fields.'
  }
  if (message.includes('storage') && message.includes('not found')) {
    return 'Screenshot storage bucket not found. Create a "screenshots" bucket in Supabase Storage.'
  }
  return message
}
