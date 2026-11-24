import "server-only";
import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "./storage";

/** Supprime tous les objets d'un préfixe du stockage (par lots de 1000, limite S3). Renvoie le nombre supprimé. */
export async function deletePrefix(prefix: string) {
  const { client, bucket } = s3();
  let deleted = 0;
  let token: string | undefined;
  do {
    const page = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: token }));
    const keys = (page.Contents ?? []).map((o) => ({ Key: o.Key! }));
    if (keys.length) {
      const res = await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys, Quiet: true } }));
      if (res.Errors?.length) throw new Error(`delete errors: ${res.Errors.length}`);
      deleted += keys.length;
    }
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return deleted;
}

/** Supprime des objets précis (clip, miniature, archive). */
export async function deleteKeys(keys: string[]) {
  if (!keys.length) return;
  const { client, bucket } = s3();
  const res = await client.send(
    new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true } }),
  );
  if (res.Errors?.length) throw new Error(`delete errors: ${res.Errors.length}`);
}
