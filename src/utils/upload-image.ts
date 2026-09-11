import cloudinary from "../lib/cloudinary";

interface UploadImageOptions {
  folder?: string;
}

export const uploadImage = async (
  file: Express.Multer.File,
  options: UploadImageOptions = {},
): Promise<string> => {
  const { folder = "uploads" } = options;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result) {
          return reject(new Error("Cloudinary upload failed"));
        }

        resolve(result.secure_url);
      },
    );

    stream.end(file.buffer);
  });
};
