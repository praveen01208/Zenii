/**
 * Cookie options that work for both local dev (same-origin via Vite proxy)
 * and Render production (cross-origin: static frontend ↔ backend web service).
 *
 * Production:  sameSite:'none' + secure:true  → cross-origin cookies allowed
 * Development: sameSite:'lax'  + secure:false → works over http://localhost
 */
const isProd = process.env.NODE_ENV === 'production';

export const cookieOpts = {
  httpOnly: true,
  sameSite: isProd ? 'none' : 'lax',
  secure:   isProd,
};
