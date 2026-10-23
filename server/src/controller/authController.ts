import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { z } from "zod";
import type { requestOtpSchema, verifyOtpSchema } from "../schema/auth";
import { generateOtp, OTP_TTL_MS } from "../utils/otp";
import prisma from "../utils/prisma";

export async function requestOtp(req: Request, res: Response) {
  const { phone } = req.body as z.infer<typeof requestOtpSchema>;
  const code = generateOtp();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.otp.upsert({
    where: { phone },
    create: { phone, codeHash, expiresAt },
    update: { codeHash, expiresAt },
  });

  // mock SMS
  console.log(`OTP for ${phone}: ${code}`);

  res.json({ message: "OTP sent" });
}

export async function verifyOtp(req: Request, res: Response) {
  const { phone, otp } = req.body as z.infer<typeof verifyOtpSchema>;
  const record = await prisma.otp.findUnique({ where: { phone } });

  const valid =
    record !== null &&
    record.expiresAt > new Date() &&
    (await bcrypt.compare(otp, record.codeHash));

  if (!valid) {
    res.status(401).json({ error: "Invalid or expired OTP" });
    return;
  }

  await prisma.otp.delete({ where: { phone } });

  const user = await prisma.user.upsert({
    where: { phone },
    create: { phone },
    update: {},
  });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });

  res.json({ token });
}
