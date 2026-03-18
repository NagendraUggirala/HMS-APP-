import { Text, View } from "react-native";

export default function StatsCard({
  label,
  value,
  accent = "bg-brand-500",
  helperText,
}) {
  return (
    <View className="mr-3 min-w-[120px] flex-1 rounded-3xl border border-surface-300 bg-white p-4">
      <View className={`mb-4 h-2 w-12 rounded-full ${accent}`} />
      <Text className="text-3xl font-bold text-ink-900">{value}</Text>
      <Text className="mt-2 text-sm text-ink-500">{label}</Text>
      {helperText ? (
        <Text className="mt-1 text-xs text-ink-500">{helperText}</Text>
      ) : null}
    </View>
  );
}
