import { toYmd } from "@/lib/format";
import { colors } from "@/lib/theme";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

// the native picker doesn't exist on web, so use the browser's date input
export function DateField({ value, onChange }: Props) {
  return (
    <input
      type="date"
      value={toYmd(value)}
      onChange={(e) => {
        if (!e.target.value) return;
        const [y, m, d] = e.target.value.split("-").map(Number);
        onChange(new Date(y, m - 1, d));
      }}
      style={{
        backgroundColor: colors.card,
        border: `1px solid ${colors.border}`,
        borderRadius: 10,
        padding: "12px 14px",
        fontSize: 16,
        color: colors.text,
        fontFamily: "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, sans-serif",
      }}
    />
  );
}
