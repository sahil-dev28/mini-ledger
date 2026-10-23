import { randomInt } from "node:crypto";

export const OTP_TTL_MS = 5 * 60 * 1000;

export function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}
