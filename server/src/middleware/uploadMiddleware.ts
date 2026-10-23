import { randomBytes } from "node:crypto";
import path from "node:path";
import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`);
  },
});

export const uploadReceipt = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(Object.assign(new Error("Only image files are allowed"), { status: 400 }));
  },
}).single("receipt");
