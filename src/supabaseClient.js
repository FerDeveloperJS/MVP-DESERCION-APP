// supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ecgsnvpwwxdhpcplzcut.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZ3NudnB3d3hkaHBjcGx6Y3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDQyMDcsImV4cCI6MjA5NTI4MDIwN30.q_7m5vl2PCTCWDmd8EyZctJUWhZhVISXNE4Ln8mPIfA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
