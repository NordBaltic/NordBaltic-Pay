import { supabase } from '../../lib/supabase';

export default async function handler(req, res) {
  const { data: user, error } = await supabase.auth.getUser();

  if (error) return res.status(401).json({ error: error.message });

  res.status(200).json({ user });
}
