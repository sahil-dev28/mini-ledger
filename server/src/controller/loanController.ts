import path from "node:path";
import type { Request, Response } from "express";
import type { z } from "zod";
import type { Loan } from "../generated/prisma/client";
import type { createLoanSchema } from "../schema/loan";
import prisma from "../utils/prisma";
import { isOverdue, summarize, todayString, toDateString } from "../utils/summary";

type IdParams = { id: string };

function serializeLoan(loan: Loan, today: string) {
  return {
    id: loan.id,
    friendName: loan.friendName,
    amount: loan.amount.toFixed(2),
    dueDate: toDateString(loan.dueDate),
    repaidAt: loan.repaidAt?.toISOString() ?? null,
    receiptUrl: loan.receiptPath ? `/uploads/${loan.receiptPath}` : null,
    isOverdue: isOverdue(loan, today),
    createdAt: loan.createdAt.toISOString(),
  };
}

function findOwnLoan(id: string, userId: string) {
  return prisma.loan.findFirst({ where: { id, userId } });
}

export async function listLoans(req: Request, res: Response) {
  const loans = await prisma.loan.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "desc" },
  });
  const today = todayString();
  res.json(loans.map((loan) => serializeLoan(loan, today)));
}

export async function getSummary(req: Request, res: Response) {
  const loans = await prisma.loan.findMany({
    where: { userId: req.userId! },
    select: { amount: true, dueDate: true, repaidAt: true },
  });
  res.json(summarize(loans, todayString()));
}

export async function getLoan(req: Request<IdParams>, res: Response) {
  const loan = await findOwnLoan(req.params.id, req.userId!);
  if (!loan) {
    res.status(404).json({ error: "Loan not found" });
    return;
  }
  res.json(serializeLoan(loan, todayString()));
}

export async function createLoan(req: Request, res: Response) {
  const { friendName, amount, dueDate } = req.body as z.infer<typeof createLoanSchema>;

  const loan = await prisma.loan.create({
    data: {
      userId: req.userId!,
      friendName,
      amount,
      dueDate: new Date(`${dueDate}T00:00:00Z`),
      receiptPath: req.file ? path.basename(req.file.path) : null,
    },
  });

  res.status(201).json(serializeLoan(loan, todayString()));
}

export async function repayLoan(req: Request<IdParams>, res: Response) {
  const loan = await findOwnLoan(req.params.id, req.userId!);
  if (!loan) {
    res.status(404).json({ error: "Loan not found" });
    return;
  }
  if (loan.repaidAt) {
    res.status(400).json({ error: "Loan already repaid" });
    return;
  }

  const updated = await prisma.loan.update({
    where: { id: loan.id },
    data: { repaidAt: new Date() },
  });
  res.json(serializeLoan(updated, todayString()));
}
