// Supabase configuration
export const SUPABASE_CONFIG = {
  url: process.env.REACT_APP_SUPABASE_URL || 'https://bovnlcwotthmvqrcpbsg.supabase.co',
  anonKey: process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_jERJWzywqD9JQfqIX32ZpQ_mKWYqpnn',
  bucket: 'posts_images'
};

// Helper function to create Supabase client
export const createSupabaseClient = (accessToken = null) => {
  const { createClient } = require('@supabase/supabase-js');
  
  const config = {
    global: {}
  };
  
  if (accessToken) {
    config.global.headers = {
      Authorization: `Bearer ${accessToken}`
    };
  }
  
  return createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, config);
};

// Helper function to get direct image URL
export const getDirectImageUrl = (imageId) => {
  return `${SUPABASE_CONFIG.url}/storage/v1/object/public/${SUPABASE_CONFIG.bucket}/${imageId}`;
};
