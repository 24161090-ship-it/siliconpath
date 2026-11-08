import {createClient} from '@supabase/supabase-js';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const cloudReady=!!(url&&key);
export const supabase=cloudReady?createClient(url!,key!):null;
