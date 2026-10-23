import fs from "node:fs/promises";
import path from "node:path";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import multer from "multer";
import { ZodError, z } from "zod";
import { requireAuth } from "./middleware/authMiddleware";
import authRoutes from "./routes/authRoutes";
import loanRoutes from "./routes/loanRoutes";
import { formatUnknownError } from "./utils/formatUnknownError";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/loans", requireAuth, loanRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  // if the request failed after multer saved a receipt, don't leave it lying around
  if (req.file) fs.unlink(req.file.path).catch(() => {});

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: z.flattenError(err).fieldErrors,
    });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE" ? "Receipt must be under 5 MB" : err.message;
    res.status(400).json({ error: message });
    return;
  }

  // errors we throw on purpose carry a status
  if (typeof err?.status === "number" && err.status < 500) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  console.error(formatUnknownError(err));
  res.status(500).json({ error: "Something went wrong" });
};

app.use(errorHandler);

export default app;
