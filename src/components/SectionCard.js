import { Text, View } from "react-native";

export default function SectionCard({ title, subtitle, children, rightLabel }) {
  return (
    <View className="mb-4 rounded-[28px] border border-surface-300 bg-surface-50 p-5 shadow-sm">
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-bold text-ink-900">{title}</Text>
          {subtitle ? (
            <Text className="mt-1 text-sm leading-6 text-ink-500">{subtitle}</Text>
          ) : null}
        </View>
        {rightLabel ? (
          <View className="rounded-full bg-brand-100 px-3 py-1">
            <Text className="text-xs font-semibold uppercase text-brand-700">
              {rightLabel}
            </Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}
