/**
 * Supabase Storage Integration for LSI
 * Handles audio file uploads with encryption metadata
 *
 * FAITH ALIGNMENT: Secure storage for personal spiritual reflection recordings.
 * Privacy-first approach with end-to-end encryption planned.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase credentials missing. LSI storage will not work.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Storage bucket name for prayer session audio files
 */
const AUDIO_BUCKET = 'prayer-sessions-audio';

/**
 * Initialize storage bucket (create if doesn't exist)
 * This should be run once during app initialization
 */
export async function initializeStorageBucket() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      console.error('❌ Failed to list storage buckets:', listError);
      return { success: false, error: listError };
    }

    const bucketExists = buckets.some(bucket => bucket.name === AUDIO_BUCKET);

    if (!bucketExists) {
      console.log('🪣 Creating prayer-sessions-audio bucket...');

      // Create bucket with public = false (private by default)
      const { data, error } = await supabase
        .storage
        .createBucket(AUDIO_BUCKET, {
          public: false,
          fileSizeLimit: 52428800, // 50 MB limit
          allowedMimeTypes: ['audio/webm', 'audio/ogg', 'audio/wav', 'audio/mp4', 'audio/mpeg']
        });

      if (error) {
        console.error('❌ Failed to create storage bucket:', error);
        return { success: false, error };
      }

      console.log('✅ Prayer sessions audio bucket created successfully');
      return { success: true, data };
    } else {
      console.log('✅ Prayer sessions audio bucket already exists');
      return { success: true, exists: true };
    }
  } catch (error) {
    console.error('❌ Storage bucket initialization error:', error);
    return { success: false, error };
  }
}

/**
 * Upload audio file to Supabase Storage
 *
 * @param {Blob} audioBlob - The recorded audio blob
 * @param {Object} metadata - Session metadata
 * @param {string} metadata.sessionId - UUID of the prayer session
 * @param {string} metadata.userId - Optional user ID (null for anonymous)
 * @param {number} metadata.duration - Recording duration in seconds
 * @returns {Promise<Object>} Upload result with file path
 */
export async function uploadAudioFile(audioBlob, metadata) {
  try {
    console.log('📤 Uploading audio file to Supabase Storage...');
    console.log(`   Size: ${(audioBlob.size / 1024).toFixed(2)} KB`);
    console.log(`   Type: ${audioBlob.type}`);

    // Generate file path
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const userId = metadata.userId || 'anonymous';
    const sessionId = metadata.sessionId;
    const extension = getFileExtension(audioBlob.type);
    const filePath = `${userId}/${sessionId}/${timestamp}.${extension}`;

    console.log(`   Path: ${filePath}`);

    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from(AUDIO_BUCKET)
      .upload(filePath, audioBlob, {
        contentType: audioBlob.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Upload failed:', error);
      return { success: false, error };
    }

    console.log('✅ Audio file uploaded successfully');
    console.log(`   Path: ${data.path}`);

    return {
      success: true,
      filePath: data.path,
      fileSize: Math.round(audioBlob.size / 1024), // KB
      mimeType: audioBlob.type
    };
  } catch (error) {
    console.error('❌ Upload error:', error);
    return { success: false, error };
  }
}

/**
 * Get file extension from MIME type
 *
 * @param {string} mimeType - Audio MIME type
 * @returns {string} File extension
 */
function getFileExtension(mimeType) {
  const mimeMap = {
    'audio/webm': 'webm',
    'audio/webm;codecs=opus': 'webm',
    'audio/ogg': 'ogg',
    'audio/ogg;codecs=opus': 'ogg',
    'audio/wav': 'wav',
    'audio/mp4': 'mp4',
    'audio/mpeg': 'mp3'
  };

  return mimeMap[mimeType] || 'webm'; // Default to webm
}

/**
 * Get signed URL for audio playback
 *
 * @param {string} filePath - File path in storage
 * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns {Promise<Object>} Signed URL result
 */
export async function getAudioUrl(filePath, expiresIn = 3600) {
  try {
    const { data, error } = await supabase
      .storage
      .from(AUDIO_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('❌ Failed to create signed URL:', error);
      return { success: false, error };
    }

    return {
      success: true,
      signedUrl: data.signedUrl
    };
  } catch (error) {
    console.error('❌ Signed URL error:', error);
    return { success: false, error };
  }
}

/**
 * Delete audio file from storage
 *
 * @param {string} filePath - File path in storage
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteAudioFile(filePath) {
  try {
    const { data, error } = await supabase
      .storage
      .from(AUDIO_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('❌ Failed to delete audio file:', error);
      return { success: false, error };
    }

    console.log('✅ Audio file deleted successfully');
    return { success: true, data };
  } catch (error) {
    console.error('❌ Deletion error:', error);
    return { success: false, error };
  }
}

/**
 * Create prayer session record in database
 *
 * @param {Object} sessionData - Session data
 * @returns {Promise<Object>} Database insert result
 */
export async function createPrayerSession(sessionData) {
  try {
    console.log('💾 Creating prayer session record in database...');

    const { data, error } = await supabase
      .from('prayer_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create prayer session:', error);
      return { success: false, error };
    }

    console.log('✅ Prayer session created successfully');
    console.log(`   Session ID: ${data.id}`);

    return { success: true, session: data };
  } catch (error) {
    console.error('❌ Database error:', error);
    return { success: false, error };
  }
}

/**
 * Update prayer session with analysis status
 *
 * @param {string} sessionId - Session UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Update result
 */
export async function updatePrayerSession(sessionId, updates) {
  try {
    const { data, error } = await supabase
      .from('prayer_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to update prayer session:', error);
      return { success: false, error };
    }

    console.log('✅ Prayer session updated successfully');
    return { success: true, session: data };
  } catch (error) {
    console.error('❌ Update error:', error);
    return { success: false, error };
  }
}

/**
 * Get prayer sessions for a user
 *
 * @param {string} userId - User ID (null for anonymous)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Query result
 */
export async function getPrayerSessions(userId = null, options = {}) {
  try {
    let query = supabase
      .from('prayer_sessions')
      .select('*')
      .is('deleted_at', null)
      .order('recorded_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null); // Anonymous sessions
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Failed to fetch prayer sessions:', error);
      return { success: false, error };
    }

    return { success: true, sessions: data };
  } catch (error) {
    console.error('❌ Query error:', error);
    return { success: false, error };
  }
}

export default {
  initializeStorageBucket,
  uploadAudioFile,
  getAudioUrl,
  deleteAudioFile,
  createPrayerSession,
  updatePrayerSession,
  getPrayerSessions
};
