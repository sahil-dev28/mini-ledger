import { z } from "zod";

function isRealDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  // catches things like 2026-02-30 which Date silently rolls over
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const createLoanSchema = z.object({
  friendName: z.string().trim().min(1, "Enter a name").max(50, "Name is too long"),
  // kept as a string so it goes into the Decimal column without float rounding
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Enter a valid amount (max 2 decimals)", abort: true })
    .refine((v) => Number(v) > 0, "Amount must be greater than 0")
    .refine((v) => Number(v) <= 10_000_000, "Amount is too large"),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .refine(isRealDate, "Invalid date"),
});

export const loanIdSchema = z.object({
  id: z.uuid("Invalid loan id"),
});
