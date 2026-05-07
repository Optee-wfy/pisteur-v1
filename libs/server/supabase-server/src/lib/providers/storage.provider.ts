import { supabase } from "../supabase";

const PUBLIC_BUCKETS_PATH = "storage/v1/object/public";
/**
 * Interact with the supabase storage.
 * @see https://supabase.com/docs/guides/storage/quickstart?queryGroups=language&language=javascript
 */
export const StorageProvider = {
  async uploadFile({
    file,
    bucketName,
    fileName,
  }: {
    file: Blob;
    fileName: string;
    bucketName: string;
  }) {
    // @todo Remplacer exists/remove par upload(..., { upsert: true })
    const fileExists = await supabase.storage.from(bucketName).exists(fileName);

    if (fileExists) {
      await supabase.storage.from(bucketName).remove([fileName]);
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (error) {
      throw new Error("Failed to upload file: " + error.message);
    }

    const url = [
      process.env["VITE_SUPABASE_URL"],
      PUBLIC_BUCKETS_PATH,
      data.fullPath,
    ].join("/");

    return url;
  },
};
