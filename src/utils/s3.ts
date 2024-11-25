import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";
import type { Readable } from "stream";

const datasetBucket = "llama-bridges-data";
const s3Client = new S3Client({});

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
