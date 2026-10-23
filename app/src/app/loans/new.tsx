import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import type { UseFormSetError } from "react-hook-form";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

import { LoanForm, type LoanFormValues } from "@/components/loan-form";
import { ApiError, createLoan, queryKeys } from "@/lib/api";
import { toYmd } from "@/lib/format";

export default function NewLoanScreen() {
  const queryClient = useQueryClient();
  const create = useMutation({ mutationFn: createLoan });

  async function handleSubmit(values: LoanFormValues, setError: UseFormSetError<LoanFormValues>) {
    try {
      await create.mutateAsync({
        friendName: values.friendName,
        amount: values.amount,
        dueDate: toYmd(values.dueDate),
        receipt: values.receipt,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.loans });
      queryClient.invalidateQueries({ queryKey: queryKeys.summary });
      router.back();
    } catch (e) {
      // show server-side field errors next to the matching input
      if (e instanceof ApiError && e.details) {
        for (const [field, messages] of Object.entries(e.details)) {
          setError(field as keyof LoanFormValues, { message: messages[0] });
        }
      }
    }
  }

  // field errors are shown on the inputs, anything else goes under the form
  const error = create.error;
  const serverError = error && !(error instanceof ApiError && error.details) ? error.message : undefined;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <LoanForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitting={create.isPending}
          serverError={serverError}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
});
