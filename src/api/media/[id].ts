// /pages/api/media/[id].ts (Next.js example)

import { supabase } from '@/lib/supabaseClient';

export default async function handler(req, res) {
  const { id } = req.query;

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(req.headers.authorization);

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Fetch the item metadata
  const { data: item, error } = await supabase
    .from('library_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !item) {
    return res.status(404).json({ error: 'Media not found' });
  }

  // Check access: either public or user owns it
  if (item.is_locked && item.created_by !== user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // Generate signed URL
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from('sacred-library')
    .createSignedUrl(item.file_url, 3600); // 1 hour

  if (signedUrlError || !signedUrlData?.signedUrl) {
    return res.status(500).json({ error: 'Failed to generate signed URL' });
  }

  return res.status(200).json({ url: signedUrlData.signedUrl });
}
