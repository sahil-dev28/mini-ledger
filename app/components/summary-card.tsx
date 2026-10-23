import { StyleSheet, Text, View } from "react-native";

import type { Summary } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import { colors } from "@/lib/theme";

export function SummaryCard({ summary }: { summary: Summary }) {
  const outstanding = Number(summary.totalLent) - Number(summary.totalRepaid);

  return (
    <View style={styles.card}>
      <Text style={styles.caption}>Outstanding</Text>
      <Text style={styles.big}>{formatMoney(outstanding)}</Text>

      <View style={styles.row}>
        <Stat label="Total lent" value={summary.totalLent} />
        <Stat label="Repaid" value={summary.totalRepaid} />
        <Stat label="Overdue" value={summary.overdue} danger />
      </View>
    </View>
  );
}

function Stat({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <View>
      <Text style={[styles.statLabel, danger && styles.danger]}>{label}</Text>
      <Text style={[styles.statValue, danger && styles.danger]}>{formatMoney(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.dark,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  caption: { color: "#9ca3af", fontSize: 13 },
  big: { color: "#fff", fontSize: 30, fontWeight: "700", marginTop: 2 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  statLabel: { color: "#9ca3af", fontSize: 12 },
  statValue: { color: "#fff", fontSize: 15, fontWeight: "600", marginTop: 2 },
  danger: { color: "#f87171" },
});
