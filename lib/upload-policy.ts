export const UPLOAD_LIMITS_MB = {
  avatar: 5,
  reportAttachment: 10,
  reportVideo: 50,
  submissionAttachment: 25,
  submissionVideo: 50,
  taskAttachment: 25,
  application: 10,
  taskImport: 10,
} as const;

export const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm"]);

export const ATTACHMENT_MIME_TYPES = new Set([
  ...IMAGE_MIME_TYPES,
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/vnd.rar",
  "application/x-7z-compressed",
]);

export function exceedsUploadLimit(file: File, maxSizeMb: number): boolean {
  return file.size > maxSizeMb * 1024 * 1024;
}
