import { z } from "zod";

const phone = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number");

export const requestOtpSchema = z.object({ phone });

export const verifyOtpSchema = z.object({
  phone,
  otp: z.string().trim().regex(/^\d{6}$/, "OTP must be 6 digits"),
});
