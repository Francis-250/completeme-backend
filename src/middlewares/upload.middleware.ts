import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      /\.(jpg|jpeg|png|gif|webp|svg|avif|bmp|tiff)$/i.test(file.originalname)
    ) {
      return cb(null, true);
    }

    cb(new Error("Only image files are allowed"));
  },
});
