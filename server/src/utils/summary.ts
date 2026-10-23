import { Prisma } from "../generated/prisma/client";

type LoanLike = {
  amount: Prisma.Decimal;
  dueDate: Date;
  repaidAt: Date | null;
};

const pad = (n: number) => String(n).padStart(2, "0");

export function todayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// @db.Date values come back as UTC midnight, so the ISO date part is the stored date
export function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function isOverdue(loan: Pick<LoanLike, "dueDate" | "repaidAt">, today: string) {
  return loan.repaidAt === null && toDateString(loan.dueDate) < today;
}

export function summarize(loans: LoanLike[], today: string) {
  let totalLent = new Prisma.Decimal(0);
  let totalRepaid = new Prisma.Decimal(0);
  let overdue = new Prisma.Decimal(0);

  for (const loan of loans) {
    totalLent = totalLent.add(loan.amount);
    if (loan.repaidAt) totalRepaid = totalRepaid.add(loan.amount);
    if (isOverdue(loan, today)) overdue = overdue.add(loan.amount);
  }

  return {
    totalLent: totalLent.toFixed(2),
    totalRepaid: totalRepaid.toFixed(2),
    overdue: overdue.toFixed(2),
  };
}
