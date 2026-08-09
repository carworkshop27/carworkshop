import { createClient } from '@supabase/supabase-js';

// 🚨 HARDCODED TEST: Replace these strings with your actual keys
// Make sure the URL ends in .co (NO /rest/v1 at the end!)
const hardcodedUrl = 'https://qszmdfpftqetifngbaxc.supabase.co'; 
const hardcodedKey = 'eyJhbGciOiJIUzI1NiIsIn...'; // <-- Paste your full Anon Key here

console.log("🔗 Testing Hardcoded URL:", hardcodedUrl);

export const supabase = createClient(hardcodedUrl, hardcodedKey);