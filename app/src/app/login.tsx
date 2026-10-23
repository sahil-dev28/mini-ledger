import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { requestOtp, verifyOtp } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { colors } from "@/lib/theme";

const PHONE_REGEX = /^[6-9]\d{9}$/;
const OTP_REGEX = /^\d{6}$/;

export default function LoginScreen() {
  const setToken = useAuthStore((s) => s.setToken);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = useMutation({
    mutationFn: () => requestOtp(phone),
    onSuccess: () => {
      setOtpSent(true);
      setError(null);
    },
    onError: (e) => setError(e.message),
  });

  const verify = useMutation({
    mutationFn: () => verifyOtp(phone, otp),
    onSuccess: ({ token }) => setToken(token),
    onError: (e) => setError(e.message),
  });

  function handleSend() {
    if (!PHONE_REGEX.test(phone)) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    sendOtp.mutate();
  }

  function handleVerify() {
    if (!OTP_REGEX.test(otp)) {
      setError("OTP must be 6 digits");
      return;
    }
    verify.mutate();
  }

  function changeNumber() {
    setOtpSent(false);
    setOtp("");
    setError(null);
  }

  const busy = sendOtp.isPending || verify.isPending;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.title}>MiniLedger</Text>
        <Text style={styles.subtitle}>Keep track of money you lend to friends</Text>

        <Text style={styles.label}>Phone number</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.prefix}>+91</Text>
          <TextInput
            style={[styles.input, styles.phoneInput]}
            value={phone}
            onChangeText={setPhone}
            placeholder="98765 43210"
            keyboardType="number-pad"
            maxLength={10}
            editable={!otpSent}
          />
        </View>

        {!otpSent ? (
          <Pressable
            style={[styles.button, busy && styles.buttonDisabled]}
            onPress={handleSend}
            disabled={busy}
          >
            <Text style={styles.buttonText}>{sendOtp.isPending ? "Sending..." : "Send OTP"}</Text>
          </Pressable>
        ) : (
          <>
            <Text style={styles.label}>Enter 6-digit OTP</Text>
            <TextInput
              style={[styles.input, styles.otpInput]}
              value={otp}
              onChangeText={setOtp}
              placeholder="••••••"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />
            <Text style={styles.hint}>Check the server terminal for your OTP</Text>

            <Pressable
              style={[styles.button, busy && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={busy}
            >
              <Text style={styles.buttonText}>
                {verify.isPending ? "Verifying..." : "Verify & Login"}
              </Text>
            </Pressable>
            <Pressable onPress={changeNumber} disabled={busy}>
              <Text style={styles.link}>Change number</Text>
            </Pressable>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 24, justifyContent: "center" },
  title: { fontSize: 32, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 15, color: colors.muted, marginTop: 4, marginBottom: 32 },
  label: { fontSize: 13, color: colors.muted, marginTop: 16, marginBottom: 6 },
  phoneRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  prefix: { fontSize: 16, fontWeight: "600", color: colors.text },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  phoneInput: { flex: 1 },
  otpInput: { letterSpacing: 8, fontSize: 20 },
  hint: { fontSize: 12, color: colors.muted, marginTop: 6 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  link: { color: colors.primary, textAlign: "center", marginTop: 16, fontSize: 14 },
  error: { color: colors.danger, marginTop: 16, textAlign: "center" },
});
