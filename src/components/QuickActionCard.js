import { Text, TouchableOpacity, View } from "react-native";

export default function QuickActionCard({ title, subtitle, badge, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      className="mb-3 rounded-3xl border border-surface-300 bg-white p-4"
      onPress={onPress}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-base font-bold text-ink-900">{title}</Text>
          <Text className="mt-2 text-sm leading-6 text-ink-500">{subtitle}</Text>
        </View>
        {badge ? (
          <View className="rounded-full bg-brand-100 px-3 py-1">
            <Text className="text-xs font-semibold text-brand-700">{badge}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
