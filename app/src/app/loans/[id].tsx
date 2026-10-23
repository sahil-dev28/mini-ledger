import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { getLoan, queryKeys, receiptUri, useRepayLoan } from "@/lib/api";
import { formatDate, formatMoney, toYmd } from "@/lib/format";
import { colors } from "@/lib/theme";

export default function LoanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: loan, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.loan(id),
    queryFn: () => getLoan(id),
  });
  const repay = useRepayLoan();

  if (isPending) return <ActivityIndicator style={styles.center} size="large" />;

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error.message}</Text>
        <Pressable onPress={() => refetch()}>
          <Text style={styles.retry}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const repaid = loan.repaidAt !== null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Stack.Screen options={{ title: loan.friendName }} />

      <Text style={styles.amount}>{formatMoney(loan.amount)}</Text>

      <View style={styles.dueRow}>
        <Text style={styles.meta}>Due {formatDate(loan.dueDate)}</Text>
        {repaid && <Text style={[styles.tag, styles.tagRepaid]}>REPAID</Text>}
        {loan.isOverdue && <Text style={[styles.tag, styles.tagOverdue]}>OVERDUE</Text>}
      </View>
      <Text style={styles.meta}>Added {formatDate(toYmd(new Date(loan.createdAt)))}</Text>
      {loan.repaidAt && (
        <Text style={styles.meta}>Repaid on {formatDate(toYmd(new Date(loan.repaidAt)))}</Text>
      )}

      <Text style={styles.section}>Receipt</Text>
      {loan.receiptUrl ? (
        <Image
          source={{ uri: receiptUri(loan.receiptUrl) }}
          style={styles.receipt}
          contentFit="contain"
        />
      ) : (
        <View style={styles.noReceipt}>
          <Text style={styles.meta}>No receipt</Text>
        </View>
      )}

      {!repaid && (
        <Pressable
          style={[styles.button, repay.isPending && styles.disabled]}
          onPress={() => repay.mutate(loan.id)}
          disabled={repay.isPending}
        >
          <Text style={styles.buttonText}>{repay.isPending ? "Saving..." : "Mark repaid"}</Text>
        </Pressable>
      )}
      {repay.error && <Text style={styles.error}>{repay.error.message}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  amount: { fontSize: 34, fontWeight: "700", color: colors.text },
  dueRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  meta: { fontSize: 14, color: colors.muted, marginTop: 4 },
  tag: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
    marginTop: 4,
  },
  tagOverdue: { backgroundColor: colors.danger },
  tagRepaid: { backgroundColor: colors.success },
  section: { fontSize: 13, color: colors.muted, marginTop: 24, marginBottom: 8 },
  receipt: { width: "100%", height: 300, borderRadius: 10, backgroundColor: "#e5e7eb" },
  noReceipt: {
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 28,
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  error: { color: colors.danger, textAlign: "center", marginTop: 12 },
  retry: { color: colors.primary, marginTop: 12, fontSize: 15, fontWeight: "600" },
});
