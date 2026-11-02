// Deploy with the Supabase CLI after `supabase login` and `supabase link`.
// Secrets SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY
// are provided by the platform. Do not paste the service role key into the site.
//
//   supabase functions deploy delete-account
//
// The site calls this after delete_my_data(). Until it is deployed, account
// data rows can be removed but the login email remains.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405 });
  }
  const url = Deno.env.get('SUPABASE_URL') ?? '';
  const anon = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const authHeader = req.headers.get('Authorization') ?? '';
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data.user) {
    return new Response(JSON.stringify({ ok: false, reason: 'unauthorized' }), { status: 401 });
  }
  const admin = createClient(url, service);
  const removed = await admin.auth.admin.deleteUser(data.user.id);
  if (removed.error) {
    return new Response(JSON.stringify({ ok: false, reason: 'failed' }), { status: 500 });
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
});
