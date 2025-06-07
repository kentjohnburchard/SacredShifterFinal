import { v4 as uuidv4 } from 'uuid';

export function generateLibraryPath({
  fileType,
  userId,
  originalFilename
}: {
  fileType: string; // 'audio', 'video', etc.
  userId: string;
  originalFilename: string;
}) {
  const fileExtension = originalFilename.split('.').pop();
  const fileId = uuidv4();
  return `${fileType}/${userId}/${fileId}.${fileExtension}`;
}
