// Supabase configuration
export const SUPABASE_CONFIG = {
  url: 'https://bovnlcwotthmvqrcpbsg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvdm5sY3dvdHRobXZxcmNwYnNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzY1MzgsImV4cCI6MjA3MjcxMjUzOH0.yr9hPr7rUmsf__TUUdrQa_aiaKJvSl94QuuTcoBdAzI',
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
