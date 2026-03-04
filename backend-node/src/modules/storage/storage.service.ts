import * as Minio from "minio";
import { AppError } from "../../common/app-error";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

let _client: Minio.Client | null = null;

function getClient(): Minio.Client {
  if (!_client) {
    _client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
      port: Number(process.env.MINIO_PORT ?? 9000),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY ?? "admin",
      secretKey: process.env.MINIO_SECRET_KEY ?? "admin123",
    });
  }
  return _client;
}

const BUCKET = process.env.MINIO_BUCKET ?? "nutrifit";

export async function ensureBucket(): Promise<void> {
  const client = getClient();
  const exists = await client.bucketExists(BUCKET);
  if (!exists) {
    await client.makeBucket(BUCKET);
    const policy = JSON.stringify({
      Version: "2012-10-17",
      Statement: [{ Effect: "Allow", Principal: { AWS: ["*"] }, Action: ["s3:GetObject"], Resource: [`arn:aws:s3:::${BUCKET}/*`] }],
    });
    await client.setBucketPolicy(BUCKET, policy);
  }
}

export async function uploadFile(
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  folder = "uploads"
): Promise<string> {
  if (!ALLOWED_TYPES.includes(mimeType)) throw new AppError("File type not allowed", 400);
  if (buffer.length > MAX_SIZE_BYTES) throw new AppError("File too large (max 5MB)", 400);
  const ext = originalName.split(".").pop() ?? "jpg";
  const objectName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  await getClient().putObject(BUCKET, objectName, buffer, buffer.length, { "Content-Type": mimeType });
  const endpoint = process.env.MINIO_ENDPOINT ?? "localhost";
  const port = process.env.MINIO_PORT ?? "9000";
  const ssl = process.env.MINIO_USE_SSL === "true";
  return `${ssl ? "https" : "http"}://${endpoint}:${port}/${BUCKET}/${objectName}`;
}

export async function deleteFile(objectName: string): Promise<void> {
  await getClient().removeObject(BUCKET, objectName);
}

export async function getPresignedUrl(objectName: string, expirySeconds = 3600): Promise<string> {
  return getClient().presignedGetObject(BUCKET, objectName, expirySeconds);
}
