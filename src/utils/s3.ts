import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import type { Readable } from "stream";

const datasetBucket = "llama-bridges-data";
const s3Client = new S3Client({});

const backupBucket = process.env.AWS_S3_BACKUP_BUCKET;
const backupClient =
  process.env.BB_AWS_S3_ENDPOINT && process.env.BB_AWS_REGION
    ? new S3Client({
        endpoint: process.env.BB_AWS_S3_ENDPOINT,
        region: process.env.BB_AWS_REGION,
        forcePathStyle: true,
      })
    : null;

function next21Minutedate() {
  const dt = new Date();
  dt.setHours(dt.getHours() + 1);
  dt.setMinutes(21);
  return dt;
}

export async function store(
  filename: string,
  body: string | Readable | Buffer,
  hourlyCache = false,
  compressed = true
) {
  const params = {
    Bucket: datasetBucket,
    Key: filename,
    Body: body,
    ACL: ObjectCannedACL.public_read,
    ...(hourlyCache && {
      Expires: next21Minutedate(),
      ...(compressed && {
        ContentEncoding: "br",
      }),
      ContentType: "application/json",
    }),
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
}

export async function storeDataset(filename: string, body: string) {
  const params = {
    Bucket: datasetBucket,
    Key: `temp/${filename}`,
    Body: body,
    ACL: ObjectCannedACL.public_read,
    ContentType: "text/csv",
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
}

export async function storeBackup(key: string, body: string | Readable | Buffer) {
  if (!backupBucket && !backupClient) {
    throw new Error("No backup client configured");
  }

  const params = {
    Bucket: backupBucket ?? datasetBucket,
    Key: key,
    Body: body,
  };

  const command = new PutObjectCommand(params);
  await backupClient?.send(command);
}
