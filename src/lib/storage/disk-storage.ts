import fs from 'fs';
import path from 'path';

export interface SavedFileResult {
  fileName: string;
  fileUrl: string;
  filePath: string;
  fileSize: string;
  fileType: string;
}

export async function saveUploadedFile(
  fileBuffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<SavedFileResult> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(originalName) || (mimeType === 'application/pdf' ? '.pdf' : '.jpg');
  const sanitizedBase = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 40);

  const uniqueFileName = `${Date.now()}_${sanitizedBase}${ext}`;
  const targetFilePath = path.join(uploadDir, uniqueFileName);

  await fs.promises.writeFile(targetFilePath, fileBuffer);

  const bytes = fileBuffer.length;
  let fileSize = `${bytes} B`;
  if (bytes > 1024 * 1024) {
    fileSize = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  } else if (bytes > 1024) {
    fileSize = `${(bytes / 1024).toFixed(0)} KB`;
  }

  const fileType = ext.replace('.', '').toUpperCase();

  return {
    fileName: uniqueFileName,
    fileUrl: `/uploads/${uniqueFileName}`,
    filePath: targetFilePath,
    fileSize,
    fileType,
  };
}
