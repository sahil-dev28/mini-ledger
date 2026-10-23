import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text } from "react-native";

import { formatDate, toYmd } from "@/lib/format";
import { colors } from "@/lib/theme";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export function DateField({ value, onChange }: Props) {
  const [showIosPicker, setShowIosPicker] = useState(false);

  function open() {
    // Android shows its own dialog, iOS needs the picker rendered inline
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value,
        mode: "date",
        onChange: (event, date) => {
          if (event.type === "set" && date) onChange(date);
        },
      });
    } else {
      setShowIosPicker((v) => !v);
    }
  }

  return (
    <>
      <Pressable style={styles.input} onPress={open}>
        <Text style={styles.text}>📅  {formatDate(toYmd(value))}</Text>
      </Pressable>
      {showIosPicker && (
        <DateTimePicker
          value={value}
          mode="date"
          display="inline"
          onChange={(_event, date) => {
            if (date) onChange(date);
            setShowIosPicker(false);
          }}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: { fontSize: 16, color: colors.text },
});
