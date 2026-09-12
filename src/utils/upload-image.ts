import cloudinary from "../lib/cloudinary";

interface UploadImageOptions {
  folder?: string;
}

export const uploadImage = async (
  file: Express.Multer.File,
  options: UploadImageOptions = {},
): Promise<string> => {
  const { folder = "uploads" } = options;

  return new Promise((resolve) => {
    try {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result?.secure_url) {
            console.warn(
              "Cloudinary upload failed (falling back to image data URI):",
              error?.message || error,
            );
            const fallbackDataUri = `data:${file.mimetype || "image/jpeg"};base64,${file.buffer.toString("base64")}`;
            return resolve(fallbackDataUri);
          }

          resolve(result.secure_url);
        },
      );

      stream.end(file.buffer);
    } catch (err: any) {
      console.warn("Cloudinary stream error (falling back to image data URI):", err?.message || err);
      const fallbackDataUri = `data:${file.mimetype || "image/jpeg"};base64,${file.buffer.toString("base64")}`;
      resolve(fallbackDataUri);
    }
  });
};
