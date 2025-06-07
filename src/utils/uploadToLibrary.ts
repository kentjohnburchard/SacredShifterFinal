import { supabase } from '@/lib/supabaseClient';
import { generateLibraryPath } from './generateLibraryPath';

export async function uploadToLibrary({
  file,
  fileType,
  userId
}: {
  file: File;
  fileType: string;
  userId: string;
}) {
  const path = generateLibraryPath({
    fileType,
    userId,
    originalFilename: file.name
  });

  const { data, error } = await supabase.storage
    .from('sacred-library')
    .upload(path, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  return {
    path,
    publicUrl: null // never use public URL for protected bucket
  };
}
