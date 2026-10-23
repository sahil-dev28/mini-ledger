import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Controller, useForm, type UseFormSetError } from "react-hook-form";
import { Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { z } from "zod";

import { DateField } from "@/components/date-field";
import { colors } from "@/lib/theme";

// same rules as the server so most mistakes are caught before the request
export const loanFormSchema = z.object({
  friendName: z.string().trim().min(1, "Enter a name").max(50, "Name is too long"),
  amount: z
    .string()
    .trim()
    .regex(/^\d+(\.\d{1,2})?$/, { error: "Enter a valid amount", abort: true })
    .refine((v) => Number(v) > 0, "Amount must be greater than 0")
    .refine((v) => Number(v) <= 10_000_000, "Amount is too large"),
  dueDate: z.date(),
  receipt: z.object({ uri: z.string(), name: z.string(), type: z.string() }).optional(),
});

export type LoanFormValues = z.infer<typeof loanFormSchema>;

type Props = {
  onSubmit: (values: LoanFormValues, setError: UseFormSetError<LoanFormValues>) => Promise<void>;
  onCancel: () => void;
  submitting: boolean;
  serverError?: string;
};

export function LoanForm({ onSubmit, onCancel, submitting, serverError }: Props) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoanFormValues>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: { friendName: "", amount: "", dueDate: new Date() },
  });

  async function pickImage(source: "camera" | "library") {
    if (source === "camera") {
      const { granted } = await ImagePicker.requestCameraPermissionsAsync();
      if (!granted) {
        Alert.alert("Camera permission is needed to take a photo");
        return null;
      }
    }

    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ["images"], quality: 0.6 };
    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled) return null;
    const asset = result.assets[0];
    return {
      uri: asset.uri,
      name: asset.fileName ?? "receipt.jpg",
      type: asset.mimeType ?? "image/jpeg",
    };
  }

  function chooseReceipt(onPicked: (file: LoanFormValues["receipt"]) => void) {
    const pick = async (source: "camera" | "library") => onPicked((await pickImage(source)) ?? undefined);
    // Alert buttons don't work on web, just open the file picker there
    if (Platform.OS === "web") {
      pick("library");
      return;
    }
    Alert.alert("Add receipt", undefined, [
      { text: "Take photo", onPress: () => pick("camera") },
      { text: "Choose from library", onPress: () => pick("library") },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  return (
    <View>
      <Text style={styles.label}>Friend&apos;s name</Text>
      <Controller
        control={control}
        name="friendName"
        render={({ field }) => (
          <TextInput
            style={styles.input}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder="Rahul"
            placeholderTextColor={colors.placeholder}
          />
        )}
      />
      {errors.friendName && <Text style={styles.error}>{errors.friendName.message}</Text>}

      <Text style={styles.label}>Amount (₹)</Text>
      <Controller
        control={control}
        name="amount"
        render={({ field }) => (
          <TextInput
            style={styles.input}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            placeholder="3000"
            placeholderTextColor={colors.placeholder}
            keyboardType="decimal-pad"
          />
        )}
      />
      {errors.amount && <Text style={styles.error}>{errors.amount.message}</Text>}

      <Text style={styles.label}>Due date</Text>
      <Controller
        control={control}
        name="dueDate"
        render={({ field }) => <DateField value={field.value} onChange={field.onChange} />}
      />
      {errors.dueDate && <Text style={styles.error}>{errors.dueDate.message}</Text>}

      <Text style={styles.label}>Receipt (optional)</Text>
      <Controller
        control={control}
        name="receipt"
        render={({ field }) =>
          field.value ? (
            <View style={styles.preview}>
              <Image source={{ uri: field.value.uri }} style={styles.thumb} contentFit="cover" />
              <Pressable onPress={() => field.onChange(undefined)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.photoBox} onPress={() => chooseReceipt(field.onChange)}>
              <Text style={styles.photoText}>📷  Add photo</Text>
            </Pressable>
          )
        }
      />

      {serverError && <Text style={[styles.error, styles.serverError]}>{serverError}</Text>}

      <Pressable
        style={[styles.button, submitting && styles.disabled]}
        onPress={handleSubmit((values) => onSubmit(values, setError))}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>{submitting ? "Saving..." : "Save"}</Text>
      </Pressable>
      <Pressable style={styles.cancel} onPress={onCancel} disabled={submitting}>
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, color: colors.muted, marginTop: 16, marginBottom: 6 },
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
  error: { color: colors.danger, fontSize: 13, marginTop: 4 },
  serverError: { marginTop: 16, textAlign: "center" },
  photoBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingVertical: 24,
    alignItems: "center",
  },
  photoText: { color: colors.muted, fontSize: 15 },
  preview: { flexDirection: "row", alignItems: "center", gap: 16 },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  remove: { color: colors.danger, fontSize: 14 },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 28,
  },
  disabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  cancel: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  cancelText: { color: colors.text, fontSize: 16 },
});
