// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pvyyhjkrmnlggwuxiyny.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2eXloamtybW5sZ2d3dXhpeW55Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NzE1ODUsImV4cCI6MjA2NTM0NzU4NX0.4LHN6C9dfG5T6OoX3YRAEVGh8X9p1Hz3iYnuZSUNDCA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);