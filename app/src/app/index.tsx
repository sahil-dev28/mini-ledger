import { useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { LoanItem } from "@/components/loan-item";
import { SummaryCard } from "@/components/summary-card";
import { getLoans, getSummary, queryKeys, useRepayLoan } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { colors } from "@/lib/theme";

export default function HomeScreen() {
  const logout = useAuthStore((s) => s.logout);
  const loans = useQuery({ queryKey: queryKeys.loans, queryFn: getLoans });
  const summary = useQuery({ queryKey: queryKeys.summary, queryFn: getSummary });
  const repay = useRepayLoan();

  const refreshing = loans.isRefetching || summary.isRefetching;
  const error = loans.error ?? summary.error;

  function refresh() {
    loans.refetch();
    summary.refetch();
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable onPress={logout} hitSlop={8}>
              <Text style={styles.logout}>Logout</Text>
            </Pressable>
          ),
        }}
      />

      {loans.isPending && !error && <ActivityIndicator style={styles.center} size="large" />}

      {error && !loans.data && (
        <View style={styles.center}>
          <Text style={styles.error}>{error.message}</Text>
          <Pressable onPress={refresh} disabled={loans.isFetching}>
            <Text style={styles.retry}>{loans.isFetching ? "Retrying..." : "Retry"}</Text>
          </Pressable>
        </View>
      )}

      {loans.data && (
        <FlatList
          data={loans.data}
          keyExtractor={(loan) => loan.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={summary.data ? <SummaryCard summary={summary.data} /> : null}
          ListEmptyComponent={<Text style={styles.empty}>No loans yet. Tap + to add one.</Text>}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
          renderItem={({ item }) => (
            <LoanItem
              loan={item}
              onPress={() => router.push(`/loans/${item.id}`)}
              onRepay={() => repay.mutate(item.id)}
              repaying={repay.isPending && repay.variables === item.id}
            />
          )}
        />
      )}

      <Pressable style={styles.fab} onPress={() => router.push("/loans/new")}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, paddingBottom: 100 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  // native headers already pad the right side, web doesn't
  logout: { color: colors.primary, fontSize: 15, paddingHorizontal: Platform.OS === "web" ? 16 : 0 },
  error: { color: colors.danger, textAlign: "center" },
  retry: { color: colors.primary, marginTop: 12, fontSize: 15, fontWeight: "600" },
  empty: { textAlign: "center", color: colors.muted, marginTop: 32 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 32,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: { color: "#fff", fontSize: 30, lineHeight: 32 },
});
