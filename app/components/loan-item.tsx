import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Loan } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { colors } from "@/lib/theme";

type Props = {
  loan: Loan;
  onPress: () => void;
  onRepay: () => void;
  repaying: boolean;
};

export function LoanItem({ loan, onPress, onRepay, repaying }: Props) {
  const repaid = loan.repaidAt !== null;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, loan.isOverdue && styles.overdue, repaid && styles.repaid]}
    >
      <View style={styles.left}>
        <Text style={styles.name}>{loan.friendName}</Text>
        <Text style={styles.due}>
          Due {formatDate(loan.dueDate)}
          {loan.receiptUrl ? "  📎" : ""}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>{formatMoney(loan.amount)}</Text>
        {repaid ? (
          <Text style={[styles.tag, styles.tagRepaid]}>REPAID</Text>
        ) : (
          <View style={styles.actions}>
            {loan.isOverdue && <Text style={[styles.tag, styles.tagOverdue]}>OVERDUE</Text>}
            <Pressable onPress={onRepay} disabled={repaying} hitSlop={6}>
              <Text style={[styles.repayButton, repaying && { opacity: 0.5 }]}>
                {repaying ? "Saving..." : "Mark repaid"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  overdue: {
    backgroundColor: colors.dangerBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.danger,
  },
  repaid: { opacity: 0.45 },
  left: { flex: 1, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600", color: colors.text },
  due: { fontSize: 13, color: colors.muted, marginTop: 3 },
  right: { alignItems: "flex-end", gap: 6 },
  amount: { fontSize: 16, fontWeight: "700", color: colors.text },
  actions: { flexDirection: "row", alignItems: "center", gap: 8 },
  tag: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  tagOverdue: { backgroundColor: colors.danger },
  tagRepaid: { backgroundColor: colors.success },
  repayButton: {
    fontSize: 12,
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
});
