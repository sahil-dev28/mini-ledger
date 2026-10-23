import { randomBytes } from "node:crypto";
import multer from "multer";

// extension comes from this map, never from the client's filename,
// so nothing like .html or .svg can end up being served from /uploads
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${randomBytes(4).toString("hex")}${EXTENSIONS[file.mimetype]}`);
  },
});

export const uploadReceipt = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype in EXTENSIONS) {
      cb(null, true);
      return;
    }
    cb(Object.assign(new Error("Only image files are allowed"), { status: 400 }));
  },
}).single("receipt");
