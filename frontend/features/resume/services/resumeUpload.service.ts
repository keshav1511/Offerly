import { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/lib/supabase/client";
import { Database } from "@/lib/supabase/types";

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadControl {
  promise: Promise<string>;
  abort: () => void;
}

/**
 * Service to handle uploading resumes to Supabase Storage with progress, cancellation, and retry capability.
 */
export class ResumeUploadService {
  private readonly client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database> = defaultClient) {
    this.client = client;
  }

  /**
   * Helper to retrieve active authenticated user's ID.
   */
  private async getCurrentUserId(): Promise<string> {
    const { data: { user }, error } = await this.client.auth.getUser();
    if (error || !user) {
      throw new Error("Authentication required.");
    }
    return user.id;
  }

  /**
   * Uploads a resume file using a signed upload URL to track progress and support abort/retry.
   * 
   * Signed URL approach explanation:
   * Standard authenticated supabase.storage.upload() uses standard fetch() which does not expose
   * upload progress callbacks or easy native progress hooks in @supabase/supabase-js.
   * By requesting a signed upload URL, we can use a native XMLHttpRequest PUT client in the browser,
   * gaining access to:
   * 1. xhr.upload.onprogress - for real-time progress calculations.
   * 2. xhr.abort() - for immediate, safe client-side upload cancellation.
   */
  upload(
    file: File,
    onProgress: UploadProgressCallback
  ): UploadControl {
    let xhr: XMLHttpRequest | null = null;
    let aborted = false;

    const promise = (async () => {
      const userId = await this.getCurrentUserId();
      const uuid = crypto.randomUUID();
      
      // Extract file extension
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || (extension !== "pdf" && extension !== "docx")) {
        throw new Error("Invalid file extension. Only PDF and DOCX files are allowed.");
      }

      // Format path as {userId}/{uuid}.{extension}
      const storagePath = `${userId}/${uuid}.${extension}`;

      // 1. Create a signed upload URL
      const { data, error: signedUrlError } = await this.client.storage
        .from("resumes")
        .createSignedUploadUrl(storagePath);

      if (signedUrlError || !data?.signedUrl) {
        throw new Error(`Failed to generate signed upload URL: ${signedUrlError?.message || "Unknown error"}`);
      }

      if (aborted) {
        throw new Error("Upload aborted by user.");
      }

      // 2. Perform raw XHR PUT request to signed URL
      return new Promise<string>((resolve, reject) => {
        xhr = new XMLHttpRequest();
        xhr.open("PUT", data.signedUrl, true);

        // Upload progress tracking
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100);
            onProgress(percentage);
          }
        };

        xhr.onload = () => {
          if (xhr && xhr.status >= 200 && xhr.status < 300) {
            resolve(storagePath);
          } else {
            reject(new Error(`Storage upload failed with status code ${xhr?.status || 500}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Network error during resume upload."));
        };

        xhr.onabort = () => {
          reject(new Error("Upload aborted by user."));
        };

        xhr.send(file);
      });
    })();

    return {
      promise,
      abort: () => {
        aborted = true;
        if (xhr) {
          xhr.abort();
        }
      },
    };
  }
}

export const resumeUploadService = new ResumeUploadService();
