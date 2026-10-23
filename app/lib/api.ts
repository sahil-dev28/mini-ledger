import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./auth-store";

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

export type Loan = {
  id: string;
  friendName: string;
  amount: string;
  dueDate: string;
  repaidAt: string | null;
  receiptUrl: string | null;
  isOverdue: boolean;
  createdAt: string;
};

export type Summary = {
  totalLent: string;
  totalRepaid: string;
  overdue: string;
};

export type ReceiptFile = { uri: string; name: string; type: string };

export class ApiError extends Error {
  status: number;
  details?: Record<string, string[]>;

  constructor(message: string, status: number, details?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const queryKeys = {
  loans: ["loans"] as const,
  loan: (id: string) => ["loans", id] as const,
  summary: ["summary"] as const,
};

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (typeof init.body === "string") headers.set("Content-Type", "application/json");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers, signal: controller.signal });
  } catch {
    throw new ApiError("Can't reach server. Check API URL / Wi-Fi.", 0);
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401 && token) await useAuthStore.getState().logout();
    throw new ApiError(data?.error ?? "Something went wrong", res.status, data?.details);
  }

  return data as T;
}

export function receiptUri(path: string) {
  return `${API_URL}${path}`;
}

export function requestOtp(phone: string) {
  return request<{ message: string }>("/auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export function verifyOtp(phone: string, otp: string) {
  return request<{ token: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ phone, otp }),
  });
}

export const getLoans = () => request<Loan[]>("/loans");
export const getLoan = (id: string) => request<Loan>(`/loans/${id}`);
export const getSummary = () => request<Summary>("/loans/summary");

export function createLoan(input: {
  friendName: string;
  amount: string;
  dueDate: string;
  receipt?: ReceiptFile;
}) {
  const form = new FormData();
  form.append("friendName", input.friendName);
  form.append("amount", input.amount);
  form.append("dueDate", input.dueDate);
  if (input.receipt) {
    // React Native's FormData takes this { uri, name, type } shape for files
    form.append("receipt", input.receipt as unknown as Blob);
  }
  return request<Loan>("/loans", { method: "POST", body: form });
}

export function repayLoan(id: string) {
  return request<Loan>(`/loans/${id}/repay`, { method: "PATCH" });
}

export function useRepayLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: repayLoan,
    onSuccess: (loan) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.loans });
      queryClient.invalidateQueries({ queryKey: queryKeys.loan(loan.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary });
    },
  });
}
